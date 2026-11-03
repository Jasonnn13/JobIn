-- Public employer profiles, profile statistics, work history, and two-way reviews.
-- Same security model as the init migration: RLS for rows, column grants for writes,
-- security definer functions for anything that crosses tables.

-- When an application was decided -----------------------------------------------
-- Powers "hires per month" and how quickly an employer responds.

alter table public.applications add column decided_at timestamptz;

update public.applications
set decided_at = applied_at + interval '1 day'
where status <> 'pending' and decided_at is null;

create function public.set_application_decided_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    new.decided_at := case when new.status = 'pending' then null else now() end;
  end if;
  return new;
end;
$$;

create trigger applications_set_decided_at
  before update on public.applications
  for each row execute function public.set_application_decided_at();

-- Work history (entries the worker adds; JobIn hires are listed separately) ------

create table public.work_history (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null default auth.uid() references public.profiles on delete cascade,
  role text not null check (char_length(role) between 2 and 100),
  employer text not null default '' check (char_length(employer) <= 100),
  start_year integer not null check (start_year between 1950 and 2100),
  end_year integer check (end_year is null or end_year >= start_year),
  description text not null default '' check (char_length(description) <= 500),
  created_at timestamptz not null default now()
);

create index work_history_profile_id_idx on public.work_history (profile_id);

alter table public.work_history enable row level security;
revoke all on public.work_history from anon, authenticated;
grant select, delete on public.work_history to authenticated;
grant insert (role, employer, start_year, end_year, description) on public.work_history to authenticated;
grant update (role, employer, start_year, end_year, description) on public.work_history to authenticated;

create policy "work_history: read own or my applicants"
  on public.work_history for select to authenticated
  using (profile_id = (select auth.uid()) or public.applied_to_my_job(profile_id::text));

create policy "work_history: add own"
  on public.work_history for insert to authenticated
  with check (profile_id = (select auth.uid()));

create policy "work_history: edit own"
  on public.work_history for update to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

create policy "work_history: delete own"
  on public.work_history for delete to authenticated
  using (profile_id = (select auth.uid()));

-- Reviews: both sides of an accepted hire can review each other once ----------------

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications on delete cascade,
  reviewer_id uuid not null default auth.uid() references public.profiles on delete cascade,
  -- Set by the trigger below, never by the client.
  reviewee_id uuid not null references public.profiles on delete cascade,
  reviewer_name text not null default '',
  job_title text not null default '',
  rating integer not null check (rating between 1 and 5),
  comment text not null default '' check (char_length(comment) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (application_id, reviewer_id)
);

create index reviews_reviewee_id_idx on public.reviews (reviewee_id);

-- Works out who is being reviewed from the hire itself, so a review can only ever be
-- about the other person in a real, accepted application.
create function public.set_review_parties()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  v_applicant uuid;
  v_employer uuid;
  v_status public.application_status;
  v_title text;
begin
  select a.applicant_id, j.employer_id, a.status, j.title
    into v_applicant, v_employer, v_status, v_title
  from public.applications a
  join public.jobs j on j.id = a.job_id
  where a.id = new.application_id;

  if v_status is distinct from 'accepted' then
    raise exception 'Reviews are only possible after a hire' using errcode = '42501';
  end if;

  if new.reviewer_id = v_applicant then
    new.reviewee_id := v_employer;
  elsif new.reviewer_id = v_employer then
    new.reviewee_id := v_applicant;
  else
    raise exception 'Only the people in this hire can review it' using errcode = '42501';
  end if;

  new.job_title := v_title;
  select username into new.reviewer_name from public.profiles where id = new.reviewer_id;
  return new;
end;
$$;

create trigger reviews_set_parties
  before insert on public.reviews
  for each row execute function public.set_review_parties();

create trigger reviews_touch_updated_at
  before update on public.reviews
  for each row execute function public.touch_updated_at();

alter table public.reviews enable row level security;
revoke all on public.reviews from anon, authenticated;
grant select, delete on public.reviews to authenticated;
grant insert (application_id, rating, comment) on public.reviews to authenticated;
grant update (rating, comment) on public.reviews to authenticated;

-- Reviews are public reputation: anyone signed in can read them.
create policy "reviews: signed-in users read"
  on public.reviews for select to authenticated
  using (true);

create policy "reviews: write as yourself"
  on public.reviews for insert to authenticated
  with check (reviewer_id = (select auth.uid()));

create policy "reviews: edit own"
  on public.reviews for update to authenticated
  using (reviewer_id = (select auth.uid()))
  with check (reviewer_id = (select auth.uid()));

create policy "reviews: delete own"
  on public.reviews for delete to authenticated
  using (reviewer_id = (select auth.uid()));

-- Public employer profiles ---------------------------------------------------------
-- Only the business-facing fields; an employer's email and phone stay private.

