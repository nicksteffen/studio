'use server';

/**
 * @fileOverview A Genkit flow to generate a shareable image of a "30 Before 30" list.
 *
 * - generateListImage - A function that generates an image based on list items.
 * - GenerateListImageInput - The input type for the generateListImage function.
 * - GenerateListImageOutput - The return type for the generateListImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ListItemSchema = z.object({
    text: z.string(),
    completed: z.boolean(),
});

const GenerateListImageInputSchema = z.object({
    items: z.array(ListItemSchema).describe('An array of list items, each with text and a completion status.'),
});
export type GenerateListImageInput = z.infer<typeof GenerateListImageInputSchema>;

const GenerateListImageOutputSchema = z.object({
    imageDataUri: z.string().describe("The generated image as a data URI. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateListImageOutput = z.infer<typeof GenerateListImageOutputSchema>;


function constructPrompt(items: z.infer<typeof ListItemSchema>[]) {
    const listItemsString = items.slice(0, 30).map((item, index) => {
        const status = item.completed ? '[x]' : '[ ]';
        return `${index + 1}. ${status} ${item.text}`;
    }).join('\n');

    return `
      Generate an image optimized for an Instagram Story (1080x1920 pixels).
      The image must look like a "30 Before 30" bucket list written on a piece of yellow legal-style lined paper.
      The writing should be in an elegant, slightly messy, handwritten cursive font, like the "Caveat" font. The ink should be dark blue or black.

      The image must have the following elements:

      1.  **Title:** At the top, in a larger, more stylized handwritten font (like the "Belleza" font), the title should be "My 30 Before 30".

      2.  **List:** Below the title, display the following list items. Each item should have a number and a checkbox. If an item is completed (marked with [x]), the checkbox should be ticked, and the text should have a line through it. If it's not completed (marked with [ ]), the checkbox should be empty.

      ${listItemsString}

      3.  **Footer:** At the very bottom, in a smaller, cleaner font, include the text "before30bucket.app" with a small sprout or leaf icon next to it.

      The overall aesthetic should be charming, personal, and inspiring. The yellow paper should have a faint vertical red line on the left margin, typical of a legal pad. The paper should have light blue horizontal lines.
    `;
}

export async function generateListImage(input: GenerateListImageInput): Promise<GenerateListImageOutput> {
    return generateListImageFlow(input);
}


const generateListImageFlow = ai.defineFlow(
    {
        name: 'generateListImageFlow',
        inputSchema: GenerateListImageInputSchema,
        outputSchema: GenerateListImageOutputSchema,
    },
    async (input) => {
        const prompt = constructPrompt(input.items);

        const { media } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: prompt,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });

        if (!media?.url) {
            throw new Error('Image generation failed to produce an image.');
        }

        return { imageDataUri: media.url };
    }
);
