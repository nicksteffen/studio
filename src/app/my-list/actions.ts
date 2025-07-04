'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// New Action for updating title
const updateListTitleSchema = z.object({
  listId: z.string().uuid("Invalid List ID"),
  newTitle: z.string().min(1, "Title cannot be empty.").max(100, "Title is too long."),
});

type UpdateTitleState = {
  message: string;
  error?: boolean;
  success?: boolean;
}

export async function updateListTitle(
  prevState: UpdateTitleState,
  formData: FormData
): Promise<UpdateTitleState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: "You must be logged in.", error: true };
  }

  const validatedFields = updateListTitleSchema.safeParse({
    listId: formData.get('listId'),
    newTitle: formData.get('newTitle'),
  });

  if (!validatedFields.success) {
    const errorMessage = validatedFields.error.flatten().fieldErrors.newTitle?.[0] || "Invalid input.";
    return { message: errorMessage, error: true };
  }

  const { listId, newTitle } = validatedFields.data;

  try {
    const { error } = await supabase
      .from('lists')
      .update({ title: newTitle })
      .eq('id', listId)
      .eq('user_id', user.id); // Security check to ensure user owns the list

    if (error) throw error;

    revalidatePath('/my-list');
    return { message: "List title updated!", success: true };
  } catch (error: any) {
    console.error(error);
    return { message: "Failed to update list title.", error: true };
  }
}

type AddItemState = {
    message: string;
    error?: boolean;
    success?: boolean;
}

const addSuggestionSchema = z.object({
  suggestion: z.string().min(1, "Suggestion cannot be empty."),
});

export async function addSuggestionToList(
  prevState: AddItemState,
  formData: FormData
): Promise<AddItemState> {
  const supabase = await createClient();

  const validatedFields = addSuggestionSchema.safeParse({
    suggestion: formData.get('suggestion'),
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
    // 1. Find the user's list
    let { data: listData, error: listError } = await supabase
        .from('lists')
        .select('id')
        .eq('user_id', user.id)
        .single();
    
    let listId = listData?.id;

    // 2. If no list, create one
    if (listError && listError.code !== 'PGRST116') throw listError;
    if (!listData) {
        const { data: newListData, error: newListError } = await supabase
            .from('lists')
            .insert({ user_id: user.id, title: "My 30 Before 30 List" })
            .select('id')
            .single();
        if (newListError) throw newListError;
        listId = newListData.id;
    }
    
    if (!listId) {
        throw new Error("Could not find or create a list.");
    }

    // 3. Find the highest position
    const { data: maxPositionData, error: positionError } = await supabase
        .from('list_items')
        .select('position')
        .eq('list_id', listId)
        .order('position', { ascending: false })
        .limit(1)
        .single();
        
    if(positionError && positionError.code !== 'PGRST116') throw positionError;
    
    const newPosition = (maxPositionData?.position ?? -1) + 1;

    // 4. Insert the new item
    const { error: insertError } = await supabase.from('list_items').insert({
        list_id: listId,
        user_id: user.id,
        text: validatedFields.data.suggestion,
        completed: false,
        category: 'Other',
        position: newPosition,
    });

    if (insertError) throw insertError;
    
    revalidatePath('/my-list');
    return { message: `Added "${validatedFields.data.suggestion}" to your list!`, success: true };

  } catch (error: any) {
    console.error(error);
    return { message: error.message || 'An unexpected error occurred.', error: true };
  }
}
