--
-- This script sets up the database schema and populates it with sample data.
--

-- 1. Create a table for public profiles
-- Note: profiles are automatically created when a new user signs up.
-- See the 'Create a public profile for new users' function below.
create table if not exists
  public.profiles (
    id uuid not null primary key,
    updated_at timestamp with time zone null,
    username text null,
    avatar_url text null,
    website text null,
    constraint username_length check (char_length(username) >= 3),
    constraint profiles_id_fkey foreign key (id) references auth.users (id) on delete cascade,
    unique (username)
  );

-- 2. Add a direct foreign key from lists to profiles
-- This helps Supabase build efficient queries.
-- We add this separately to avoid errors if the script is run multiple times.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'lists_user_id_fkey1' AND conrelid = 'public.lists'::regclass
    ) THEN
        ALTER TABLE public.lists
        ADD CONSTRAINT lists_user_id_fkey1
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;


-- 3. Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid () = id);

create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid () = id);

-- 4. Create the ENUM type for list item categories
-- Using a custom type ensures data consistency.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'list_item_category') THEN
        CREATE TYPE public.list_item_category AS ENUM (
            'Travel', 'Food', 'Adventure', 'Skills', 'Wellness', 'Creative', 'Community', 'Finance', 'Career', 'Other'
        );
    END IF;
END$$;


-- 5. Create the 'lists' table to store user bucket lists
create table if not exists
  public.lists (
    id uuid not null primary key default gen_random_uuid (),
    user_id uuid not null,
    title text not null default ''::text,
    is_public boolean not null default false,
    created_at timestamp with time zone not null default now(),
    constraint lists_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
  );

-- 6. Create the 'list_items' table for items in each list
create table if not exists
  public.list_items (
    id uuid not null primary key default gen_random_uuid (),
    list_id uuid not null,
    user_id uuid not null,
    text text not null,
    completed boolean not null default false,
    category public.list_item_category not null default 'Other'::list_item_category,
    position integer not null default 0,
    created_at timestamp with time zone not null default now(),
    constraint list_items_list_id_fkey foreign key (list_id) references public.lists (id) on delete cascade,
    constraint list_items_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
  );

-- 7. Set up RLS for 'lists' and 'list_items'
alter table public.lists enable row level security;
alter table public.list_items enable row level security;

-- Drop old policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own lists." ON public.lists;
DROP POLICY IF EXISTS "Public lists are viewable by everyone." ON public.lists;
DROP POLICY IF EXISTS "Users can view their own list items." ON public.list_items;
DROP POLICY IF EXISTS "Anyone can view items from public lists." ON public.list_items;

-- New Policies
create policy "Users can view their own lists." on public.lists for
  select using (auth.uid () = user_id);

create policy "Public lists are viewable by everyone." on public.lists for
  select using (is_public = true);

create policy "Users can insert their own lists." on public.lists for
  insert with check (auth.uid () = user_id);

create policy "Users can update their own lists." on public.lists for
  update using (auth.uid () = user_id);

create policy "Users can delete their own lists." on public.lists for
  delete using (auth.uid () = user_id);

create policy "Users can view their own list items." on public.list_items for
  select using (auth.uid () = user_id);

create policy "Anyone can view items from public lists." on public.list_items for
  select using ((
    select is_public from public.lists where id = list_id
  ));

create policy "Users can insert their own list items." on public.list_items for
  insert with check (auth.uid () = user_id);

create policy "Users can update their own list items." on public.list_items for
  update using (auth.uid () = user_id);

create policy "Users can delete their own list items." on public.list_items for
  delete using (auth.uid () = user_id);


-- 8. Create a trigger to automatically create a profile for new users.
-- Note: This is a common pattern for Supabase projects.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.email);
  return new;
end;
$$;

-- Drop the trigger if it already exists to avoid errors on re-run
drop trigger if exists on_auth_user_created on auth.users;

-- Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


--
-- Sample Data Insertion
--
-- This section inserts sample data for two users, Jessica and Ben.
-- Replace the placeholder UUIDs with the actual user IDs from your Supabase Auth dashboard.
--

DO $$
DECLARE
    -- !!! IMPORTANT !!!
    -- Replace these UUIDs with the actual user IDs from your Supabase Authentication > Users page.
    jessica_user_id UUID := '74e6ea39-1011-4f77-b15a-709b33963a94'; -- Replace with Jessica's actual user_id
    ben_user_id UUID     := 'a63b0b3e-53c8-47de-8a39-396d91475c13'; -- Replace with Ben's actual user_id
    
    jessica_list_id UUID;
    ben_list_id UUID;

BEGIN
    -- Update profile usernames if they exist
    UPDATE public.profiles SET username = 'Jessica' WHERE id = jessica_user_id;
    UPDATE public.profiles SET username = 'Ben' WHERE id = ben_user_id;

    -- Create lists for Jessica and Ben
    INSERT INTO public.lists (user_id, title, is_public)
    VALUES (jessica_user_id, 'Jessica''s Adventures', true)
    RETURNING id INTO jessica_list_id;
    
    INSERT INTO public.lists (user_id, title, is_public)
    VALUES (ben_user_id, 'Ben''s Growth Goals', true)
    RETURNING id INTO ben_list_id;

    -- Clear existing sample list items to prevent duplicates on re-run
    DELETE FROM public.list_items WHERE list_id IN (jessica_list_id, ben_list_id);

    -- Insert items for Jessica's list
    INSERT INTO public.list_items (list_id, user_id, text, completed, category, position)
    VALUES
        (jessica_list_id, jessica_user_id, 'Hike the Inca Trail to Machu Picchu', true, 'Adventure'::public.list_item_category, 0),
        (jessica_list_id, jessica_user_id, 'Take a cooking class in Thailand', false, 'Food'::public.list_item_category, 1),
        (jessica_list_id, jessica_user_id, 'See the Northern Lights in Iceland', false, 'Travel'::public.list_item_category, 2),
        (jessica_list_id, jessica_user_id, 'Go on a safari in Tanzania', false, 'Adventure'::public.list_item_category, 3);
        
    -- Insert items for Ben's list
    INSERT INTO public.list_items (list_id, user_id, text, completed, category, position)
    VALUES
        (ben_list_id, ben_user_id, 'Get a professional certification in my field', true, 'Career'::public.list_item_category, 0),
        (ben_list_id, ben_user_id, 'Read 50 books in one year', false, 'Skills'::public.list_item_category, 1),
        (ben_list_id, ben_user_id, 'Start a successful side hustle', false, 'Finance'::public.list_item_category, 2),
        (ben_list_id, ben_user_id, 'Complete a 10k race', true, 'Wellness'::public.list_item_category, 3);

END $$;
