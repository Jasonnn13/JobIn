-- JobIn + JobHire schema. Both apps share this one Supabase project.
-- Security model: the browser talks to the database directly, so every rule lives here:
-- row-level security decides which rows a user sees, and column grants decide which
-- columns they may write. Anything not granted below is denied.

-- Types ---------------------------------------------------------------------

create type public.user_role as enum ('worker', 'employer');
create type public.job_status as enum ('open', 'closed');
create type public.application_status as enum ('pending', 'accepted', 'rejected');

-- Profiles ------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  -- Chosen once at sign-up (JobIn = worker, JobHire = employer); users cannot change it.
  role public.user_role not null,
  email text not null,
  username text not null check (char_length(username) between 1 and 100),
  phone text check (phone ~ '^\+?[0-9]{10,15}$'),
  occupation text check (char_length(occupation) <= 100),
  location text check (char_length(location) <= 100),
  description text check (char_length(description) <= 1000),
  experience text check (char_length(experience) <= 500),
  skills text[] not null default '{}' check (cardinality(skills) <= 20),
  -- Path inside the private "avatars" bucket; must sit in the user's own folder.
  photo_path text check (photo_path is null or photo_path like id::text || '/%'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The role comes from the app the person signed up on and is fixed from then on:
-- profiles.role is the source of truth (apps read it through my_role()), and no one
-- can update it because the column is never granted.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, role, email, username)
  values (
    new.id,
    case when new.raw_user_meta_data ->> 'role' = 'employer' then 'employer'::public.user_role else 'worker'::public.user_role end,
    new.email,
    left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'username'), ''), split_part(new.email, '@', 1)), 100)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Jobs ----------------------------------------------------------------------

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null default auth.uid() references public.profiles on delete cascade,
  -- Copied from the employer's profile by a trigger, never sent by the client.
  employer_name text not null default '',
  title text not null check (char_length(title) between 2 and 120),
  category text not null check (category in ('tailor', 'builder', 'driver', 'housekeeping', 'vendor', 'technician', 'cook', 'admin')),
  location text not null default '' check (char_length(location) <= 120),
  pay text not null default '' check (char_length(pay) <= 60),
  description text not null default '' check (char_length(description) <= 2000),
  -- Path inside the public "job-images" bucket, in the employer's own folder.
  image_path text check (image_path is null or image_path like employer_id::text || '/%'),
  status public.job_status not null default 'open',
  posted_at timestamptz not null default now()
);

create index jobs_employer_id_idx on public.jobs (employer_id);
create index jobs_open_idx on public.jobs (posted_at desc) where status = 'open';

create function public.set_job_employer_name()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  select username into new.employer_name from public.profiles where id = new.employer_id;
  return new;
end;
$$;

create trigger jobs_set_employer_name
  before insert on public.jobs
  for each row execute function public.set_job_employer_name();

-- Applications --------------------------------------------------------------

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs on delete cascade,
  applicant_id uuid not null default auth.uid() references public.profiles on delete cascade,
  status public.application_status not null default 'pending',
  applied_at timestamptz not null default now(),
  unique (job_id, applicant_id)
);

create index applications_job_id_idx on public.applications (job_id);

-- Courses (managed from the Supabase dashboard; read-only for app users) -----

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'General',
  level text not null default 'Beginner' check (level in ('Beginner', 'Intermediate', 'Advanced')),
  duration text not null default '',
  image_url text not null default '/empty-image.jpg',
  description text not null default '',
  author text,
  rating numeric(2, 1) check (rating between 0 and 5),
  -- [{ "title": "..." }, ...]
  lessons jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- Rate limits (used by the AI and speech API routes) -------------------------

create table public.rate_limits (
  user_id uuid not null references auth.users on delete cascade,
  bucket text not null,
  window_start timestamptz not null,
  count integer not null default 0,
  primary key (user_id, bucket, window_start)
);

