-- ### BEFORE YOU RUN THIS SCRIPT ###
-- 1. Make sure you have created two sample user accounts in your app by signing up.
-- 2. Get the User ID (UUID) for each user from the Supabase dashboard (Authentication > Users).
-- 3. Replace the placeholder UUIDs in this script with the actual User IDs.
--    - '74e6ea39-1011-4f77-b15a-709b33963a94' should be your "Jessica" user's ID.
--    - 'bf9e9dd1-0257-4e05-a83c-cd0d043ef47b' should be your "Ben" user's ID.
-- 4. Copy and paste the entire script into the Supabase SQL Editor and run it.

-- Create a function to check if a table exists
create or replace function table_exists(table_name text)
returns boolean as $$
begin
  return exists(
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = table_name
  );
end;
$$ language plpgsql;


-- 1. Create Profiles Table
-- Stores public user data like username and avatar URL.
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at timestamp with time zone,
  username text UNIQUE,
  avatar_url text,
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- 2. Create Lists Table
-- Stores the main bucket list information.
CREATE TABLE IF NOT EXISTS public.lists (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text,
    is_public boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Create List Items Table
-- Stores individual items for each bucket list.
CREATE TABLE IF NOT EXISTS public.list_items (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    list_id uuid NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    text text NOT NULL,
    completed boolean DEFAULT false,
    category text,
    position integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


-- 4. Set up Row Level Security (RLS)
-- These policies ensure that users can only access their own data, unless a list is public.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Policies for lists
CREATE POLICY "Public lists are viewable by everyone." ON public.lists FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view their own lists." ON public.lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own lists." ON public.lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own lists." ON public.lists FOR UPDATE USING (auth.uid() = user_id);

-- Policies for list_items
CREATE POLICY "Public list items are viewable by everyone." ON public.list_items FOR SELECT USING ((SELECT is_public FROM public.lists WHERE id = list_id) = true);
CREATE POLICY "Users can view their own list items." ON public.list_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own list items." ON public.list_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own list items." ON public.list_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own list items." ON public.list_items FOR DELETE USING (auth.uid() = user_id);


-- 5. Insert Sample Data
-- This section populates the database with sample data for your pre-registered users.
-- Remember to replace the UUIDs with the ones from your own Supabase project.

-- Delete existing sample data to prevent duplicates if script is run multiple times
DELETE FROM public.profiles WHERE id IN ('74e6ea39-1011-4f77-b15a-709b33963a94', 'bf9e9dd1-0257-4e05-a83c-cd0d043ef47b');

-- Insert sample profiles
INSERT INTO public.profiles (id, username, avatar_url, updated_at)
VALUES
    ('74e6ea39-1011-4f77-b15a-709b33963a94', 'Jessica', 'https://placehold.co/100x100.png', now()),
    ('bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', 'Ben', 'https://placehold.co/100x100.png', now());

-- Insert sample lists (one public, one private by default)
INSERT INTO public.lists (user_id, title, is_public)
VALUES
    ('74e6ea39-1011-4f77-b15a-709b33963a94', 'Jessica''s Adventures Before 30', true),
    ('bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', 'Ben''s Growth & Goals', true);

-- Insert sample list items for Jessica
INSERT INTO public.list_items (list_id, user_id, text, completed, category, position)
SELECT id, '74e6ea39-1011-4f77-b15a-709b33963a94', item.text, item.completed, item.category, item.position
FROM public.lists,
     (VALUES
        ('Hike the Inca Trail to Machu Picchu', true, 'Adventure', 0),
        ('Take a cooking class in Thailand', false, 'Food', 1),
        ('See the Northern Lights', false, 'Travel', 2)
     ) AS item(text, completed, category, position)
WHERE user_id = '74e6ea39-1011-4f77-b15a-709b33963a94';

-- Insert sample list items for Ben
INSERT INTO public.list_items (list_id, user_id, text, completed, category, position)
SELECT id, 'bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', item.text, item.completed, item.category, item.position
FROM public.lists,
     (VALUES
        ('Get a professional certification', true, 'Career', 0),
        ('Read 50 books in one year', true, 'Skills', 1),
        ('Start a side hustle', false, 'Finance', 2)
     ) AS item(text, completed, category, position)
WHERE user_id = 'bf9e9dd1-0257-4e05-a83c-cd0d043ef47b';
