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
        top: '-9999px',
        width: '1080px',
        height: '1920px',
      }}
    >
      <div className="font-handwriting bg-[#fefae0] w-[1080px] h-[1920px] p-20 flex flex-col"
        style={{
          backgroundImage: 'linear-gradient(#e9e9e9 2px, transparent 2px), linear-gradient(90deg, #e9e9e9 2px, transparent 2px), linear-gradient(rgba(233,233,233,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(233,233,233,.6) 1px, transparent 1px)',
          backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
          backgroundPosition: '-2px -2px, -2px -2px, -1px -1px, -1px -1px',
        }}
      >
        <div className="text-center mb-12">
            <h1 className="text-8xl font-bold text-[#d4a373]">My 30 Before 30</h1>
        </div>
        
        <ul className="space-y-4 text-5xl text-gray-800 flex-grow">
          {items.slice(0, 30).map((item, index) => (
            <li key={item.id} className="flex items-center relative py-2"
                style={{
                    background: 'repeating-linear-gradient(to bottom, transparent 0, transparent 65px, #9ac2c5 65px, #9ac2c5 67px)'
                }}
            >
              <span className="mr-6 text-gray-500">{index + 1}.</span>
              <span className={item.completed ? 'line-through text-gray-500' : ''}>
                {item.text}
              </span>
              {item.completed && <Check className="h-12 w-12 text-green-600 absolute right-4 top-1/2 -translate-y-1/2" />}
            </li>
          ))}
        </ul>
        
        <div className="text-center mt-12 flex items-center justify-center text-4xl text-[#d4a373]">
           <Sprout className="h-10 w-10 mr-4" /> before30bucket.app
        </div>
      </div>
    </div>
  );
});

ImageGenerator.displayName = 'ImageGenerator';
