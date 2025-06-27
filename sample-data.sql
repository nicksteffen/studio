-- This script sets up the entire database schema and populates it with sample data.
-- 1. Run this entire script in your Supabase SQL Editor.
-- 2. Make sure you have created two users in the app via the sign-up page first.
-- 3. The script uses placeholder UUIDs for the sample users. 
--    You can find the real IDs in your Supabase dashboard (Authentication > Users) and replace them here before running.

-- =================================================================
-- TABLE CREATION
-- =================================================================

-- PROFILES table to store public user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  avatar_url text,
  updated_at timestamp with time zone
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING ( true );
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK ( auth.uid() = id );
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING ( auth.uid() = id );
-- After running, you may need to go to Database > Replication and enable replication for `profiles` on Supabase.


-- LISTS table
CREATE TABLE IF NOT EXISTS public.lists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see public lists." ON public.lists;
CREATE POLICY "Users can see public lists." ON public.lists FOR SELECT USING ( is_public = true );
DROP POLICY IF EXISTS "Users can view their own lists." ON public.lists;
CREATE POLICY "Users can view their own lists." ON public.lists FOR SELECT USING ( auth.uid() = user_id );
DROP POLICY IF EXISTS "Users can insert their own lists." ON public.lists;
CREATE POLICY "Users can insert their own lists." ON public.lists FOR INSERT WITH CHECK ( auth.uid() = user_id );
DROP POLICY IF EXISTS "Users can update their own lists." ON public.lists;
CREATE POLICY "Users can update their own lists." ON public.lists FOR UPDATE USING ( auth.uid() = user_id );

-- LIST ITEMS table
CREATE TABLE IF NOT EXISTS public.list_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id uuid NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text text,
  category text,
  completed boolean NOT NULL DEFAULT false,
  "position" integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view items on lists they can see." ON public.list_items;
CREATE POLICY "Users can view items on lists they can see." ON public.list_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM lists WHERE lists.id = list_items.list_id
  )
);
DROP POLICY IF EXISTS "Users can insert their own list items." ON public.list_items;
CREATE POLICY "Users can insert their own list items." ON public.list_items FOR INSERT WITH CHECK ( auth.uid() = user_id );
DROP POLICY IF EXISTS "Users can update their own list items." ON public.list_items;
CREATE POLICY "Users can update their own list items." ON public.list_items FOR UPDATE USING ( auth.uid() = user_id );
DROP POLICY IF EXISTS "Users can delete their own list items." ON public.list_items;
CREATE POLICY "Users can delete their own list items." ON public.list_items FOR DELETE USING ( auth.uid() = user_id );


-- =================================================================
-- SAMPLE DATA INSERTION
-- =================================================================

-- IMPORTANT: Replace these UUIDs with the actual `id` values for the users you created in your app.
-- Jessica's user ID: 74e6ea39-1011-4f77-b15a-709b33963a94
-- Ben's user ID: bf9e9dd1-0257-4e05-a83c-cd0d043ef47b

-- Create profiles for sample users
INSERT INTO public.profiles (id, username, avatar_url)
VALUES
    ('74e6ea39-1011-4f77-b15a-709b33963a94', 'Jessica L.', 'https://placehold.co/100x100.png'),
    ('bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', 'Ben H.', 'https://placehold.co/100x100.png')
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    avatar_url = EXCLUDED.avatar_url;

-- Create lists for sample users
WITH jessica_list AS (
  INSERT INTO public.lists (user_id, title, is_public)
  VALUES ('74e6ea39-1011-4f77-b15a-709b33963a94', 'Jessica''s Adventures Before 30', true)
  ON CONFLICT (user_id) DO UPDATE SET title = EXCLUDED.title
  RETURNING id
), ben_list AS (
  INSERT INTO public.lists (user_id, title, is_public)
  VALUES ('bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', 'Ben''s Growth & Goals List', true)
  ON CONFLICT (user_id) DO UPDATE SET title = EXCLUDED.title
  RETURNING id
)
-- Insert list items for Jessica and Ben
INSERT INTO public.list_items (list_id, user_id, text, completed, category, "position")
SELECT id, '74e6ea39-1011-4f77-b15a-709b33963a94', 'Hike the Inca Trail to Machu Picchu', true, 'Adventure', 0 FROM jessica_list
UNION ALL
SELECT id, '74e6ea39-1011-4f77-b15a-709b33963a94', 'Take a cooking class in Thailand', false, 'Food', 1 FROM jessica_list
UNION ALL
SELECT id, '74e6ea39-1011-4f77-b15a-709b33963a94', 'See the Northern Lights', false, 'Travel', 2 FROM jessica_list
UNION ALL
SELECT id, 'bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', 'Get a professional certification', true, 'Career', 0 FROM ben_list
UNION ALL
SELECT id, 'bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', 'Read 50 books in one year', true, 'Skills', 1 FROM ben_list
UNION ALL
SELECT id, 'bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', 'Start a side hustle', false, 'Finance', 2 FROM ben_list
ON CONFLICT (id) DO NOTHING;
