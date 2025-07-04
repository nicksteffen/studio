-- Add a UNIQUE constraint to the username column in the profiles table.
-- This will prevent duplicate usernames.
-- Note: This will fail if you already have duplicate usernames in your database.
-- You will need to resolve them manually before running this script.
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_username_key UNIQUE (username);
