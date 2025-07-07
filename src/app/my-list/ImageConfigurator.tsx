'use client';

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button'; // Assuming you have a shadcn Button
import { ChevronDown, ChevronUp } from 'lucide-react'; // For the toggle icon
import { ColorPickerInput } from '@/components/ColorPickerInput';
import { ImageOptions } from './image-generator';
import { saveImageOptions } from './imageConfigActions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


// Define the props for the ImageConfigurator component
interface ImageConfiguratorProps {
  initialOptions: ImageOptions;
  initialListId: string;
  onSave: (options: ImageOptions) => Promise<void>
}

export function ImageConfigurator({ initialOptions, initialListId, onSave}: ImageConfiguratorProps) {
  // State to manage the customizable options
  const [options, setOptions] = useState<ImageOptions>(initialOptions);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false); // State for the collapsible
  const [listId, setListId] = useState(initialListId)

  // Update local state if initialOptions change (e.g., after a save or initial load)
  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  // Handler for input changes (for non-color inputs like font)
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOptions(prevOptions => ({
      ...prevOptions,
      [name]: value === '' ? undefined : value, // Set to undefined if input is empty
    }));
  };

  // Generic handler for ColorPickerInput changes
  const handleColorChange = (name: keyof ImageOptions, value: string) => {
    setOptions(prevOptions => ({
      ...prevOptions,
      [name]: value, // Color picker yields hex, so directly use it
    }));
  };

     // Handler for input changes (for non-color inputs like font)
  // This now handles the value change from shadcn/ui Select
  const handleFontChange = (value: string) => {
    setOptions(prevOptions => ({
      ...prevOptions,
      font: value === '' ? undefined : (value as any), // Cast value to FontClasses if needed
    }));
  };

  // Handler for saving options via server action
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
    //   await saveImageOptions(options, listId);
      onSave(options);
      setSaveMessage('Options saved successfully!');
    } catch (error) {
      console.error('Failed to save options:', error);
      setSaveMessage('Failed to save options.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000); // Clear message after 3 seconds
    }
  };


  const colorOptions = [
    { label: 'Default Background', value: '#fefae0' },
    { label: 'Light Blue', value: '#dbeafe' }, // bg-blue-100
    { label: 'Light Green', value: '#dcfce7' }, // bg-green-100
    { label: 'Light Purple', value: '#ede9fe' }, // bg-purple-100
    { label: 'Dark Gray', value: '#1f2937' }, // bg-gray-800
  ];

  const textColorOptions = [
    { label: 'Default Text', value: '#1f2937' }, // text-gray-800
    { label: 'Dark Brown', value: '#d4a373' },
    { label: 'Blue', value: '#2563eb' }, // text-blue-600
    { label: 'Green', value: '#16a34a' }, // text-green-600
    { label: 'White', value: '#ffffff' }, // text-white
  ];

  // Predefined font classes for selection
  const fontOptions = [
    { label: 'Sans-serif (Default)', value: 'font-sans' },
    { label: 'Serif', value: 'font-serif' },
    { label: 'Monospace', value: 'font-mono' },
    { label: 'Handwriting', value: 'font-handwriting' },
    { label: 'Headline', value: 'font-headline' },
    { label: 'Display', value: 'font-display' },
  ];

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full mx-auto mt-8 p-4 border rounded-lg shadow-sm bg-white"
    >
      <div className="flex items-center justify-between px-4 py-2">
        <h4 className="text-lg font-semibold text-gray-800">Customize Image Output</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span className="sr-only">Toggle customization</span>
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <div className="grid gap-4 py-4">
          {/* Background Color */}
          <div>
            <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700 mb-1">
              Background Color
            </label>
            <ColorPickerInput
              id="backgroundColor"
              name="backgroundColor"
              value={options.backgroundColor}
              onChange={(value) => handleColorChange('backgroundColor', value)}
            />
            {/* Quick pick buttons for background colors */}
            <div className="flex flex-wrap gap-2 mt-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorChange('backgroundColor', color.value.replace('bg-', ''))} // Extract hex or class name
                  className={clsx(
                    "px-3 py-1 rounded-full text-sm border",
                    // `bg-[${color.value}]`, // Apply the actual Tailwind class for visual representation
                    // Adjust text color for visibility based on background
                    // color.value.startsWith('bg-gray-800') || color.value.startsWith('bg-[#fefae0]') ? 'text-gray-800 border-gray-300' : 'text-gray-800 border-gray-300'
                  )}
                  style={{backgroundColor: color.value, color: color.value.startsWith('#1f2937') ? 'white' : 'dark-gray'}}
                //   style={color.value.startsWith('bg-[#') ? { backgroundColor: color.value.replace('bg-[', '').replace(']', '') } : {}}
                >
                  {color.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Color */}
          <div>
            <label htmlFor="textColor" className="block text-sm font-medium text-gray-700 mb-1">
              List Item Text Color
            </label>
            <ColorPickerInput
              id="textColor"
              name="textColor"
              value={options.textColor}
              onChange={(value) => handleColorChange('textColor', value)}
            />
            {/* Quick pick buttons for text colors */}
            <div className="flex flex-wrap gap-2 mt-2">
              {textColorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorChange('textColor', color.value.replace('text-', ''))} // Extract hex or class name
                  className={clsx(
                    "px-3 py-1 rounded-full text-sm border border-gray-300",
                    // `text-[${color.value}]`, // Apply the actual Tailwind class
                    // color.value.startsWith('text-white') ? 'bg-gray-700' : '' // Add background for white text
                  )}
                  style={{color: color.value, backgroundColor: color.value.startsWith('#ffff') ? 'darkgray' : 'white'}}
                >
                  {color.label}
                </button>
              ))}
            </div>
          </div>


          <div>
            <label htmlFor="font" className="block text-sm font-medium text-gray-700 mb-1">
              Overall Font
            </label>
            <Select onValueChange={handleFontChange} value={options.font || ''} >
              <SelectTrigger className={clsx("w-full", options.font || '')}>
                <SelectValue placeholder="Select a font" />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font.value} value={font.value} className={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title Color */}
          <div>
            <label htmlFor="titleColor" className="block text-sm font-medium text-gray-700 mb-1">
              Title Color
            </label>
            <ColorPickerInput
              id="titleColor"
              name="titleColor"
              value={options.titleColor}
              onChange={(value) => handleColorChange('titleColor', value)}
            />
          </div>

          {/* Item Number Color */}
          <div>
            <label htmlFor="itemNumberColor" className="block text-sm font-medium text-gray-700 mb-1">
              Item Number Color
            </label>
            <ColorPickerInput
              id="itemNumberColor"
              name="itemNumberColor"
              value={options.itemNumberColor}
              onChange={(value) => handleColorChange('itemNumberColor', value)}
            />
          </div>

          {/* Completed Item Text Color */}
          <div>
            <label htmlFor="completedItemTextColor" className="block text-sm font-medium text-gray-700 mb-1">
              Completed Item Text Color
            </label>
            <ColorPickerInput
              id="completedItemTextColor"
              name="completedItemTextColor"
              value={options.completedItemTextColor}
              onChange={(value) => handleColorChange('completedItemTextColor', value)}
            />
          </div>

          {/* Completed Item Icon Color */}
          <div>
            <label htmlFor="completedItemIconColor" className="block text-sm font-medium text-gray-700 mb-1">
              Completed Item Icon Color
            </label>
            <ColorPickerInput
              id="completedItemIconColor"
              name="completedItemIconColor"
              value={options.completedItemIconColor}
              onChange={(value) => handleColorChange('completedItemIconColor', value)}
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Customizations'}
          </button>
          {saveMessage && (
            <p className={clsx("mt-2 text-center text-sm", saveMessage.includes('successfully') ? 'text-green-600' : 'text-red-600')}>
              {saveMessage}
            </p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

