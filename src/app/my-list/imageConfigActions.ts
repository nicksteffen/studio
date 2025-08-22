"use server";

import { createClient } from "@/lib/supabase/server";
import { ImageOptions } from "@/lib/types";
import { revalidatePath } from "next/cache";

/**
 * Server action to save image customization options.
 * In a real application, you would interact with a database here (e.g., Firestore).
 *
 * @param options The ImageOptions object to save.
 */
export async function saveImageOptions(options: ImageOptions, listId: string) {
  console.log("Saving image options on the server:", options);

  //   const listId : string = "temp"
  // Simulate a database save operation
  //   await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_image_options")
    .upsert(
      {
        list_id: listId,
        text_color: options?.textColor,
        background_color: options.backgroundColor,
        font: options.font,
        title_color: options.titleColor,
        item_number_color: options.itemNumberColor,
        completed_item_text_color: options.completedItemTextColor,
        completed_item_icon_color: options.completedItemIconColor,
      },
      { onConflict: "list_id" },
    );
  if (error) {
    return { message: error?.message, error: true };
  }
  revalidatePath("/");
  return { message: "Successful upsert", error: false };
}

export async function getImageOptionsForList(
  listId: string,
): Promise<ImageOptions> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("user_image_options")
      .select(
        `
          text_color,
          background_color,
          font,
          title_color,
          item_number_color,
          completed_item_text_color,
          completed_item_icon_color
        `,
      )
      .eq("list_id", listId)
      .single(); // Use .single() if you expect at most one row for a given list_id

    if (error && error.code !== "PGRST116") {
      // PGRST116 means "No rows found"
      console.error("Error fetching image options:", error);

      throw new Error(`Failed to fetch image options: ${error.message}`);
    }
    const defaultOptions: ImageOptions = {
      backgroundColor: "#fefae0",
      textColor: "#1f2937",
      font: "font-sans",
      titleColor: "#d4a373",
      itemNumberColor: "#9ca3af", // gray-400
      completedItemTextColor: "#6b7280", // gray-500
      completedItemIconColor: "#16a34a", // green-600
    };
    if (!data) {
      return defaultOptions;
    }
    const fetchedOptions: ImageOptions = {
      textColor: data.text_color ?? defaultOptions.textColor,
      backgroundColor: data.background_color ?? defaultOptions.backgroundColor,
      font: data.font ?? defaultOptions.font,
      titleColor: data.title_color ?? defaultOptions.titleColor,
      itemNumberColor: data.item_number_color ?? defaultOptions.itemNumberColor,
      completedItemTextColor:
        data.completed_item_text_color ?? defaultOptions.completedItemTextColor,
      completedItemIconColor:
        data.completed_item_icon_color ?? defaultOptions.completedItemIconColor,
    };

    return fetchedOptions;
  } catch (err) {
    console.error("Unexpected error in getImageOptionsForList:", err);
    throw err; // Re-throw for handling higher up
  }
}
