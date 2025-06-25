'use server';

import { suggestListItems, SuggestListItemsInput } from '@/ai/flows/suggest-list-items';
import { z } from 'zod';

const suggestionSchema = z.object({
  interests: z.string().min(3, "Please tell us a bit more about your interests."),
});

type SuggestionState = {
  message: string;
  suggestions?: string[];
  error?: boolean;
}

export async function getSuggestions(
  prevState: SuggestionState,
  formData: FormData
): Promise<SuggestionState> {
  const validatedFields = suggestionSchema.safeParse({
    interests: formData.get('interests'),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.flatten().fieldErrors.interests?.[0] || "Invalid input.",
      error: true,
    };
  }

  try {
    const input: SuggestListItemsInput = {
      interests: validatedFields.data.interests,
      popularTrends: 'hiking, cooking classes, weekend getaways, learning an instrument, solo travel', // Could be dynamic in a full app
      numSuggestions: 5,
    };
    const result = await suggestListItems(input);
    
    if (result.suggestions && result.suggestions.length > 0) {
      return {
        message: 'Here are some ideas for you!',
        suggestions: result.suggestions,
      };
    } else {
        return { message: "We couldn't generate suggestions right now. Try a different topic!", error: true };
    }
  } catch (error) {
    console.error(error);
    return { message: 'An unexpected error occurred. Please try again.', error: true };
  }
}
