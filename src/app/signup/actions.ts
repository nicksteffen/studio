'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
})

export async function signup(formData: FormData) {
  const supabase = createClient()

  const validatedFields = signupSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    const errorMessage = validatedFields.error.errors[0]?.message || 'Invalid input.';
    return redirect(`/signup?message=${encodeURIComponent(errorMessage)}`);
  }

  const { email, password } = validatedFields.data

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // For email confirmation, you would need to configure this
      // emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    }
  })

  if (error) {
    console.error('Signup error:', error.message)
    return redirect(`/signup?message=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/profile')
}
