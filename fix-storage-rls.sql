-- Drop existing policies for the 'profile-avatars' bucket to avoid conflicts.
-- We are specific about the policy names to avoid dropping policies for other buckets.
DROP POLICY IF EXISTS "Avatar images are publicly viewable by all users" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update their own avatar." ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete their own avatar." ON storage.objects;

-- Add new policies for the 'profile-avatars' bucket.

-- 1. Allow public read access to all objects in the 'profile-avatars' bucket.
CREATE POLICY "Avatar images are publicly viewable by all users"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'profile-avatars' );

-- 2. Allow logged-in users to upload objects into the 'profile-avatars' bucket.
CREATE POLICY "Anyone can upload an avatar."
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'profile-avatars' AND auth.uid() = owner );

-- 3. Allow users to update their own objects in the 'profile-avatars' bucket.
-- The `owner` is the user's UID from `auth.users`.
CREATE POLICY "Anyone can update their own avatar."
ON storage.objects FOR UPDATE
TO authenticated
USING ( auth.uid() = owner )
WITH CHECK ( bucket_id = 'profile-avatars' );

-- 4. Allow users to delete their own objects in the 'profile-avatars' bucket.
CREATE POLICY "Anyone can delete their own avatar."
ON storage.objects FOR DELETE
TO authenticated
USING ( auth.uid() = owner );


-- =====================================================================================
-- Policies for the `profiles` table
-- =====================================================================================

-- Drop existing policies on the profiles table to avoid conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;

-- 1. Allow public read access to all profiles.
-- This is necessary for the browse page to display user avatars and usernames.
CREATE POLICY "Public profiles are viewable by everyone."
ON public.profiles FOR SELECT
USING (true);

-- 2. Allow users to insert their own profile.
-- The user ID in the new row must match the logged-in user's ID.
CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 3. Allow users to update their own profile.
-- A user can only update a profile where their user ID matches the 'id' column.
CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
