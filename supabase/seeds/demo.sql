-- Demo accounts, jobs, and applications for testing. Safe to re-run.
-- Every demo account uses the password: JobinDemo2026!
--   Worker   (log in on JobIn):   demo.worker@jobin.test
--   Employer (log in on JobHire): demo.employer@jobin.test
--   A second employer (demo.employer2@jobin.test) owns some jobs so listings look varied.
-- To remove all of it: delete from auth.users where email like 'demo.%@jobin.test';
-- (profiles, jobs, and applications cascade).

-- Accounts --------------------------------------------------------------------
-- Token columns must be '' rather than NULL, or Supabase Auth can't load the user at login.

with demo (id, email, username, role) as (
  values
    ('11111111-1111-4111-8111-111111111111'::uuid, 'demo.worker@jobin.test', 'Budi Santoso', 'worker'),
    ('22222222-2222-4222-8222-222222222222'::uuid, 'demo.employer@jobin.test', 'Maju Jaya Konstruksi', 'employer'),
    ('33333333-3333-4333-8333-333333333333'::uuid, 'demo.employer2@jobin.test', 'Rumah Sari Services', 'employer')
)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
)
select
  '00000000-0000-0000-0000-000000000000', d.id, 'authenticated', 'authenticated', d.email,
  extensions.crypt('JobinDemo2026!', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', jsonb_build_object('username', d.username, 'role', d.role),
  now(), now(), '', '', '', '', '', '', '', ''
from demo d
on conflict do nothing;

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id, u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email', now(), now(), now()
from auth.users u
where u.email like 'demo.%@jobin.test'
on conflict do nothing;

-- The sign-up trigger already created the profiles; fill in the details.
update public.profiles set
  occupation = 'Construction worker and house painter',
  location = 'Jakarta Selatan',
  phone = '+6281234567890',
  skills = '{Construction,Painting,Repairs}',
  experience = '5 years on residential building sites: bricklaying, plastering, and interior painting.',
  description = 'Reliable and on time. I have my own basic tools and can start this week.'
where id = '11111111-1111-4111-8111-111111111111';

update public.profiles set
  location = 'Jakarta Selatan',
  phone = '+6281298765432',
  description = 'Small construction firm building and renovating homes across South Jakarta and Depok.'
where id = '22222222-2222-4222-8222-222222222222';

update public.profiles set
  location = 'Bandung',
  phone = '+6282211223344',
  description = 'Household services and catering for families and small offices in Bandung and Bekasi.'
where id = '33333333-3333-4333-8333-333333333333';

-- Jobs ------------------------------------------------------------------------
-- No image_path: the app shows a picture for the job's category instead.

insert into public.jobs (id, employer_id, title, category, location, pay, description, status, posted_at)
values
  ('a0000000-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222',
   'Construction helper', 'builder', 'Jakarta Selatan', 'Rp 180,000/day',
   'Help our team build a two-storey house: mixing cement, carrying materials, and keeping the site tidy. 08:00–17:00, lunch provided.',
   'open', now() - interval '1 day'),
  ('a0000000-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222',
   'Bricklayer for house renovation', 'builder', 'Depok', 'Rp 220,000/day',
   'Rebuild interior walls and a rear extension. At least 2 years of bricklaying experience. About 3 weeks of work.',
   'open', now() - interval '2 days'),
  ('a0000000-0000-4000-8000-000000000003', '22222222-2222-4222-8222-222222222222',
   'House painter', 'builder', 'Jakarta Selatan', 'Rp 170,000/day',
   'Interior and exterior painting for a renovated home. Paint and equipment provided. 2 weeks.',
   'open', now() - interval '3 days'),
  ('a0000000-0000-4000-8000-000000000004', '22222222-2222-4222-8222-222222222222',
   'AC technician', 'technician', 'Jakarta Barat', 'Rp 250,000/day',
   'Install and service split air conditioners in new homes. Must know basic electrical safety.',
   'open', now() - interval '4 days'),
  ('a0000000-0000-4000-8000-000000000005', '22222222-2222-4222-8222-222222222222',
   'Pickup truck driver', 'driver', 'Jakarta Selatan', 'Rp 4,800,000/month',
   'Deliver building materials between our warehouse and sites. SIM A required. Monday to Saturday.',
   'open', now() - interval '5 days'),
  ('a0000000-0000-4000-8000-000000000006', '33333333-3333-4333-8333-333333333333',
   'Live-out housekeeper', 'housekeeping', 'Bandung', 'Rp 3,200,000/month',
   'Cleaning, laundry, and light cooking for a family of four. 07:00–15:00, Monday to Friday.',
   'open', now() - interval '1 day'),
  ('a0000000-0000-4000-8000-000000000007', '33333333-3333-4333-8333-333333333333',
   'Catering cook', 'cook', 'Bandung', 'Rp 160,000/day',
   'Prepare lunch boxes for office catering, about 150 portions a day. Experience with Indonesian home cooking.',
   'open', now() - interval '2 days'),
  ('a0000000-0000-4000-8000-000000000008', '33333333-3333-4333-8333-333333333333',
   'Uniform tailor', 'tailor', 'Bekasi', 'Rp 3,500,000/month',
   'Sew and alter school uniforms in our workshop. Sewing machine provided; must be able to read a size chart.',
   'open', now() - interval '6 days'),
  ('a0000000-0000-4000-8000-000000000009', '33333333-3333-4333-8333-333333333333',
   'Market stall assistant', 'vendor', 'Bandung', 'Rp 120,000/day',
   'Serve customers and handle cash at our snack stall in Pasar Kosambi. 06:00–13:00.',
   'open', now() - interval '3 days'),
  ('a0000000-0000-4000-8000-000000000010', '33333333-3333-4333-8333-333333333333',
   'Office admin assistant', 'admin', 'Bekasi', 'Rp 4,000,000/month',
   'Answer calls, record orders, and keep simple spreadsheets. This position has been filled.',
   'closed', now() - interval '14 days')
on conflict (id) do nothing;

-- Applications: one of each status, so testers see every state ------------------

insert into public.applications (job_id, applicant_id, status, applied_at)
values
  ('a0000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'pending', now() - interval '12 hours'),
  ('a0000000-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'accepted', now() - interval '2 days'),
  ('a0000000-0000-4000-8000-000000000010', '11111111-1111-4111-8111-111111111111', 'rejected', now() - interval '10 days')
on conflict (job_id, applicant_id) do nothing;
