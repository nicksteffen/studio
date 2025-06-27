-- This script sets up the entire database schema, including tables,
-- custom types, and row-level security policies. It also populates the
-- database with sample data for two users, Ben and Jessica.
-- It is designed to be idempotent, meaning it can be run multiple times
-- without causing errors.

-- 1. Create a custom ENUM type for list item categories if it doesn't exist.
-- This defines a set of allowed values for the 'category' column.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'list_item_category') THEN
        CREATE TYPE public.list_item_category AS ENUM (
            'Travel',
            'Food',
            'Adventure',
            'Skills',
            'Wellness',
            'Creative',
            'Community',
            'Finance',
            'Career',
            'Other'
        );
    END IF;
END$$;


-- 2. Create the profiles table if it doesn't exist.
-- This table stores public user data and is linked to auth.users.
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  avatar_url text,
  updated_at timestamptz,
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);


-- 3. Create the lists table if it doesn't exist.
-- This table stores the main list information for each user.
CREATE TABLE IF NOT EXISTS public.lists (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text,
    is_public boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);


-- 4. Create the list_items table if it doesn't exist.
-- This table stores individual items for each list.
CREATE TABLE IF NOT EXISTS public.list_items (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    list_id uuid NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
    text text,
    completed boolean NOT NULL DEFAULT false,
    -- Use the custom category type with a default value
    category public.list_item_category NOT NULL DEFAULT 'Other'::list_item_category,
    position integer NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);


-- 5. Set up Row Level Security (RLS) for all tables.
-- These policies ensure that users can only access and modify their own data,
-- except for data that is explicitly marked as public.

-- RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- RLS for Lists
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own lists." ON public.lists;
CREATE POLICY "Users can view their own lists." ON public.lists FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Public lists are viewable by everyone." ON public.lists;
CREATE POLICY "Public lists are viewable by everyone." ON public.lists FOR SELECT USING (is_public = true);
DROP POLICY IF EXISTS "Users can insert their own lists." ON public.lists;
CREATE POLICY "Users can insert their own lists." ON public.lists FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own lists." ON public.lists;
CREATE POLICY "Users can update their own lists." ON public.lists FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own lists." ON public.lists;
CREATE POLICY "Users can delete their own lists." ON public.lists FOR DELETE USING (auth.uid() = user_id);

-- RLS for List Items
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own list items." ON public.list_items;
CREATE POLICY "Users can view their own list items." ON public.list_items FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view items from public lists." ON public.list_items;
CREATE POLICY "Users can view items from public lists." ON public.list_items FOR SELECT USING (
    (list_id IN ( SELECT id FROM public.lists WHERE is_public = true ))
);
DROP POLICY IF EXISTS "Users can insert their own list items." ON public.list_items;
CREATE POLICY "Users can insert their own list items." ON public.list_items FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own list items." ON public.list_items;
CREATE POLICY "Users can update their own list items." ON public.list_items FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own list items." ON public.list_items;
CREATE POLICY "Users can delete their own list items." ON public.list_items FOR DELETE USING (auth.uid() = user_id);


-- 6. Insert sample data for your users.
-- This part uses the user IDs you provided for Ben and Jessica.

-- Clear previous sample data to avoid duplicates.
DELETE FROM public.lists WHERE user_id IN ('bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', '74e6ea39-1011-4f77-b15a-709b33963a94');
DELETE FROM public.profiles WHERE id IN ('bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', '74e6ea39-1011-4f77-b15a-709b33963a94');

-- Insert profiles
INSERT INTO public.profiles (id, username, avatar_url, updated_at)
VALUES
  ('bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', 'Ben H.', 'https://placehold.co/100x100.png', now()),
  ('74e6ea39-1011-4f77-b15a-709b33963a94', 'Jessica L.', 'https://placehold.co/100x100.png', now());

-- Insert lists for users
WITH user_lists AS (
  INSERT INTO public.lists (user_id, title, is_public)
  VALUES
    ('bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', 'Ben''s Growth & Goals List', true),
    ('74e6ea39-1011-4f77-b15a-709b33963a94', 'Jessica''s Adventures Before 30', true)
  RETURNING id, user_id
)
-- Insert list items for Jessica
, jessica_items (text, completed, category, position) AS (
  VALUES
    ('Hike the Inca Trail to Machu Picchu', true, 'Adventure'::public.list_item_category, 0),
    ('Take a cooking class in Thailand', false, 'Food'::public.list_item_category, 1),
    ('See the Northern Lights', false, 'Travel'::public.list_item_category, 2)
)
, jessica_inserts AS (
  INSERT INTO public.list_items (list_id, user_id, text, completed, category, position)
  SELECT ul.id, ul.user_id, item.text, item.completed, item.category, item.position
  FROM user_lists ul, jessica_items item
  WHERE ul.user_id = '74e6ea39-1011-4f77-b15a-709b33963a94'
)
-- Insert list items for Ben
, ben_items (text, completed, category, position) AS (
  VALUES
    ('Get a professional certification', true, 'Career'::public.list_item_category, 0),
    ('Read 50 books in one year', true, 'Skills'::public.list_item_category, 1),
    ('Start a side hustle', false, 'Finance'::public.list_item_category, 2)
)
INSERT INTO public.list_items (list_id, user_id, text, completed, category, position)
SELECT ul.id, ul.user_id, item.text, item.completed, item.category, item.position
FROM user_lists ul, ben_items item
WHERE ul.user_id = 'bf9e9dd1-0257-4e05-a83c-cd0d043ef47b';
