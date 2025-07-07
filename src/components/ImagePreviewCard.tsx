// app/components/ImagePreviewCard.tsx
"use client";

import React from 'react';
import clsx from 'clsx';
import { CheckCircle2, Circle } from 'lucide-react';
import type { ImageOptions, ListItem } from '@/lib/types'; // Assuming this path is correct

interface ImagePreviewCardProps {
  listTitle: string;
  listItems: ListItem[];
  imageOptions: ImageOptions;
  hidden?: boolean
}

export function ImagePreviewCard({ listTitle, listItems, imageOptions, hidden }: ImagePreviewCardProps) {
  const {
    backgroundColor,
    font,
    titleColor,
    textColor,
    itemNumberColor,
    completedItemTextColor,
    completedItemIconColor,
  } = imageOptions;

//   const pointerEvents = PointerEvent.

 const hiddenStyles: React.CSSProperties = hidden
    ? {
        position: 'absolute',
        left: -9999, // Move it far off-screen
        top: -9999,
        overflow: 'hidden',
        pointerEvents: 'none', // Prevent interaction
        zIndex: -1, // Ensure it doesn't block anything
      }
    : {};

  return (
    <div
      id="image-preview-content" // Keep the ID if html2canvas relies on it
      className={clsx("w-full max-w-md p-8 shadow-2xl rounded-lg", font)}
      style={{ 
        backgroundColor: backgroundColor,
        ...hiddenStyles 
      }}
    >
      <h2
        className="text-3xl font-bold mb-6 text-center"
        style={{ color: titleColor }}
      >
        {listTitle}
      </h2>
      <ul className="space-y-3">
        {listItems.map((item, index) => (
          <li key={item.id} className="flex items-center text-lg">
            {item.completed ? (
              <CheckCircle2 size={24} className="mr-4 flex-shrink-0" style={{ color: completedItemIconColor }} />
            ) : (
              <Circle size={24} className="mr-4 flex-shrink-0" style={{ color: itemNumberColor }} />
            )}
            <span style={{ color: itemNumberColor }} className="mr-2">{index + 1}.</span>
            <span
              className={clsx({ 'line-through': item.completed })}
              style={{ color: item.completed ? completedItemTextColor : textColor }}
            >
              {item.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}