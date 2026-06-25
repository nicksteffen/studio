"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ListItem } from "@/lib/types"; // Import ListItem type

// New Action for updating title
const updateListTitleSchema = z.object({
  listId: z.string().uuid("Invalid List ID"),
  newTitle: z
    .string()
    .min(1, "Title cannot be empty.")
    .max(100, "Title is too long."),
});

const addSuggestionSchema = z.object({
  suggestion: z.string().min(1, "Suggestion is required"),
});

type UpdateTitleState = {
  message: string;
  error?: boolean;
  success?: boolean;
};

export async function updateListTitle(
  prevState: UpdateTitleState,
  formData: FormData,
): Promise<UpdateTitleState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "You must be logged in.", error: true };
  }

  const validatedFields = updateListTitleSchema.safeParse({
    listId: formData.get("listId"),
    newTitle: formData.get("newTitle"),
  });

  if (!validatedFields.success) {
    const errorMessage =
      validatedFields.error.flatten().fieldErrors.newTitle?.[0] ||
      "Invalid input.";
    return { message: errorMessage, error: true };
  }

  const { listId, newTitle } = validatedFields.data;

  try {
    const { error } = await supabase
      .from("lists")
      .update({ title: newTitle })
      .eq("id", listId)
      .eq("user_id", user.id); // Security check to ensure user owns the list

    if (error) throw error;

    revalidatePath("/my-list");
    return { message: "List title updated!", success: true };
  } catch (error: any) {
    console.error(error);
    return { message: "Failed to update list title.", error: true };
  }
}

type ActionState = {
  message: string;
  error?: boolean;
  success?: boolean;
};
export async function addSuggestionToList(
  prevState: AddItemState,
  formData: FormData,
): Promise<AddItemState> {
  const supabase = await createClient();

  const validatedFields = addSuggestionSchema.safeParse({
    suggestion: formData.get("suggestion"),
  });

  if (!validatedFields.success) {
    return {
      message: "Invalid input.",
      error: true,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "You must be logged in to add items.", error: true };
  }

  try {
    // 1. Find the user's list
    let { data: listData, error: listError } = await supabase
      .from("lists")
      .select("id")
      .eq("user_id", user.id)
      .single();

    let listId = listData?.id;

    // 2. If no list, create one
    if (listError && listError.code !== "PGRST116") throw listError;
    if (!listData) {
      const { data: newListData, error: newListError } = await supabase
        .from("lists")
        .insert({ user_id: user.id, title: "My 30 Before 30 List" })
        .select("id")
        .single();
      if (newListError) throw newListError;
      listId = newListData.id;
    }

    if (!listId) {
      throw new Error("Could not find or create a list.");
    }

    // 3. Find the highest position
    const { data: maxPositionData, error: positionError } = await supabase
      .from("list_items")
      .select("position")
      .eq("list_id", listId)
      .order("position", { ascending: false })
      .limit(1)
      .single();

    if (positionError && positionError.code !== "PGRST116") throw positionError;

    const newPosition = (maxPositionData?.position ?? -1) + 1;

    // 4. Insert the new item
    const { error: insertError } = await supabase.from("list_items").insert({
      list_id: listId,
      user_id: user.id,
      text: validatedFields.data.suggestion,
      completed: false,
      category: "Other",
      position: newPosition,
    });

    if (insertError) throw insertError;

    revalidatePath("/my-list");
    return {
      message: `Added "${validatedFields.data.suggestion}" to your list!`,
      success: true,
    };
  } catch (error: any) {
    console.error(error);
    return {
      message: error.message || "An unexpected error occurred.",
      error: true,
    };
  }
}

// New Action for adding a list item
export async function addListItem(
  listId: string,
  text: string,
  position: number,
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "You must be logged in to add items.", error: true };
  }

  try {
    const { data, error } = await supabase
      .from("list_items")
      .insert({
        list_id: listId,
        user_id: user.id,
        text: text,
        completed: false,
        category: "Other",
        position: position,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/my-list");
    // Return the newly created item data to potentially update client state with the correct ID
    return {
      message: "Item added successfully!",
      success: true,
      data: data as ListItem,
    };
  } catch (error: any) {
    console.error(error);
    return { message: error.message || "Failed to add item.", error: true };
  }
}

// New Action for toggling item completion status
export async function toggleItemComplete(
  itemId: string,
  completed: boolean,
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "You must be logged in.", error: true };
  }

  try {
    const { error } = await supabase
      .from("list_items")
      .update({ completed: completed })
      .eq("id", itemId)
      .eq("user_id", user.id); // Security check

    if (error) throw error;

    revalidatePath("/my-list");
    return { message: "Item completion status updated!", success: true };
  } catch (error: any) {
    console.error(error);
    return {
      message: error.message || "Failed to update item completion status.",
      error: true,
    };
  }
}

// New Action for deleting a list item
export async function deleteListItem(itemId: string): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "You must be logged in.", error: true };
  }

  try {
    const { error } = await supabase
      .from("list_items")
      .delete()
      .eq("id", itemId)
      .eq("user_id", user.id); // Security check

    if (error) throw error;

    revalidatePath("/my-list");
    return { message: "Item deleted successfully!", success: true };
  } catch (error: any) {
    console.error(error);
    return { message: error.message || "Failed to delete item.", error: true };
  }
}

