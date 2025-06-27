-- This script updates the foreign key constraints on the `lists` and `list_items`
-- tables. It changes the reference from `auth.users` to `public.profiles`.
-- This creates a direct relationship that Supabase's PostgREST layer can use
-- to resolve nested queries automatically, fixing the "could not find relationship" error.

-- 1. Drop the existing foreign key constraint on the 'lists' table.
--    'lists_user_id_fkey' is the default name, and `IF EXISTS` makes this safe.
ALTER TABLE public.lists
DROP CONSTRAINT IF EXISTS lists_user_id_fkey;

-- 2. Add a new foreign key constraint that links `lists.user_id` to `profiles.id`.
ALTER TABLE public.lists
ADD CONSTRAINT lists_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. Drop the existing foreign key constraint on the 'list_items' table.
ALTER TABLE public.list_items
DROP CONSTRAINT IF EXISTS list_items_user_id_fkey;

-- 4. Add a new foreign key constraint that links `list_items.user_id` to `profiles.id`.
ALTER TABLE public.list_items
ADD CONSTRAINT list_items_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
