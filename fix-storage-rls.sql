-- Drop all existing policies on profile-avatars to avoid conflicts
DROP POLICY IF EXISTS "Avatar images are publicly viewable by all users" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can insert their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their own avatar" ON storage.objects;

-- Create new, corrected policies

-- 1. Public Read Access
CREATE POLICY "Avatar images are publicly viewable by all users"
ON storage.objects FOR SELECT
USING ( bucket_id = 'profile-avatars' );

-- 2. Authenticated Insert
CREATE POLICY "Authenticated users can insert their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'profile-avatars' AND auth.uid() = owner );

-- 3. Authenticated Update
CREATE POLICY "Authenticated users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING ( auth.uid() = owner );

-- 4. Authenticated Delete
CREATE POLICY "Authenticated users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING ( auth.uid() = owner );
