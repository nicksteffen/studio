// 'use client';

// import React, { forwardRef, useState } from 'react';
// import clsx from 'clsx';
// import { Sprout, Check, CheckCircle2, Circle } from 'lucide-react';
// import { ListData } from '../[listId]/config/ConfigPageClient';

// // Define allowed font families for better type safety and auto-completion
// type FontClasses = 'font-sans' | 'font-serif' | 'font-mono' | 'font-handwriting' | 'font-headline' | 'font-display';

// // Define the structure for a list item
// export interface ListItem {
//   id: string;
//   text: string;
//   completed: boolean;
// }

// // Define the customizable options for the image generator
// // All color properties are now expected to be hex strings (e.g., '#123456')
// export interface ImageOptions {
//   textColor?: string; // Hex color string (e.g., '#123456')
//   backgroundColor?: string; // Hex color string (e.g., '#abcdef')
//   font?: FontClasses; // Overall font for the list items and general text
//   titleColor?: string; // Hex color string
//   itemNumberColor?: string; // Hex color string
//   completedItemTextColor?: string; // Hex color string for completed items
//   completedItemIconColor?: string; // Hex color string for the checkmark icon
// }

// // Props for the ImageGenerator component
// interface ImageGeneratorProps {
//     // list : ListData
//     // initialOptions: ImageOptions; // Options are now expected to be passed, with hex colors
//   items: ListItem[];
//   listTitle: string;
//   options: ImageOptions;
// }

// // export const ImageGenerator = forwardRef<HTMLDivElement, ImageGeneratorProps>(({ list, initialOptions } : ImageGeneratorProps) => {
// export const ImageGenerator = forwardRef<HTMLDivElement, ImageGeneratorProps>(({ items, listTitle, options }, ref) => {
//     const defaultColors = {
//         backgroundColor: '#fefae0',
//         textColor: '#1f2937', // text-gray-800
//         titleColor: '#d4a373',
//         itemNumberColor: '#9ca3af', // text-gray-400
//         completedItemTextColor: '#6b7280', // text-gray-500
//         completedItemIconColor: '#16a34a', // text-green-600
//     };
//     const [config, setConfig] = useState<ImageOptions>(options);

       
//     //    <div className="flex-1 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
//     //       {/* This is the div that will be captured by html2canvas */}
//     //       <div
//     //         id="image-preview-content"
//     //         className={clsx("w-full max-w-md p-8 shadow-2xl rounded-lg", config.font)}
//     //         style={{ backgroundColor: config.backgroundColor }}
//     //       >
//     //         <h2
//     //           className="text-3xl font-bold mb-6 text-center"
//     //           style={{ color: config.titleColor }}
//     //         >
//     //           {list.title}
//     //         </h2>
//     //         <ul className="space-y-3">
//     //           {list.items.map((item, index) => (
//     //             <li key={item.id} className="flex items-center text-lg">
//     //               {item.completed ? (
//     //                 <CheckCircle2 size={24} className="mr-4 flex-shrink-0" style={{ color: config.completedItemIconColor }} />
//     //               ) : (
//     //                 <Circle size={24} className="mr-4 flex-shrink-0" style={{ color: config.itemNumberColor }} />
//     //               )}
//     //               <span style={{color: config.itemNumberColor}} className="mr-2">{index + 1}.</span>
//     //               <span
//     //                 className={clsx({ 'line-through': item.completed })}
//     //                 style={{ color: item.completed ? config.completedItemTextColor : config.textColor }}
//     //               >
//     //                 {item.text}
//     //               </span>
//     //             </li>
//     //           ))}
//     //         </ul>
//     //       </div>
//     //     </div>
//     //    )
//     return (
//         <></>
//     )
// }