// New Action for updating item text
export async function updateListItemText(
  itemId: string,
  text: string,
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "You must be logged in.", error: true };
  }

  try {
    const { error } = await supabase
      .from("list_items")
      .update({ text: text })
      .eq("id", itemId)
      .eq("user_id", user.id); // Security check

    if (error) throw error;

    revalidatePath("/my-list");
    return { message: "Item text updated successfully!", success: true };
  } catch (error: any) {
    console.error(error);
    return {
      message: error.message || "Failed to update item text.",
      error: true,
    };
  }
}

// New Action for updating item positions (drag and drop)
export async function updateListItemPosition(
  updates: { id: string; position: number }[],
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "You must be logged in.", error: true };
  }

  // Optional: Add security check to ensure user owns all items in the update list
  // This might require fetching items first or relying on RLS.
  // For simplicity in this example, we'll assume RLS handles this.

  try {
    // Use a transaction if supported by your Supabase setup for atomicity
    // For simple updates, a loop might suffice, but transactions are safer.
    // Example without explicit transaction (relies on Supabase backend handling):
    const results = await Promise.all(
      updates.map(
        (update) =>
          supabase
            .from("list_items")
            .update({ position: update.position })
            .eq("id", update.id)
            .eq("user_id", user.id), // Ensure user owns the item
      ),
    );

    const firstError = results.find((res) => res.error);

    if (firstError) {
      // You might want more specific error handling here
      throw firstError.error;
    }

    revalidatePath("/my-list");
    return { message: "Item positions updated successfully!", success: true };
  } catch (error: any) {
    console.error(error);
    return {
      message: error.message || "Failed to update item positions.",
      error: true,
    };
  }
}

interface UploadFileState {
  message?: string;
  error?: boolean;
}

export async function uploadListFile(
  formData: FormData,
): Promise<UploadFileState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { message: "You must be logged in.", error: true };
  }

  const itemId = formData.get("itemId") as string;
  if (!itemId) {
    return { message: "Item ID is required.", error: true };
  }
  const file = formData.get("file") as File;
  if (!file) {
    return { message: "File is required.", error: true };
  }
  const bucket = formData.get("bucket") as string;
  if (!bucket) {
    return { message: "Bucket is required.", error: true };
  }
  const field = formData.get("field") as string;
  if (!field) {
    return { message: "Field is required.", error: true };
  }

  // --- Step 1: Check for and delete existing file ---
  const { data: itemData, error: selectError } = await supabase
    .from("list_items")
    .select(field)
    .eq("id", itemId)
    .single();

  if (itemData && itemData[field]) {
    const oldFileUrl = itemData[field] as string;
    const oldFilePath = oldFileUrl.split(`${bucket}/`)[1];
    if (oldFilePath) {
      const { error: removeError } = await supabase.storage
        .from(bucket)
        .remove([oldFilePath]);

      if (removeError) {
        console.error("Failed to delete old file:", removeError);
        // We can continue with the new upload even if old one fails to delete
      }
    }
  }

  // --- Step 2: Upload new file ---
  const fileExt = file.name.split(".").pop();
  const filePath = `${user.id}/${itemId}/${Math.random()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error("File upload failed:", uploadError);
    return { message: "File upload failed.", error: true };
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  if (!urlData) {
    return { message: "Could not get public URL.", error: true };
  }

  // --- Step 3: Update database with new URL ---
  const { data, error } = await supabase
    .from("list_items")
    .update({ [field]: urlData.publicUrl })
    .eq("id", itemId);

  if (error) {
    console.error("Database update failed:", error);
    return { message: "Failed to update database.", error: true };
  }

  revalidatePath("/");

  return { message: "Upload and update successful!" };
}

export async function getItemUrl(id: string, fileType: string) {
  const supabase = await createClient();

  const field = fileType === "photo" ? "photo_url" : "video_url";

  console.log("Getting item URL...");
  const { data: urlData, error: listItemError } = await supabase
    .from("list_items")
    .select(field)
    .eq("id", id)
    .single();

  if (listItemError) {
    console.error("List item error:", listItemError);
    return { message: "Could not get item URL.", error: true };
  }

  if (!urlData) {
    return { message: "Item not found.", error: true };
  }

  console.log(urlData);
  return { message: urlData[field] };
}

interface DeleteFileState {
  message?: string;
  error?: boolean;
}

export async function deleteListFile(
  itemId: string,
  fileType: "photo" | "video",
): Promise<DeleteFileState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "You must be logged in.", error: true };
  }

  // Determine the correct database field and bucket based on fileType
  const field = fileType === "photo" ? "photo_url" : "video_url";
  const bucket = fileType === "photo" ? "list-photos" : "list-videos";

  // Get the current file URL from the database
  const { data: itemData, error: selectError } = await supabase
    .from("list_items")
    .select(field)
    .eq("id", itemId)
    .single();

  if (selectError) {
    console.error("Failed to fetch item:", selectError);
    return { message: "Failed to fetch item data.", error: true };
  }

  const fileUrl = itemData?.[field];
  if (!fileUrl) {
    return { message: "No file found to delete.", error: true };
  }

  // Extract the file path from the full URL
  const filePath = fileUrl.split(`${bucket}/`)[1];

  // Remove the file from the Supabase bucket
  const { error: removeError } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (removeError) {
    console.error("File deletion failed:", removeError);
    return { message: "Failed to delete file from storage.", error: true };
  }

  // Update the database to set the URL to null
  const { error: updateError } = await supabase
    .from("list_items")
    .update({ [field]: null })
    .eq("id", itemId);

  if (updateError) {
    console.error("Database update failed:", updateError);
    return { message: "Failed to update database.", error: true };
  }

  revalidatePath("/");

  return { message: "File deleted successfully!" };
}
