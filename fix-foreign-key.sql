-- This script establishes a direct foreign key relationship between the `lists` table
-- and the `profiles` table. This allows Supabase to efficiently join them in a single query.

-- First, we safely drop the old foreign key constraint if it exists. This constraint
-- linked `lists.user_id` to `auth.users.id`.
alter table public.lists drop constraint if exists lists_user_id_fkey;

-- Next, we add the new, corrected foreign key constraint. This links `lists.user_id`
-- to `public.profiles.id`. This is the "road sign" Supabase needs.
-- `on delete cascade` is added for data integrity, so if a profile is deleted,
-- their associated lists are also removed.
alter table public.lists
  add constraint lists_user_id_fkey
  foreign key (user_id)
  references public.profiles (id) on delete cascade;
