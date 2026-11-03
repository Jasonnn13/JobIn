-- Starter courses. Images ship in Jobin's public/ folder.
-- Safe to re-run: a course is only added if none with the same title exists.

insert into public.courses (title, category, level, duration, image_url, description, author, rating, lessons)
select v.title, v.category, v.level, v.duration, v.image_url, v.description, v.author, v.rating, v.lessons::jsonb
from (values
  (
    'Construction site safety basics', 'Construction', 'Beginner', '2 hours', '/construction-course.png',
    'Protective gear, safe lifting, working at height, and what to do when something goes wrong on site.',
    'JobIn Training Team', 4.7,
    '[{"title":"Protective gear and why it matters"},{"title":"Lifting without injury"},{"title":"Ladders and scaffolding"},{"title":"Reporting accidents"}]'
  ),
  (
    'English for daily work', 'Communication', 'Beginner', '3 hours', '/english-course.png',
    'Simple English for greeting customers, understanding instructions, and talking about your work.',
    'JobIn Training Team', 4.6,
    '[{"title":"Greetings and introductions"},{"title":"Understanding instructions"},{"title":"Numbers, time, and money"},{"title":"Talking about your skills"}]'
  ),
  (
    'Workplace etiquette', 'Communication', 'Beginner', '1 hour', '/etiquette-course.png',
    'Being on time, talking with employers, and handling disagreements calmly.',
    'JobIn Training Team', 4.5,
    '[{"title":"Arriving on time"},{"title":"Talking with your employer"},{"title":"Handling problems calmly"}]'
  ),
  (
    'Home appliance repair', 'Repairs', 'Intermediate', '4 hours', '/repair-course.png',
    'Find and fix common problems with fans, rice cookers, and small electronics, safely.',
    'JobIn Training Team', 4.8,
    '[{"title":"Electrical safety first"},{"title":"Using a multimeter"},{"title":"Fixing fans and rice cookers"},{"title":"When to stop and call a specialist"}]'
  ),
  (
    'Sewing and garment repair', 'Tailoring', 'Beginner', '3 hours', '/sewing-course.png',
    'Hand and machine stitches, hemming, and repairing tears so clothes last longer.',
    'JobIn Training Team', 4.6,
    '[{"title":"Basic hand stitches"},{"title":"Setting up a sewing machine"},{"title":"Hemming trousers and skirts"},{"title":"Repairing tears and buttons"}]'
  )
) as v(title, category, level, duration, image_url, description, author, rating, lessons)
where not exists (select 1 from public.courses c where c.title = v.title);
