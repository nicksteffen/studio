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

  // Define the maximum number of items for the first column
  const maxItemsInFirstColumn = 15;
  // Determine if we need to show two columns
  const showTwoColumns = listItems.length > maxItemsInFirstColumn;

  // Split the list items into two arrays
  const firstColumnItems = listItems.slice(0, maxItemsInFirstColumn);
  const secondColumnItems = listItems.slice(maxItemsInFirstColumn);

  return (
    <div
      id="image-preview-content" // Keep the ID if html2canvas relies on it
      className={clsx(
        "w-full p-8 shadow-2xl rounded-lg",
        font,
        {
          "max-w-md": !showTwoColumns, // Default width for single column layout
          "max-w-xl md:max-w-2xl": showTwoColumns, // Wider card for two-column layout on medium screens and up
        }
      )}
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

      {/* Container for list columns. Uses flex-col by default (stacking) and grid on md screens */}
      <div className={clsx(
        "flex flex-col", // Stack columns on small screens
        {
          "md:grid md:grid-cols-2 md:gap-x-8": showTwoColumns // Apply 2-column grid on medium and larger screens
        }
      )}>
        {/* First Column List */}
        <ul className="space-y-3">
          {firstColumnItems.map((item, index) => (
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

        {/* Second Column List - Only render if there are items for it */}
        {showTwoColumns && secondColumnItems.length > 0 && (
          <ul className="space-y-3 mt-6 md:mt-0"> {/* Add top margin for small screens when stacked, no margin on md+ */}
            {secondColumnItems.map((item, index) => (
              <li key={item.id} className="flex items-center text-lg">
                {item.completed ? (
                  <CheckCircle2 size={24} className="mr-4 flex-shrink-0" style={{ color: completedItemIconColor }} />
                ) : (
                  <Circle size={24} className="mr-4 flex-shrink-0" style={{ color: itemNumberColor }} />
                )}
                {/* Correctly continue numbering from the end of the first column */}
                <span style={{ color: itemNumberColor }} className="mr-2">{maxItemsInFirstColumn + index + 1}.</span>
                <span
                  className={clsx({ 'line-through': item.completed })}
                  style={{ color: item.completed ? completedItemTextColor : textColor }}
                >
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}