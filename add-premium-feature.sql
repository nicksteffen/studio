-- This script adds a new 'is_premium' column to your 'profiles' table
-- to manage user access to premium features.

-- Step 1: Add the is_premium column to the profiles table.
-- This column will default to FALSE for any new users who sign up.
ALTER TABLE public.profiles
ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;

-- Step 2: Grant premium status to all of your existing users.
-- This is a great way to reward your early adopters!
-- Run this command *after* you have added the new column.
UPDATE public.profiles
SET is_premium = TRUE;

-- Step 3 (Optional): Verify that the changes were applied correctly.
-- You should see the new 'is_premium' column, set to 'true' for existing users.
-- SELECT id, username, is_premium FROM public.profiles;
