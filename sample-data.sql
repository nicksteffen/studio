-- 1. Create the custom category type if it doesn't exist
-- Using a temporary function to handle CREATE TYPE IF NOT EXISTS logic
do $$ begin
  if not exists (select 1 from pg_type where typname = 'list_item_category') then
    create type public.list_item_category as enum ('Travel', 'Food', 'Adventure', 'Skills', 'Wellness', 'Creative', 'Community', 'Finance', 'Career', 'Other');
  end if;
end $$;


-- 2. Create the profiles table if it doesn't exist
create table if not exists public.profiles (
  id uuid not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  avatar_url text,
  constraint username_length check (char_length(username) >= 3)
);
-- Set up foreign key from auth.users to profiles
alter table public.profiles add constraint "profiles_id_fkey" foreign key (id) references auth.users (id) on delete cascade;


-- 3. Create the lists table if it doesn't exist
create table if not exists public.lists (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null,
  title text not null,
  is_public boolean not null default false,
  created_at timestamp with time zone not null default now()
);
-- Set up foreign key from lists to profiles
alter table public.lists add constraint "lists_user_id_fkey" foreign key (user_id) references public.profiles (id) on delete cascade;


-- 4. Create the list_items table if it doesn't exist
create table if not exists public.list_items (
  id uuid not null default gen_random_uuid() primary key,
  list_id uuid not null,
  user_id uuid not null,
  text text not null,
  completed boolean not null default false,
  category public.list_item_category not null default 'Other'::list_item_category,
  position integer not null default 0,
  created_at timestamp with time zone not null default now()
);
-- Set up foreign keys from list_items to lists and profiles
alter table public.list_items add constraint "list_items_list_id_fkey" foreign key (list_id) references public.lists (id) on delete cascade;
alter table public.list_items add constraint "list_items_user_id_fkey" foreign key (user_id) references public.profiles (id) on delete cascade;


-- 5. Set up Storage security policies
-- This is a generic policy. You might want to restrict it further based on your app's needs.
-- For example, you might want to only allow authenticated users to upload avatars.
-- See https://supabase.com/docs/guides/storage/security/access-control
drop policy if exists "Avatar images are publicly accessible." on storage.objects;
create policy "Avatar images are publicly accessible." on storage.objects for select using (bucket_id = 'avatars');

drop policy if exists "Anyone can upload an avatar." on storage.objects;
create policy "Anyone can upload an avatar." on storage.objects for insert with check (bucket_id = 'avatars');


-- 6. Function to automatically create a profile for new users
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

-- 7. Trigger to call the function when a new user signs up
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 8. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.lists enable row level security;
alter table public.list_items enable row level security;

-- 9. Create RLS policies

-- PROFILES
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);

drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update their own profile." on public.profiles;
create policy "Users can update their own profile." on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);


-- LISTS
drop policy if exists "Public lists are viewable by everyone." on public.lists;
create policy "Public lists are viewable by everyone." on public.lists for select using (is_public = true);

drop policy if exists "Users can view their own private lists." on public.lists;
create policy "Users can view their own private lists." on public.lists for select using (auth.uid() = user_id);

drop policy if exists "Users can create their own lists." on public.lists;
create policy "Users can create their own lists." on public.lists for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own lists." on public.lists;
create policy "Users can update their own lists." on public.lists for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own lists." on public.lists;
create policy "Users can delete their own lists." on public.lists for delete using (auth.uid() = user_id);


-- LIST ITEMS --
-- Remove old, potentially problematic policy first
drop policy if exists "Users can view items on lists they can see." on public.list_items;

-- New, more robust SELECT policies
drop policy if exists "Public list items are viewable by everyone." on public.list_items;
create policy "Public list items are viewable by everyone." on public.list_items for select using (
  (select is_public from public.lists where id = list_id) = true
);

drop policy if exists "Users can view their own list items." on public.list_items;
create policy "Users can view their own list items." on public.list_items for select using (auth.uid() = user_id);


-- Other list_items policies
drop policy if exists "Users can insert items into their own lists." on public.list_items;
create policy "Users can insert items into their own lists." on public.list_items for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own list items." on public.list_items;
create policy "Users can update their own list items." on public.list_items for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own list items." on public.list_items;
create policy "Users can delete their own list items." on public.list_items for delete using (auth.uid() = user_id);


/******** SAMPLE DATA ********/
-- Instructions:
-- 1. Sign up a few users in your application (e.g. for "Jessica" and "Ben").
-- 2. Get their User IDs from the Supabase Dashboard (Authentication -> Users).
-- 3. Replace the placeholder UUIDs below with the actual User IDs.
-- 4. Run this entire script in the Supabase SQL Editor.

-- Clear old sample data to prevent duplicates
delete from public.lists where user_id in ('bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', '74e6ea39-1011-4f77-b15a-709b33963a94');

-- Update profile usernames
UPDATE public.profiles
SET username = 'Ben H.'
WHERE id = 'bf9e9dd1-0257-4e05-a83c-cd0d043ef47b';

UPDATE public.profiles
SET username = 'Jessica L.'
WHERE id = '74e6ea39-1011-4f77-b15a-709b33963a94';


-- Insert sample lists and list items
-- Ben's list (public)
with list_insert as (
  insert into public.lists (user_id, title, is_public)
  values ('bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', 'My Growth & Goals List', true)
  returning id
)
insert into public.list_items (list_id, user_id, text, completed, category, position)
select id, 'bf9e9dd1-0257-4e05-a83c-cd0d043ef47b', item.text, item.completed, item.category::public.list_item_category, item.position
from list_insert,
(
  values
    ('Get a professional certification', true, 'Career', 0),
    ('Read 50 books in one year', true, 'Skills', 1),
    ('Start a side hustle', false, 'Finance', 2),
    ('Learn to play guitar', false, 'Creative', 3),
    ('Run a 10k race', true, 'Wellness', 4)
) as item(text, completed, category, position);

-- Jessica's list (public)
with list_insert as (
  insert into public.lists (user_id, title, is_public)
  values ('74e6ea39-1011-4f77-b15a-709b33963a94', 'Jessica''s Adventures Before 30', true)
  returning id
)
insert into public.list_items (list_id, user_id, text, completed, category, position)
select id, '74e6ea39-1011-4f77-b15a-709b33963a94', item.text, item.completed, item.category::public.list_item_category, item.position
from list_insert,
(
  values
    ('Hike the Inca Trail to Machu Picchu', true, 'Adventure', 0),
    ('Take a cooking class in Thailand', false, 'Food', 1),
    ('See the Northern Lights in Iceland', false, 'Travel', 2),
    ('Go on a solo trip', true, 'Travel', 3),
    ('Learn to surf in Bali', false, 'Adventure', 4)
) as item(text, completed, category, position);
