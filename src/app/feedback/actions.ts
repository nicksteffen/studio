"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Define a schema for validating the suggestion form data
const suggestionSchema = z.object({
  title: z
    .string()
    .min(1, "Title cannot be empty.")
    .max(100, "Title is too long."),
  description: z.string().max(500, "Description is too long.").optional(), // Make description optional
});

type ActionState = {
  message: string;
  error?: boolean;
  success?: boolean;
  // Include the inserted suggestion data on success
  suggestion?: {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
  };
};

export async function submitSuggestion(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      message: "You must be logged in to submit suggestions.",
      error: true,
    };
  }

  // Validate the form data
  const validatedFields = suggestionSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  });

  if (!validatedFields.success) {
    // Return the first error message from validation
    return {
      message:
        validatedFields.error.flatten().fieldErrors.title?.[0] ||
        validatedFields.error.flatten().fieldErrors.description?.[0] ||
        "Invalid input.",
      error: true,
    };
  }

  const { title, description } = validatedFields.data;

  try {
    // Insert the new suggestion into the feature_suggestions table
    const { data, error } = await supabase
      .from("feature_suggestions")
      .insert({
        user_id: user.id,
        title: title,
        description: description,
      })
      .select("*") // Select the inserted data
      .single(); // Expect a single row

    if (error || !data) throw error;

    // Revalidate the feedback page to show the new suggestion
    revalidatePath("/feedback");

    return { message: "Suggestion submitted successfully!", success: true };
  } catch (error: any) {
    console.error("Error submitting suggestion:", error.message);
    return {
      message: error.message || "Failed to submit suggestion.",
      error: true,
    };
  }
}

// Placeholder for addVote (to be implemented later)
export async function addVote(
  suggestionId: string,
  voteType: "upvote" | "downvote",
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "You must be logged in to vote.", error: true };
  }

  const { data, error } = await supabase
    .from("suggestion_votes")
    .select("id, vote_type")
    .eq("user_id", user.id)
    .eq("suggestion_id", suggestionId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 means no row found (user hasn't voted)
    return { message: "Failed to check existing vote.", error: true };
  }

  // checking this error is a mistake, we check above for errors that aren't no rows returned error

  // If user has already voted with the same type,
  // return early -for now, we can bring back removing votes later
  if (data && data.vote_type === voteType) {
    // }
    const { error: deleteError } = await supabase
      .from("suggestion_votes")
      .delete()
      .eq("id", data.id);

    if (deleteError) {
      console.error("Error removing vote:", deleteError.message);
      return { message: "Failed to remove vote.", error: true };
    }
    // we made a successful change, we need to revalidate
    revalidatePath("/feedback");
    return { message: "Vote removed successfully!", success: true };
  }

  // return data || [];

  // Upsert the new vote
  const { error: upsertError } = await supabase.from("suggestion_votes").upsert(
    { user_id: user.id, suggestion_id: suggestionId, vote_type: voteType },
    { onConflict: "user_id, suggestion_id" }, // Define the conflict constraint
  );

  if (upsertError) {
    console.error("Error upserting vote:", upsertError.message);
    return { message: "Failed to record vote.", error: true };
  }

  revalidatePath("/feedback");

  return { message: "Vote recorded successfully!", success: true };
}