-- Counts one call for the signed-in user; returns false once the window's limit is passed.
create function public.consume_rate_limit(p_bucket text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_window timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_count integer;
begin
  if v_user is null or p_window_seconds <= 0 then
    return false;
  end if;
  insert into public.rate_limits as r (user_id, bucket, window_start, count)
  values (v_user, p_bucket, v_window, 1)
  on conflict (user_id, bucket, window_start) do update set count = r.count + 1
  returning r.count into v_count;
  delete from public.rate_limits where user_id = v_user and window_start < now() - interval '1 day';
  return v_count <= p_limit;
end;
$$;

-- Policy helpers ------------------------------------------------------------
-- Security definer so policies on one table can check another without recursing
-- through that table's own policies.

create function public.my_role()
returns public.user_role
language sql stable
security definer set search_path = ''
as $$ select role from public.profiles where id = auth.uid() $$;

create function public.owns_job(p_job uuid)
returns boolean
language sql stable
security definer set search_path = ''
as $$ select exists (select 1 from public.jobs where id = p_job and employer_id = auth.uid()) $$;

create function public.applied_to_job(p_job uuid)
returns boolean
language sql stable
security definer set search_path = ''
as $$ select exists (select 1 from public.applications where job_id = p_job and applicant_id = auth.uid()) $$;

-- True when p_user applied to one of the signed-in employer's jobs. Takes text so the
-- storage policy can pass a folder name without a cast that could fail.
create function public.applied_to_my_job(p_user text)
returns boolean
language sql stable
security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.applications a
    join public.jobs j on j.id = a.job_id
    where a.applicant_id::text = p_user and j.employer_id = auth.uid()
  )
$$;

-- Only signed-in users may call functions; anon gets nothing.
revoke execute on all functions in schema public from public, anon;
grant execute on function
  public.consume_rate_limit(text, integer, integer),
  public.my_role(),
  public.owns_job(uuid),
  public.applied_to_job(uuid),
  public.applied_to_my_job(text)
to authenticated;

-- Row-level security ----------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.courses enable row level security;
alter table public.rate_limits enable row level security; -- no policies: only consume_rate_limit touches it

-- Start from nothing, then grant exactly what the apps need.
revoke all on public.profiles, public.jobs, public.applications, public.courses, public.rate_limits from anon, authenticated;

-- Profiles: you see yourself; an employer sees the people who applied to their jobs.
grant select on public.profiles to authenticated;
grant update (username, phone, occupation, location, description, experience, skills, photo_path)
  on public.profiles to authenticated;

create policy "profiles: read own or my applicants"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.applied_to_my_job(id::text));

create policy "profiles: update own"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Jobs: everyone signed in sees open jobs; employers also see their own; workers also
-- see jobs they applied to, even after they close.
grant select on public.jobs to authenticated;
grant insert (title, category, location, pay, description, image_path) on public.jobs to authenticated;
grant update (title, category, location, pay, description, image_path, status) on public.jobs to authenticated;
grant delete on public.jobs to authenticated;

create policy "jobs: read open, own, or applied"
  on public.jobs for select to authenticated
  using (status = 'open' or employer_id = (select auth.uid()) or public.applied_to_job(id));

create policy "jobs: employers create their own"
  on public.jobs for insert to authenticated
  with check (employer_id = (select auth.uid()) and public.my_role() = 'employer');

create policy "jobs: owner updates"
  on public.jobs for update to authenticated
  using (employer_id = (select auth.uid()))
  with check (employer_id = (select auth.uid()));

create policy "jobs: owner deletes"
  on public.jobs for delete to authenticated
  using (employer_id = (select auth.uid()));

-- Applications: a worker applies only as themselves (status always starts as pending,
-- since they can only write job_id); only the job's owner can change the status.
grant select on public.applications to authenticated;
grant insert (job_id) on public.applications to authenticated;
grant update (status) on public.applications to authenticated;

create policy "applications: read own or for my jobs"
  on public.applications for select to authenticated
  using (applicant_id = (select auth.uid()) or public.owns_job(job_id));

create policy "applications: workers apply to open jobs"
  on public.applications for insert to authenticated
  with check (
    applicant_id = (select auth.uid())
    and public.my_role() = 'worker'
    and exists (select 1 from public.jobs j where j.id = job_id and j.status = 'open')
  );

create policy "applications: job owner decides"
  on public.applications for update to authenticated
  using (public.owns_job(job_id))
  with check (public.owns_job(job_id));

-- Courses: read-only.
grant select on public.courses to authenticated;

create policy "courses: signed-in users read"
  on public.courses for select to authenticated
  using (true);

-- Storage -------------------------------------------------------------------
-- Size and type limits are enforced by Storage itself, not by the browser.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', false, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('job-images', 'job-images', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Avatars are private: the owner, and employers they applied to, get signed URLs.
create policy "avatars: read own or my applicants"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'avatars'
    and ((storage.foldername(name))[1] = (select auth.uid())::text
      or public.applied_to_my_job((storage.foldername(name))[1]))
  );

create policy "avatars: write own folder"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatars: update own folder"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatars: delete own folder"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Job images are public to read; only employers write, and only into their own folder.
create policy "job-images: employers write own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'job-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and public.my_role() = 'employer'
  );

create policy "job-images: employers update own folder"
  on storage.objects for update to authenticated
  using (bucket_id = 'job-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "job-images: employers delete own folder"
  on storage.objects for delete to authenticated
  using (bucket_id = 'job-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
