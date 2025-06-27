-- This script fixes data integrity issues between users, profiles, and lists.
-- It ensures every user has a profile and that lists are correctly linked.

-- Step 1: Create a function to automatically create a profile when a new user signs up.
-- This is the standard way to keep public.profiles in sync with auth.users.
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

-- Step 2: Create a trigger that calls the function after a new user is created in auth.users.
-- This ensures the function runs automatically for every new signup.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Step 3: Backfill profiles for any existing users in auth.users who are missing a profile.
-- This handles users created before the trigger was in place.
INSERT INTO public.profiles (id, username)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;


-- Step 4: (Safety Net) Delete any list items and lists that belong to a user_id that does NOT exist in auth.users.
-- This cleans up any truly orphaned data that would prevent the foreign key from being created.
DELETE FROM public.list_items
WHERE list_id IN (
    SELECT id FROM public.lists WHERE user_id NOT IN (SELECT id FROM auth.users)
);
DELETE FROM public.lists
WHERE user_id NOT IN (SELECT id FROM auth.users);


-- Step 5: Now, add the foreign key constraint. This will now succeed.
-- It enforces that every list must be associated with a valid profile and cascades deletes.
ALTER TABLE public.lists
DROP CONSTRAINT IF EXISTS lists_user_id_fkey; -- Drop if it exists to avoid errors on re-run

ALTER TABLE public.lists
ADD CONSTRAINT lists_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Step 6: (Recommended) Enforce that a list item must belong to a valid list.
ALTER TABLE public.list_items
DROP CONSTRAINT IF EXISTS list_items_list_id_fkey; -- Drop if it exists to avoid errors on re-run

ALTER TABLE public.list_items
ADD CONSTRAINT list_items_list_id_fkey
FOREIGN KEY (list_id) REFERENCES public.lists(id) ON DELETE CASCADE;
