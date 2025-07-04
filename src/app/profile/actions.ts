'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be 20 characters or less').optional().or(z.literal('')),
  avatar_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  avatar_file: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size < 4 * 1024 * 1024, 'File size must be less than 4MB.')
    .refine((file) => !file || ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type), 'Invalid file type.'),
});


type ProfileState = {
    message: string;
    error?: boolean;
    success?: boolean;
}

export async function updateProfile(prevState: ProfileState, formData: FormData): Promise<ProfileState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'You must be logged in to update your profile.', error: true };
  }
  
  const avatarFile = formData.get('avatar_file');

  const validatedFields = profileSchema.safeParse({
    username: formData.get('username') || undefined,
    avatar_url: formData.get('avatar_url') || undefined,
    avatar_file: avatarFile && (avatarFile as File).size > 0 ? avatarFile : undefined,
  });

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    const message = errors.username?.[0] || errors.avatar_url?.[0] || errors.avatar_file?.[0] || 'Invalid input.';
    return { message, error: true };
  }

  const { username, avatar_file } = validatedFields.data;
  let { avatar_url } = validatedFields.data;

  // If a file is uploaded, it takes precedence over the URL and is handled first.
  if (avatar_file) {
    const fileExt = avatar_file.name.split('.').pop();
    const filePath = `${user.id}/${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
        .from('profile-avatars')
        .upload(filePath, avatar_file, { upsert: true });

    if (uploadError) {
        console.error('Avatar upload error:', uploadError);
        return { message: 'Failed to upload avatar.', error: true };
    }
    const { data: urlData } = supabase.storage.from('profile-avatars').getPublicUrl(filePath);
    avatar_url = urlData.publicUrl;
  }

  const hasUsernameUpdate = !!username;
  const hasAvatarUpdate = !!avatar_url;

  if (!hasUsernameUpdate && !hasAvatarUpdate) {
      return { message: "No new information to save.", success: true };
  }
  
  const profileData: { id: string; username?: string; avatar_url?: string; updated_at: string } = {
    id: user.id,
    updated_at: new Date().toISOString(),
  };

  if (hasUsernameUpdate) profileData.username = username;
  if (hasAvatarUpdate) profileData.avatar_url = avatar_url;

  const { error } = await supabase.from('profiles').upsert(profileData);

  if (error) {
    console.error('Error updating profile:', error);
    return { message: 'Failed to update profile. Is your username unique?', error: true };
  }

  revalidatePath('/profile');
  revalidatePath('/', 'layout'); // To update user-nav everywhere
  return { message: 'Profile updated successfully!', success: true };
}
