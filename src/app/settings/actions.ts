'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const settingsSchema = z.object({
  is_public: z.preprocess((val) => val === 'on', z.boolean()),
});


type SettingsState = {
    message: string;
    error?: boolean;
    success?: boolean;
}

export async function updateSettings(prevState: SettingsState, formData: FormData): Promise<SettingsState> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'You must be logged in to update your settings.', error: true };
  }

  const validatedFields = settingsSchema.safeParse({
    is_public: formData.get('is_public'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid input.',
      error: true,
    };
  }
  
  const { is_public } = validatedFields.data;

  const { error } = await supabase
    .from('lists')
    .update({ is_public: is_public })
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating settings:', error);
    return { message: 'Failed to update settings.', error: true };
  }

  revalidatePath('/settings');
  revalidatePath('/browse'); // If user makes list public/private, browse page needs to know
  return { message: 'Settings updated successfully!', success: true };
}
