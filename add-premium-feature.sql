-- Add the is_premium column to the profiles table
-- It defaults to FALSE for any new users who sign up.
ALTER TABLE public.profiles
ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;

-- Grant premium status to all existing users.
-- Run this after adding the column.
UPDATE public.profiles
SET is_premium = TRUE;

-- (Optional) To verify, you can select from the table.
-- SELECT id, username, is_premium FROM public.profiles;
