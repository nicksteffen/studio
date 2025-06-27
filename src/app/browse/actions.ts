'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

type AddItemState = {
    message: string;
    error?: boolean;
    success?: boolean;
}

const addItemSchema = z.object({
  itemText: z.string().min(1, "Item text cannot be empty."),
});

export async function addItemFromCommunity(
  prevState: AddItemState,
  formData: FormData
): Promise<AddItemState> {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) { /* The `set` method was called from a Server Component. */ }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) { /* The `delete` method was called from a Server Component. */ }
        },
      },
    }
  );

  const validatedFields = addItemSchema.safeParse({
    itemText: formData.get('itemText'),
  });

  if (!validatedFields.success) {
    return {
      message: "Invalid input.",
      error: true,
    };
  }
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: "You must be logged in to add items.", error: true };
  }
  
  try {
    let { data: listData, error: listError } = await supabase
        .from('lists')
        .select('id')
        .eq('user_id', user.id)
        .single();
    
    let listId = listData?.id;

    if (listError && listError.code !== 'PGRST116') throw listError;
    if (!listData) {
        const { data: newListData, error: newListError } = await supabase
            .from('lists')
            .insert({ user_id: user.id, title: `${user.email?.split('@')[0] || 'My'}'s 30 Before 30 List` })
            .select('id')
            .single();
        if (newListError) throw newListError;
        listId = newListData.id;
    }
    
    if (!listId) {
        throw new Error("Could not find or create a list.");
    }

    const { data: maxPositionData, error: positionError } = await supabase
        .from('list_items')
        .select('position')
        .eq('list_id', listId)
        .order('position', { ascending: false })
        .limit(1)
        .single();
        
    if(positionError && positionError.code !== 'PGRST116') throw positionError;
    
    const newPosition = (maxPositionData?.position ?? -1) + 1;

    const { error: insertError } = await supabase.from('list_items').insert({
        list_id: listId,
        user_id: user.id,
        text: validatedFields.data.itemText,
        completed: false,
        category: 'Other',
        position: newPosition,
    });

    if (insertError) throw insertError;
    
    revalidatePath('/my-list');
    return { message: `Added "${validatedFields.data.itemText}" to your list!`, success: true };

  } catch (error: any) {
    console.error(error);
    return { message: error.message || 'An unexpected error occurred.', error: true };
  }
}
