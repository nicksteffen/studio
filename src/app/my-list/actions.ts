'use server';

import { generateListImage, GenerateListImageInput } from '@/ai/flows/generate-list-image';
import type { ListItem } from '@/lib/types';
import { z } from 'zod';

const generateImageSchema = z.object({
  items: z.array(
    z.object({
      text: z.string(),
      completed: z.boolean(),
      id: z.string(),
      category: z.string(),
      position: z.number(),
      list_id: z.string(),
      user_id: z.string(),
      created_at: z.string(),
    })
  ),
});

type GenerateImageState = {
    imageDataUri?: string;
    error?: string;
};

export async function generateListImageAction(
  input: { items: ListItem[] }
): Promise<GenerateImageState> {
  const validatedFields = generateImageSchema.safeParse(input);

  if (!validatedFields.success) {
    return {
      error: 'Invalid input data for image generation.',
    };
  }

  try {
    const flowInput: GenerateListImageInput = {
      items: validatedFields.data.items.map(item => ({ text: item.text, completed: item.completed })),
    };
    const result = await generateListImage(flowInput);
    
    if (result.imageDataUri) {
      return { imageDataUri: result.imageDataUri };
    } else {
      return { error: "The AI failed to generate an image. Please try again." };
    }
  } catch (error: any) {
    console.error("Error in generateListImageAction:", error);
    return { error: error.message || 'An unexpected error occurred during image generation.' };
  }
}
