// src/ai/flows/suggest-list-items.ts
'use server';

/**
 * @fileOverview Provides AI-powered suggestions for '30 Before 30' list items.
 *
 * - suggestListItems - A function that suggests list items based on user interests and popular trends.
 * - SuggestListItemsInput - The input type for the suggestListItems function.
 * - SuggestListItemsOutput - The return type for the suggestListItems function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestListItemsInputSchema = z.object({
  interests: z
    .string()
    .describe('A comma-separated list of user interests, e.g., travel, food, adventure.'),
  popularTrends: z
    .string()
    .describe('A comma-separated list of popular trends, e.g., hiking, cooking classes, weekend getaways.'),
  numSuggestions: z
    .number()
    .default(5)
    .describe('The number of list item suggestions to generate.'),
});
export type SuggestListItemsInput = z.infer<typeof SuggestListItemsInputSchema>;

const SuggestListItemsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of suggested list items.'),
});
export type SuggestListItemsOutput = z.infer<typeof SuggestListItemsOutputSchema>;

export async function suggestListItems(input: SuggestListItemsInput): Promise<SuggestListItemsOutput> {
  return suggestListItemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestListItemsPrompt',
  input: {schema: SuggestListItemsInputSchema},
  output: {schema: SuggestListItemsOutputSchema},
  prompt: `You are a helpful assistant that suggests items for a "30 Before 30" list.

  Based on the user's interests and popular trends, generate {{numSuggestions}} suggestions for the list.
  The list items should be inspiring and relevant to the user.

  User Interests: {{{interests}}}
  Popular Trends: {{{popularTrends}}}

  Suggestions:
  `, // Ensure the AI returns a simple, comma-separated list for easy parsing.
});

const suggestListItemsFlow = ai.defineFlow(
  {
    name: 'suggestListItemsFlow',
    inputSchema: SuggestListItemsInputSchema,
    outputSchema: SuggestListItemsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);

    //Improved parsing logic
    if (!output?.suggestions) {
      console.warn('No suggestions received from the model.');
      return {suggestions: []};
    }
    return output!;
  }
);
