'use client';
import React, { forwardRef } from 'react';
import type { ListItem } from '@/lib/types';
import { Sprout, Check } from 'lucide-react';

interface ImageGeneratorProps {
  items: ListItem[];
}

export const ImageGenerator = forwardRef<HTMLDivElement, ImageGeneratorProps>(({ items }, ref) => {
  return (
    <div
      ref={ref}
      className="font-handwriting bg-[#fefae0] p-16 flex flex-col"
      style={{
        position: 'absolute',
        left: '-9999px',
        width: '1080px',
        height: '1920px',
        // This creates the yellow-lined paper effect.
        backgroundImage:
          'linear-gradient(to right, transparent 99px, #fca5a5 99px, #fca5a5 101px, transparent 101px), repeating-linear-gradient(to bottom, #fefae0, #fefae0 calc(1.5em - 1px), #a5b4fc 1.5em)',
        backgroundSize: '100% 1.5em',
        lineHeight: '1.5em',
      }}
    >
      <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-[#d4a373] font-headline">My 30 Before 30</h1>
      </div>
      
      <ul className="text-3xl text-gray-800 flex-grow">
        {items.slice(0, 30).map((item, index) => (
          <li key={item.id} className="flex items-center relative py-1 overflow-hidden">
            <span className="mr-4 text-gray-500">{index + 1}.</span>
            <span className={item.completed ? 'line-through text-gray-500' : ''}>
              {item.text}
            </span>
            {item.completed && <Check className="h-8 w-8 text-green-600 absolute right-4 top-1/2 -translate-y-1/2" />}
          </li>
        ))}
      </ul>
      
      <div className="text-center mt-8 flex items-center justify-center text-2xl text-[#d4a373]">
         <Sprout className="h-6 w-6 mr-3" /> before30bucket.app
      </div>
    </div>
  );
});

ImageGenerator.displayName = 'ImageGenerator';