create function public.employer_public_profile(p_employer uuid)
returns table (id uuid, username text, location text, description text, photo_path text, member_since timestamptz)
language sql stable
security definer set search_path = ''
as $$
  select p.id, p.username, p.location, p.description, p.photo_path, p.created_at
  from public.profiles p
  where p.id = p_employer and p.role = 'employer'
$$;

create function public.is_employer(p_user text)
returns boolean
language sql stable
security definer set search_path = ''
as $$ select exists (select 1 from public.profiles where id::text = p_user and role = 'employer') $$;

-- Employer logos are visible to every signed-in user, like the rest of the public profile.
create policy "avatars: employer logos readable"
  on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and public.is_employer((storage.foldername(name))[1]));

-- Statistics --------------------------------------------------------------------
-- Monthly series cover the last six months, oldest first, with zero-filled gaps.

create function public.employer_stats(p_employer uuid)
returns jsonb
language sql stable
security definer set search_path = ''
as $$
  with employer_jobs as (
    select id, status from public.jobs where employer_id = p_employer
  ),
  apps as (
    select a.status, a.applied_at, a.decided_at
    from public.applications a
    where a.job_id in (select id from employer_jobs)
  ),
  months as (
    select generate_series(date_trunc('month', now()) - interval '5 months', date_trunc('month', now()), interval '1 month') as m
  )
  select jsonb_build_object(
    'jobs_total', (select count(*) from employer_jobs),
    'jobs_open', (select count(*) from employer_jobs where status = 'open'),
    'applications_total', (select count(*) from apps),
    'hires_total', (select count(*) from apps where status = 'accepted'),
    'decided_total', (select count(*) from apps where status <> 'pending'),
    'avg_response_days', (
      select round((avg(extract(epoch from decided_at - applied_at)) / 86400)::numeric, 1)
      from apps where decided_at is not null
    ),
    'rating_avg', (select round(avg(rating)::numeric, 1) from public.reviews where reviewee_id = p_employer),
    'rating_count', (select count(*) from public.reviews where reviewee_id = p_employer),
    'by_month', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'month', to_char(m, 'YYYY-MM'),
        'value', (select count(*) from apps where status = 'accepted' and date_trunc('month', coalesce(decided_at, applied_at)) = m)
      ) order by m), '[]'::jsonb)
      from months
    )
  )
  where exists (select 1 from public.profiles where id = p_employer and role = 'employer')
$$;

-- Only the worker, or an employer they applied to, may see these.
create function public.worker_stats(p_worker uuid)
returns jsonb
language plpgsql stable
security definer set search_path = ''
as $$
begin
  if p_worker is distinct from auth.uid() and not public.applied_to_my_job(p_worker::text) then
    return null;
  end if;
  return (
    with apps as (
      select status, applied_at from public.applications where applicant_id = p_worker
    ),
    months as (
      select generate_series(date_trunc('month', now()) - interval '5 months', date_trunc('month', now()), interval '1 month') as m
    )
    select jsonb_build_object(
      'applications_total', (select count(*) from apps),
      'accepted', (select count(*) from apps where status = 'accepted'),
      'rejected', (select count(*) from apps where status = 'rejected'),
      'pending', (select count(*) from apps where status = 'pending'),
      'rating_avg', (select round(avg(rating)::numeric, 1) from public.reviews where reviewee_id = p_worker),
      'rating_count', (select count(*) from public.reviews where reviewee_id = p_worker),
      'by_month', (
        select coalesce(jsonb_agg(jsonb_build_object(
          'month', to_char(m, 'YYYY-MM'),
          'value', (select count(*) from apps where date_trunc('month', applied_at) = m)
        ) order by m), '[]'::jsonb)
        from months
      )
    )
  );
end;
$$;

-- Jobs the worker was hired for through JobIn (verified history). Same access rule.
create function public.worker_job_history(p_worker uuid)
returns table (application_id uuid, job_title text, employer_name text, employer_id uuid, hired_at timestamptz)
language plpgsql stable
security definer set search_path = ''
as $$
begin
  if p_worker is distinct from auth.uid() and not public.applied_to_my_job(p_worker::text) then
    return;
  end if;
  return query
    select a.id, j.title, j.employer_name, j.employer_id, coalesce(a.decided_at, a.applied_at)
    from public.applications a
    join public.jobs j on j.id = a.job_id
    where a.applicant_id = p_worker and a.status = 'accepted'
    order by 5 desc;
end;
$$;

-- New functions are executable by PUBLIC by default; lock them to signed-in users.
revoke execute on function
  public.set_application_decided_at(),
  public.set_review_parties(),
  public.employer_public_profile(uuid),
  public.is_employer(text),
  public.employer_stats(uuid),
  public.worker_stats(uuid),
  public.worker_job_history(uuid)
from public, anon;

grant execute on function
  public.employer_public_profile(uuid),
  public.is_employer(text),
  public.employer_stats(uuid),
  public.worker_stats(uuid),
  public.worker_job_history(uuid)
to authenticated;
