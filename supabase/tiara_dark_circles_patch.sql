-- Patch: tag existing posts with dark circles concern
-- Run in Supabase SQL Editor

-- Tag the three dark-circles posts that were seeded in mockData
UPDATE tiara_posts
SET tags = '["Dark circles", "Under-eye", "Pigmentation", "South Asian skin"]'::jsonb
WHERE id = 'post-dc-001';

UPDATE tiara_posts
SET tags = '["Dark circles", "Eye serum", "Honest review", "The Ordinary"]'::jsonb
WHERE id = 'post-dc-002';

UPDATE tiara_posts
SET tags = '["Dark circles", "South Asian skin", "Rec request", "Pigmentation"]'::jsonb
WHERE id = 'post-dc-003';

-- Verify
SELECT id, title, tags FROM tiara_posts WHERE tags::text ILIKE '%dark circle%';
