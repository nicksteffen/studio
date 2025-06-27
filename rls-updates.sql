-- This script updates the Row Level Security (RLS) policies for viewing lists and list items.
-- It resolves an issue where public lists and their items were not visible on the browse page.

-- 1. Drop old SELECT policies on the 'lists' table to avoid conflicts.
DROP POLICY IF EXISTS "users_can_view_their_own_lists" ON public.lists;
DROP POLICY IF EXISTS "public_lists_are_viewable_by_everyone" ON public.lists;

-- 2. Drop old SELECT policies on the 'list_items' table.
DROP POLICY IF EXISTS "users_can_view_their_own_list_items" ON public.list_items;
DROP POLICY IF EXISTS "public_list_items_are_viewable_by_everyone" ON public.list_items;


-- 3. Create a new, combined SELECT policy for the 'lists' table.
-- This single policy allows users to view lists that are either public OR they own.
CREATE POLICY "users_can_view_lists" ON public.lists
FOR SELECT
USING (
  (is_public = true) OR (auth.uid() = user_id)
);

-- 4. Create a new, combined SELECT policy for the 'list_items' table.
-- This policy allows users to view list items that either belong to them OR are part of a public list.
CREATE POLICY "users_can_view_list_items" ON public.list_items
FOR SELECT
USING (
  (auth.uid() = user_id) OR
  (EXISTS (
    SELECT 1 FROM public.lists WHERE lists.id = list_items.list_id AND lists.is_public = true
  ))
);

-- Grant select access to the anon role for public data.
-- This ensures that unauthenticated users can see public lists on the browse page.
GRANT SELECT ON public.lists TO anon;
GRANT SELECT ON public.list_items TO anon;
GRANT SELECT ON public.profiles TO anon;
