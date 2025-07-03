'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function login(formData: FormData) {
  console.log("action login")
  const supabase = await createClient()

  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return redirect('/login?message=Invalid credentials. Please try again.')
  }

  const { email, password } = validatedFields.data

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  // console.log(`sign in attempt with ${email}  :   ${password}`)
  // console.log("immediate get user")
  // const {data: user} = await supabase.auth.getUser()
  // console.log(`found user : ${user}`)

  if (error) {
    console.error('Login error:', error.message)
    return redirect('/login?message=Could not authenticate user.')
  }

  revalidatePath('/', 'layout')
  redirect('/my-list')
  // redirect('/test')
}
