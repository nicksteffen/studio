-- Create Profiles Table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  updated_at timestamp with time zone NULL,
  username text NULL,
  avatar_url text NULL,
  website text NULL,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_username_key UNIQUE (username),
  CONSTRAINT username_length CHECK ((char_length(username) >= 3))
);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create Lists Table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.lists (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT lists_pkey PRIMARY KEY (id),
  CONSTRAINT lists_user_id_key UNIQUE (user_id),
  CONSTRAINT lists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create List Items Table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.list_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  list_id uuid NOT NULL,
  user_id uuid NOT NULL,
  text text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  category text NULL,
  "position" integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT list_items_pkey PRIMARY KEY (id),
  CONSTRAINT list_items_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.lists(id) ON DELETE CASCADE,
  CONSTRAINT list_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Secure the tables with Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

DROP POLICY IF EXISTS "Public lists are viewable by everyone." ON public.lists;
DROP POLICY IF EXISTS "Users can view their own lists." ON public.lists;
DROP POLICY IF EXISTS "Users can create lists." ON public.lists;
DROP POLICY IF EXISTS "Users can update their own lists." ON public.lists;
DROP POLICY IF EXISTS "Users can delete their own lists." ON public.lists;

DROP POLICY IF EXISTS "Public list items are viewable by everyone." ON public.list_items;
DROP POLICY IF EXISTS "Users can view their own list items." ON public.list_items;
DROP POLICY IF EXISTS "Users can create list items." ON public.list_items;
DROP POLICY IF EXISTS "Users can update their own list items." ON public.list_items;
DROP POLICY IF EXISTS "Users can delete their own list items." ON public.list_items;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING ((auth.uid() = id));

-- Create policies for lists
CREATE POLICY "Public lists are viewable by everyone." ON public.lists FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view their own lists." ON public.lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create lists." ON public.lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own lists." ON public.lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own lists." ON public.lists FOR DELETE USING (auth.uid() = user_id);

-- Create policies for list_items
CREATE POLICY "Public list items are viewable by everyone." ON public.list_items FOR SELECT USING (
  (EXISTS ( SELECT 1 FROM lists WHERE (lists.id = list_items.list_id) AND (lists.is_public = true)))
);
CREATE POLICY "Users can view their own list items." ON public.list_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create list items." ON public.list_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own list items." ON public.list_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own list items." ON public.list_items FOR DELETE USING (auth.uid() = user_id);


-- =================================================================
-- SAMPLE DATA - Replace UUIDs with your actual test user IDs
-- =================================================================
-- Before running, create 2-3 users in your app via the sign-up page.
-- Then, get their user IDs from the Supabase dashboard (Authentication -> Users)
-- and replace the placeholder UUIDs below.
-- =================================================================

-- 1. Set up profile for Jessica (user ID: 74e6ea39-1011-4f77-b15a-709b33963a94)
-- This assumes a user with this ID has already been created via app sign-up.
INSERT INTO public.profiles (id, username, avatar_url)
VALUES ('74e6ea39-1011-4f77-b15a-709b33963a94', 'Jessica', 'https://placehold.co/100x100.png')
ON CONFLICT (id) DO UPDATE 
SET 
  username = EXCLUDED.username,
  avatar_url = EXCLUDED.avatar_url;

-- 2. Create a list for Jessica and make it public
INSERT INTO public.lists (user_id, title, is_public)
VALUES ('74e6ea39-1011-4f77-b15a-709b33963a94', 'Jessica''s Adventures Before 30', true)
ON CONFLICT (user_id) DO UPDATE SET
  title = EXCLUDED.title,
  is_public = EXCLUDED.is_public;

-- 3. Add items to Jessica's list
DO $$
DECLARE
    jessica_list_id uuid;
BEGIN
    SELECT id INTO jessica_list_id FROM public.lists WHERE user_id = '74e6ea39-1011-4f77-b15a-709b33963a94' LIMIT 1;
    IF jessica_list_id IS NOT NULL THEN
        -- Clear existing items to prevent duplicates if script is re-run
        DELETE FROM public.list_items WHERE list_id = jessica_list_id;
        -- Insert new items
        INSERT INTO public.list_items (list_id, user_id, text, completed, category, "position")
        VALUES
            (jessica_list_id, '74e6ea39-1011-4f77-b15a-709b33963a94', 'Hike the Inca Trail to Machu Picchu', true, 'Adventure', 0),
            (jessica_list_id, '74e6ea39-1011-4f77-b15a-709b33963a94', 'Take a cooking class in Thailand', false, 'Food', 1),
            (jessica_list_id, '74e6ea39-1011-4f77-b15a-709b33963a94', 'See the Northern Lights in Iceland', false, 'Travel', 2),
            (jessica_list_id, '74e6ea39-1011-4f77-b15a-709b33963a94', 'Learn to surf in Costa Rica', false, 'Adventure', 3);
    END IF;
END $$;

-- 4. Set up profile for Ben (user ID: bf9e9dd1-0257-4e05-a83c-cd0d043ef47b)
INSERT INTO public.profiles (id, username, avatar_url)
VALUES ('bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', 'Ben', 'https://placehold.co/100x100.png')
ON CONFLICT (id) DO UPDATE 
SET 
  username = EXCLUDED.username,
  avatar_url = EXCLUDED.avatar_url;

-- 5. Create a list for Ben and make it public
INSERT INTO public.lists (user_id, title, is_public)
VALUES ('bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', 'Ben''s Growth & Goals List', true)
ON CONFLICT (user_id) DO UPDATE SET
  title = EXCLUDED.title,
  is_public = EXCLUDED.is_public;

-- 6. Add items to Ben's list
DO $$
DECLARE
    ben_list_id uuid;
BEGIN
    SELECT id INTO ben_list_id FROM public.lists WHERE user_id = 'bf9e9dd1-0257-4e05-a83c-cd0d043ef47b' LIMIT 1;
    IF ben_list_id IS NOT NULL THEN
        DELETE FROM public.list_items WHERE list_id = ben_list_id;
        INSERT INTO public.list_items (list_id, user_id, text, completed, category, "position")
        VALUES
            (ben_list_id, 'bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', 'Get a professional certification', true, 'Career', 0),
            (ben_list_id, 'bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', 'Read 50 books in one year', false, 'Skills', 1),
            (ben_list_id, 'bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', 'Start a side hustle', false, 'Finance', 2),
            (ben_list_id, 'bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', 'Run a full marathon', false, 'Wellness', 3);
    END IF;
END $$;
