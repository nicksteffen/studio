'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Define a schema for validating the suggestion form data
const suggestionSchema = z.object({
  title: z.string().min(1, "Title cannot be empty.").max(100, "Title is too long."),
  description: z.string().max(500, "Description is too long.").optional(), // Make description optional
});

type ActionState = {
    message: string;
    error?: boolean;
    success?: boolean;
}

export async function submitSuggestion(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: "You must be logged in to submit suggestions.", error: true };
  }

  // Validate the form data
  const validatedFields = suggestionSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    // Return the first error message from validation
    return {
      message: validatedFields.error.flatten().fieldErrors.title?.[0] ||
               validatedFields.error.flatten().fieldErrors.description?.[0] ||
               "Invalid input.",
      error: true,
    };
  }

  const { title, description } = validatedFields.data;

  try {
    // Insert the new suggestion into the feature_suggestions table
    const { error } = await supabase
      .from('feature_suggestions')
      .insert({
        user_id: user.id,
        title: title,
        description: description,
      });

    if (error) throw error;

    // Revalidate the feedback page to show the new suggestion
    revalidatePath('/feedback');

    return { message: "Suggestion submitted successfully!", success: true };

  } catch (error: any) {
    console.error("Error submitting suggestion:", error);
    return { message: error.message || 'Failed to submit suggestion.', error: true };
  }
}

export async function fetchSuggestions() {
  const supabase = await createClient();

  // Fetch suggestions and join with votes to calculate upvote/downvote counts
  const { data, error } = await supabase
    .from('feature_suggestions')
    .select('*, suggestion_votes(vote_type)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }

  if (!data) {
    return [];
  }

  // Process data to calculate net_votes for each suggestion
  const suggestionsWithVotes = data.map(suggestion => {
    const upvotes = suggestion.suggestion_votes.filter(v => v.vote_type === 'upvote').length;
    const downvotes = suggestion.suggestion_votes.filter(v => v.vote_type === 'downvote').length;
    return {
      ...suggestion,
      net_votes: upvotes - downvotes,
    };
  });

  return suggestionsWithVotes;
}


// Placeholder for addVote (to be implemented later)
export async function addVote(suggestionId: string, voteType: 'upvote' | 'downvote'): Promise<ActionState> {  // This will be implemented to handle voting
  return { message: "Voting not yet implemented.", error: true };
}
