'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be 20 characters or less').optional().or(z.literal('')),
  avatar_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});


type ProfileState = {
    message: string;
    error?: boolean;
    success?: boolean;
}

export async function updateProfile(prevState: ProfileState, formData: FormData): Promise<ProfileState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'You must be logged in to update your profile.', error: true };
  }

  const validatedFields = profileSchema.safeParse({
    username: formData.get('username') || undefined,
    avatar_url: formData.get('avatar_url') || undefined,
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.flatten().fieldErrors.username?.[0] || validatedFields.error.flatten().fieldErrors.avatar_url?.[0] || 'Invalid input.',
      error: true,
    };
  }

  const { username, avatar_url } = validatedFields.data;

  const profileData: { id: string; username?: string; avatar_url?: string; updated_at: string } = {
    id: user.id,
    updated_at: new Date().toISOString(),
  };

  if (username) profileData.username = username;
  if (avatar_url) profileData.avatar_url = avatar_url;

  const { error } = await supabase.from('profiles').upsert(profileData);

  if (error) {
    console.error('Error updating profile:', error);
    return { message: 'Failed to update profile. Is your username unique?', error: true };
  }

  revalidatePath('/profile');
  revalidatePath('/my-list'); // To update user-nav avatar
  revalidatePath('/browse');
  return { message: 'Profile updated successfully!', success: true };
}
