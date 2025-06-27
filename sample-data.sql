-- This script sets up the necessary tables and populates them with sample data.
-- It's designed to be run in the Supabase SQL Editor.
--
-- Note: This script uses "CREATE TABLE IF NOT EXISTS" so it is safe to run multiple times.
--
-- 1. Create public.profiles table
-- This table stores user data that you want to be publicly accessible.
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL,
    updated_at timestamp with time zone NULL,
    username text NULL,
    avatar_url text NULL,
    CONSTRAINT profiles_pkey PRIMARY KEY (id),
    CONSTRAINT profiles_username_key UNIQUE (username),
    CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT username_length CHECK ((char_length(username) >= 3))
);
-- 2. Set up Row Level Security (RLS) for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING ((auth.uid() = id));


-- 3. Create public.lists table
-- This table stores the bucket lists created by users.
CREATE TABLE IF NOT EXISTS public.lists (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NULL,
    title character varying NULL,
    created_at timestamp with time zone NULL DEFAULT now(),
    is_public boolean NOT NULL DEFAULT false,
    CONSTRAINT lists_pkey PRIMARY KEY (id),
    CONSTRAINT lists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
-- 4. Set up RLS for lists
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Individuals can create lists." ON public.lists FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Individuals can view their own lists." ON public.lists FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Individuals can update their own lists." ON public.lists FOR UPDATE USING ((auth.uid() = user_id));
CREATE POLICY "Public lists are viewable by everyone." ON public.lists FOR SELECT USING (is_public = true);


-- 5. Create public.list_items table
-- This table stores the individual items within each bucket list.
CREATE TABLE IF NOT EXISTS public.list_items (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    list_id uuid NULL,
    user_id uuid NULL,
    text character varying NOT NULL,
    completed boolean NOT NULL DEFAULT false,
    category character varying NOT NULL DEFAULT 'Other'::character varying,
    "position" integer NOT NULL,
    created_at timestamp with time zone NULL DEFAULT now(),
    CONSTRAINT list_items_pkey PRIMARY KEY (id),
    CONSTRAINT list_items_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.lists(id) ON DELETE CASCADE,
    CONSTRAINT list_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
-- 6. Set up RLS for list_items
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Individuals can create list items." ON public.list_items FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Individuals can view their own list items." ON public.list_items FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Individuals can update their own list items." ON public.list_items FOR UPDATE USING ((auth.uid() = user_id));
CREATE POLICY "Individuals can delete their own list items." ON public.list_items FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "Public list items are viewable by everyone." ON public.list_items FOR SELECT USING (true);


-- 7. Insert sample user profiles
-- IMPORTANT: Make sure you have created users in your app first, then replace
-- the placeholder UUIDs below with the actual user IDs from your Supabase auth.users table.
INSERT INTO public.profiles (id, username, avatar_url)
VALUES
    ('bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', 'Ben H.', 'https://placehold.co/100x100.png'),
    ('74e6ea39-1011-4f77-b15a-709b33963a94', 'Jessica L.', 'https://placehold.co/100x100.png')
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    avatar_url = EXCLUDED.avatar_url;


-- 8. Create and populate lists for the sample users
-- This will create a public list for each user and add three items to it.
-- It will not create duplicate lists if run again.

-- Ben's list
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.lists WHERE user_id = 'bf9e9dd1-0257-4e05-a83c-cd0d043ef47b' AND title = 'My Growth & Goals List') THEN
    WITH ben_list AS (
      INSERT INTO public.lists (user_id, title, is_public)
      VALUES ('bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', 'My Growth & Goals List', true)
      RETURNING id
    )
    INSERT INTO public.list_items (list_id, user_id, text, completed, category, "position")
    VALUES
        ((SELECT id FROM ben_list), 'bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', 'Get a professional certification', true, 'Career', 0),
        ((SELECT id FROM ben_list), 'bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', 'Read 50 books in one year', true, 'Skills', 1),
        ((SELECT id FROM ben_list), 'bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', 'Start a side hustle', false, 'Finance', 2);
  END IF;
END $$;


-- Jessica's list
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.lists WHERE user_id = '74e6ea39-1011-4f77-b15a-709b33963a94' AND title = 'Jessica''s Adventures Before 30') THEN
    WITH jessica_list AS (
      INSERT INTO public.lists (user_id, title, is_public)
      VALUES ('74e6ea39-1011-4f77-b15a-709b33963a94', 'Jessica''s Adventures Before 30', true)
      RETURNING id
    )
    INSERT INTO public.list_items (list_id, user_id, text, completed, category, "position")
    VALUES
        ((SELECT id FROM jessica_list), '74e6ea39-1011-4f77-b15a-709b33963a94', 'Hike the Inca Trail to Machu Picchu', true, 'Adventure', 0),
        ((SELECT id FROM jessica_list), '74e6ea39-1011-4f77-b15a-709b33963a94', 'Take a cooking class in Thailand', false, 'Food', 1),
        ((SELECT id FROM jessica_list), '74e6ea39-1011-4f77-b15a-709b33963a94', 'See the Northern Lights', false, 'Travel', 2);
  END IF;
END $$;
