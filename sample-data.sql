-- Sample Data for Before30Bucket
--
-- INSTRUCTIONS:
-- 1. Make sure you have created user accounts for the IDs below in your app.
-- 2. Go to the "My List" page for each user at least once. This will automatically create a list for them.
-- 3. Run this entire SQL script in the Supabase SQL Editor.
--

-- 1. Update User Profiles
--    This step gives your sample users a public username. The profile row is created automatically on signup.
UPDATE public.profiles
SET username = 'Jessica L.'
WHERE id = '74e6ea39-1011-4f77-b15a-709b33963a94';

UPDATE public.profiles
SET username = 'Ben H.'
WHERE id = 'bf9e9dd1-0257-4e05-a83c-cd0d043ef47b';

-- 2. Update Lists to be Public and Titled
--    This makes the auto-created lists visible on the "Browse" page.
UPDATE public.lists
SET is_public = true, title = 'Jessica''s Adventures Before 30'
WHERE user_id = '74e6ea39-1011-4f77-b15a-709b33963a94';

UPDATE public.lists
SET is_public = true, title = 'Ben''s Growth & Goals List'
WHERE user_id = 'bf9e9dd1-0257-4e05-a83c-cd0d043ef47b';

-- 3. Add Items to the Lists
--    This populates the lists with sample data.
--
-- Add items for Jessica
INSERT INTO public.list_items (list_id, user_id, text, completed, category, "position")
SELECT id, '74e6ea39-1011-4f77-b15a-709b33963a94', 'Hike the Inca Trail to Machu Picchu', true, 'Adventure', 0 FROM public.lists WHERE user_id = '74e6ea39-1011-4f77-b15a-709b33963a94';

INSERT INTO public.list_items (list_id, user_id, text, completed, category, "position")
SELECT id, '74e6ea39-1011-4f77-b15a-709b33963a94', 'Take a cooking class in Thailand', false, 'Food', 1 FROM public.lists WHERE user_id = '74e6ea39-1011-4f77-b15a-709b33963a94';

INSERT INTO public.list_items (list_id, user_id, text, completed, category, "position")
SELECT id, '74e6ea39-1011-4f77-b15a-709b33963a94', 'See the Northern Lights', false, 'Travel', 2 FROM public.lists WHERE user_id = '74e6ea39-1011-4f77-b15a-709b33963a94';

-- Add items for Ben
INSERT INTO public.list_items (list_id, user_id, text, completed, category, "position")
SELECT id, 'bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', 'Get a professional certification', true, 'Career', 0 FROM public.lists WHERE user_id = 'bf9e9dd1-0257-4e05-a83c-cd0d043ef47b';

INSERT INTO public.list_items (list_id, user_id, text, completed, category, "position")
SELECT id, 'bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', 'Read 50 books in one year', true, 'Skills', 1 FROM public.lists WHERE user_id = 'bf9e9dd1-0257-4e05-a83c-cd0d043ef47b';

INSERT INTO public.list_items (list_id, user_id, text, completed, category, "position")
SELECT id, 'bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', 'Start a side hustle', false, 'Finance', 2 FROM public.lists WHERE user_id = 'bf9e9dd1-0257-4e05-a83c-cd0d043ef47b';
