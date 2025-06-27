-- This file contains sample SQL to populate your database with
-- public lists for the "Browse" page.
--
-- Instructions:
-- 1. Run the "CREATE TABLE" and "RLS" statements below in your Supabase SQL Editor
--    to create the 'profiles' table and enable read access.
-- 2. Use the "Sign Up" page in your application to create 2-3 sample user accounts.
-- 3. Go to your Supabase Dashboard > Authentication > Users to find the UUIDs for your new users.
-- 4. Replace the placeholder UUIDs in the INSERT statements below (e.g., '<user_id_of_jessica>')
--    with the actual UUIDs from your dashboard.
-- 5. Run the INSERT statements in your Supabase SQL Editor.

-- Step 1: Create the profiles table to store public user data
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  avatar_url text
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

-- After creating the table, go to Supabase > Database > Replication and enable replication for the `profiles` table.

-- Step 2 & 3: Create users in the app, then get their IDs from the Supabase Dashboard.

-- Step 4 & 5: Replace placeholders and run the INSERTS.

-- Let's assume you created two users: Jessica (jessica@example.com) and Ben (ben@example.com)

-- Profile for Jessica
INSERT INTO public.profiles (id, username, avatar_url)
VALUES ('<user_id_of_jessica>', 'Jessica L.', 'https://placehold.co/100x100.png');

-- Profile for Ben
INSERT INTO public.profiles (id, username, avatar_url)
VALUES ('<user_id_of_ben>', 'Ben H.', 'https://placehold.co/100x100.png');


-- Create a public list for Jessica
WITH jessica_list AS (
  INSERT INTO public.lists (user_id, title, is_public)
  VALUES ('<user_id_of_jessica>', 'Jessica''s Adventures Before 30', true)
  RETURNING id
)
INSERT INTO public.list_items (list_id, user_id, text, completed, "position", category)
VALUES
  ((SELECT id FROM jessica_list), '<user_id_of_jessica>', 'Hike the Inca Trail to Machu Picchu', true, 0, 'Adventure'),
  ((SELECT id FROM jessica_list), '<user_id_of_jessica>', 'Take a cooking class in Thailand', false, 1, 'Food'),
  ((SELECT id FROM jessica_list), '<user_id_of_jessica>', 'See the Northern Lights', false, 2, 'Travel');

-- Create a public list for Ben
WITH ben_list AS (
  INSERT INTO public.lists (user_id, title, is_public)
  VALUES ('<user_id_of_ben>', 'My Growth & Goals List', true)
  RETURNING id
)
INSERT INTO public.list_items (list_id, user_id, text, completed, "position", category)
VALUES
  ((SELECT id FROM ben_list), '<user_id_of_ben>', 'Get a professional certification', true, 0, 'Career'),
  ((SELECT id FROM ben_list), '<user_id_of_ben>', 'Read 50 books in one year', true, 1, 'Skills'),
  ((SELECT id FROM ben_list), '<user_id_of_ben>', 'Start a side hustle', false, 2, 'Finance');
