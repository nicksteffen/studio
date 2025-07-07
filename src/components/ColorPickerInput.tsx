'use client';

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

// Define props for the ColorPickerInput component
interface ColorPickerInputProps {
  id: string;
  name: string;
  value?: string; // Current value (hex string, e.g., '#RRGGBB')
  onChange: (value: string) => void; // Callback when color changes
  label?: string; // Optional label for the input
  className?: string; // Optional additional classes for the container
}

export function ColorPickerInput({
  id,
  name,
  value,
  onChange,
  label,
  className
}: ColorPickerInputProps) {
  // Internal state to manage the color input's value
  // Ensure it's always a valid hex string, defaulting to #000000
  const [internalValue, setInternalValue] = useState<string>(value || '#000000');
  // Update internal state if the prop value changes from parent
  useEffect(() => {
    if (value && value !== internalValue) {
      // Ensure the value is a valid hex before setting
      const hexMatch = value.match(/^#([0-9A-Fa-f]{3}){1,2}$/);
      if (hexMatch) {
        setInternalValue(value);
      } else {
        // If the passed value is not a valid hex, try to convert it
        // For Tailwind classes like 'text-blue-500', we can't easily get a hex.
        // So, if it's not a hex, default to black or the last valid hex.
        console.warn(`ColorPickerInput: Invalid hex color value received: ${value}. Defaulting to #000000.`);
        setInternalValue('#000000');
      }
    } else if (!value && internalValue !== '#000000') {
        // If parent passes undefined/null, reset to default black
        setInternalValue('#000000');
    }
  }, [value]); // Depend on the 'value' prop

  // Handle changes from the color input
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setInternalValue(newHex); // Update internal state
    onChange(newHex); // Notify parent component
  };

  // Handle changes from the text input (allows manual hex entry)
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newHex = e.target.value;
    // Basic validation to ensure it starts with # and is a valid hex format
    if (!newHex.startsWith('#')) {
      newHex = '#' + newHex;
    }
    // Only update internal state and notify parent if it's a valid hex
    const hexMatch = newHex.match(/^#([0-9A-Fa-f]{3}){1,2}$/);
    if (hexMatch) {
      setInternalValue(newHex);
      onChange(newHex);
    } else {
        // If not a valid hex, just update internal state for typing, but don't notify parent yet
        setInternalValue(newHex);
    }
  };


  return (
    <div className={clsx("flex items-center space-x-2", className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        type="color"
        id={`${id}-color-picker`}
        name={`${name}-color-picker`}
        value={internalValue}
        onChange={handleColorChange}
        className="w-10 h-10 p-0 border-none rounded-md cursor-pointer overflow-hidden"
        title="Pick a color"
      />
      <input
        type="text"
        id={id}
        name={name}
        value={internalValue}
        onChange={handleTextChange}
        placeholder="#RRGGBB"
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
    </div>
  );
}
