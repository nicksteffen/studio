--
-- Before30Bucket Sample Data and Schema Setup
--
-- This script sets up the necessary tables, relationships,
-- and security policies for the Before30Bucket application.
-- It also seeds the database with sample data.
--

-- 1. DEFINE ENUMERATED TYPES
-- Using an ENUM for categories provides type safety and ensures data consistency.
-- It's more efficient than storing strings.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'list_item_category') THEN
        CREATE TYPE public.list_item_category AS ENUM (
            'Travel', 'Food', 'Adventure', 'Skills', 'Wellness', 'Creative', 'Community', 'Finance', 'Career', 'Other'
        );
    END IF;
END$$;


-- 2. CREATE TABLES
-- We create the tables first without foreign key constraints
-- to allow for flexible data insertion order. Constraints will be added at the end.

-- public.profiles: Stores public user data, linked to auth.users.
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL PRIMARY KEY,
  updated_at timestamp with time zone,
  username text UNIQUE,
  avatar_url text,
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);
-- Note: The primary key `id` will be linked to `auth.users.id`.

-- public.lists: Stores the main bucket list details.
CREATE TABLE IF NOT EXISTS public.lists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- public.list_items: Stores individual items for each list.
CREATE TABLE IF NOT EXISTS public.list_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id uuid NOT NULL,
  user_id uuid NOT NULL,
  text text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  category public.list_item_category NOT NULL DEFAULT 'Other'::public.list_item_category,
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);


-- 3. SETUP DATABASE TRIGGERS FOR PROFILE SYNCING
-- This is a crucial step for data integrity.
-- It ensures that a `profiles` entry is automatically created for every new user.

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

-- Trigger to call the function after a new user signs up
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 4. SEED SAMPLE DATA
-- Replace the placeholder UUIDs with actual user IDs from your Supabase Auth dashboard.
-- To get User IDs: Sign up 2-3 users in the app, then go to Supabase > Authentication > Users.
-- User 1: 'Jessica' (will have a public list)
-- User 2: 'Ben' (will have a private list)

INSERT INTO public.profiles (id, username, avatar_url)
VALUES
  ('e3a3a3e3-3a3a-3a3a-3a3a-3a3a3a3a3a3a', 'Jessica', 'https://placehold.co/100x100.png'),
  ('b3b3b3b3-3b3b-3b3b-3b3b-3b3b3b3b3b3b', 'Ben', 'https://placehold.co/100x100.png')
ON CONFLICT (id) DO NOTHING;

-- Insert lists for the sample users
DO $$
DECLARE
    jessica_list_id uuid;
    ben_list_id uuid;
BEGIN
    -- Insert list for Jessica (public)
    INSERT INTO public.lists (user_id, title, is_public)
    VALUES ('e3a3a3e3-3a3a-3a3a-3a3a-3a3a3a3a3a3a', 'Jessica''s Adventures', TRUE)
    RETURNING id INTO jessica_list_id;

    -- Insert list for Ben (private)
    INSERT INTO public.lists (user_id, title, is_public)
    VALUES ('b3b3b3b3-3b3b-3b3b-3b3b-3b3b3b3b3b3b', 'Ben''s 30s Goals', FALSE)
    RETURNING id INTO ben_list_id;

    -- Insert items for Jessica's list
    INSERT INTO public.list_items (list_id, user_id, text, completed, category, position)
    SELECT jessica_list_id, 'e3a3a3e3-3a3a-3a3a-3a3a-3a3a3a3a3a3a', item.text, item.completed, item.category::public.list_item_category, item.position
    FROM (VALUES
      ('Hike the Inca Trail to Machu Picchu', TRUE, 'Adventure', 0),
      ('Take a cooking class in Thailand', FALSE, 'Food', 1),
      ('See the Northern Lights', FALSE, 'Travel', 2),
      ('Learn to surf', FALSE, 'Adventure', 3),
      ('Go on a safari in Africa', FALSE, 'Travel', 4)
    ) AS item(text, completed, category, position);

    -- Insert items for Ben's list
    INSERT INTO public.list_items (list_id, user_id, text, completed, category, position)
    SELECT ben_list_id, 'b3b3b3b3-3b3b-3b3b-3b3b-3b3b3b3b3b3b', item.text, item.completed, item.category::public.list_item_category, item.position
    FROM (VALUES
      ('Get a professional certification', TRUE, 'Career', 0),
      ('Read 50 books in one year', FALSE, 'Skills', 1),
      ('Start a side hustle', FALSE, 'Finance', 2),
      ('Learn to play the guitar', FALSE, 'Creative', 3)
    ) AS item(text, completed, category, position);
END $$;


-- 5. ADD FOREIGN KEY CONSTRAINTS
-- Adding constraints at the end ensures all data is in place first.
-- ON DELETE CASCADE means if a user or list is deleted, their associated data is also cleaned up.

-- Link profiles.id to auth.users.id
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Link lists.user_id to profiles.id
ALTER TABLE public.lists
ADD CONSTRAINT lists_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Link list_items to lists and users
ALTER TABLE public.list_items
ADD CONSTRAINT list_items_list_id_fkey
FOREIGN KEY (list_id) REFERENCES public.lists(id) ON DELETE CASCADE;

ALTER TABLE public.list_items
ADD CONSTRAINT list_items_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


-- 6. SETUP ROW LEVEL SECURITY (RLS)
-- This is a critical security measure. It ensures users can only access their own data,
-- unless it's explicitly marked as public.

-- Enable RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Public lists are viewable by everyone." ON public.lists;
DROP POLICY IF EXISTS "Users can view their own lists." ON public.lists;
DROP POLICY IF EXISTS "Users can create their own lists." ON public.lists;
DROP POLICY IF EXISTS "Users can update their own lists." ON public.lists;
DROP POLICY IF EXISTS "Users can delete their own lists." ON public.lists;
DROP POLICY IF EXISTS "Public list items are viewable by everyone." ON public.list_items;
DROP POLICY IF EXISTS "Users can view their own list items." ON public.list_items;
DROP POLICY IF EXISTS "Users can insert their own list items." ON public.list_items;
DROP POLICY IF EXISTS "Users can update their own list items." ON public.list_items;
DROP POLICY IF EXISTS "Users can delete their own list items." ON public.list_items;


-- RLS Policies for `profiles`
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- RLS Policies for `lists`
CREATE POLICY "Public lists are viewable by everyone." ON public.lists FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view their own lists." ON public.lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own lists." ON public.lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own lists." ON public.lists FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own lists." ON public.lists FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for `list_items`
CREATE POLICY "Public list items are viewable by everyone." ON public.list_items FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM public.lists l
    WHERE l.id = list_items.list_id AND l.is_public = true
  )
);
CREATE POLICY "Users can view their own list items." ON public.list_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own list items." ON public.list_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own list items." ON public.list_items FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own list items." ON public.list_items FOR DELETE USING (auth.uid() = user_id);
