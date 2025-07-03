-- Drop the old restrictive SELECT policy if it exists to avoid conflicts.
DROP POLICY IF EXISTS "Avatar images are publicly viewable by authenticated users" ON storage.objects;

-- Create a new public SELECT policy.
-- This allows anyone to view images in the 'profile-avatars' bucket.
CREATE OR REPLACE POLICY "Avatar images are publicly viewable by all users"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'profile-avatars'
  );

-- The policies below ensure that only the authenticated user can manage their own files.
-- We use CREATE OR REPLACE to make this script safe to re-run.

-- Grant insert access to the owner of the avatar
CREATE OR REPLACE POLICY "Users can upload their own avatar"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid
  );

-- Grant update access to the owner of the avatar
CREATE OR REPLACE POLICY "Users can update their own avatar"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'profile-avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid
  );

-- Grant delete access to the owner of the avatar
CREATE OR REPLACE POLICY "Users can delete their own avatar"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'profile-avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid
  );
