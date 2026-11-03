-- Read roles from profiles instead of the JWT, and repair accounts created before the
-- schema existed. Safe to run more than once.

-- An earlier version wrote the role into app_metadata on sign-up; Supabase Auth can
-- overwrite that field, so it is no longer used.
drop trigger if exists on_auth_user_creating on auth.users;
drop function if exists public.set_new_user_role();

create or replace function public.handle_new_user()
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

-- Give every existing account without a profile one, using the role it signed up with.
insert into public.profiles (id, role, email, username)
select
  u.id,
  case when u.raw_user_meta_data ->> 'role' = 'employer' then 'employer'::public.user_role else 'worker'::public.user_role end,
  u.email,
  left(coalesce(nullif(trim(u.raw_user_meta_data ->> 'username'), ''), split_part(u.email, '@', 1)), 100)
from auth.users u
where u.email is not null
  and not exists (select 1 from public.profiles p where p.id = u.id);
