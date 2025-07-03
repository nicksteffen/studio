--
-- RLS POLICIES FOR 'profile-avatars' BUCKET
--
-- This script enables Row Level Security (RLS) for the 'profile-avatars' storage bucket
-- and creates policies to allow authenticated users to manage their own avatar images.
--

-- 1. Allow authenticated users to VIEW their own avatars.
--    This policy allows users to see any avatar image inside a folder that matches their user ID.
CREATE POLICY "Allow authenticated users to see their own avatars"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'profile-avatars' AND (storage.foldername(name))[1] = auth.uid()::text );

-- 2. Allow authenticated users to UPLOAD their own avatar.
--    This policy allows users to insert a new avatar image into a folder that matches their user ID.
CREATE POLICY "Allow authenticated users to upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'profile-avatars' AND (storage.foldername(name))[1] = auth.uid()::text );

-- 3. Allow authenticated users to UPDATE their own avatar.
--    This policy allows users to update an existing avatar image inside a folder that matches their user ID.
CREATE POLICY "Allow authenticated users to update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'profile-avatars' AND (storage.foldername(name))[1] = auth.uid()::text );

-- 4. Allow authenticated users to DELETE their own avatar.
--    This policy allows users to delete an avatar image from a folder that matches their user ID.
CREATE POLICY "Allow authenticated users to delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'profile-avatars' AND (storage.foldername(name))[1] = auth.uid()::text );
