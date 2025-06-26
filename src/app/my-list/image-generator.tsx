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
      style={{
        position: 'absolute',
        left: '-9999px',
        width: '1080px',
        height: '1920px',
      }}
    >
      <div
        className="w-full h-full bg-[#fefae0] p-12 flex flex-col font-sans"
      >
        <div className="text-center mb-8">
            <h1 className="text-8xl font-bold text-[#d4a373] font-headline">My 30 Before 30</h1>
        </div>
        
        <ul className="text-3xl text-gray-800 flex-grow space-y-1">
          {items.slice(0, 30).map((item, index) => (
            <li key={item.id} className="flex items-start text-4xl">
              <span className="w-14 font-sans text-right mr-4 text-gray-400 text-3xl pt-1">
                {index + 1}.
              </span>
              <span className={`flex-1 font-handwriting ${item.completed ? 'line-through text-gray-500' : ''}`}>
                {item.text}
              </span>
              {item.completed && <Check className="h-10 w-10 text-green-600 ml-4" />}
            </li>
          ))}
        </ul>
        
        <div className="text-center mt-8 flex items-center justify-center text-2xl text-[#d4a373] font-headline">
           <Sprout className="h-6 w-6 mr-3" /> before30bucket.app
        </div>
      </div>
    </div>
  );
});

ImageGenerator.displayName = 'ImageGenerator';
