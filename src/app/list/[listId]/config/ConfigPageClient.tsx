// app/list/[listId]/config/ConfigPageClient.tsx (or wherever your component resides)
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, Save, Download, Menu } from 'lucide-react'; // Ensure Menu is imported
import html2canvas from 'html2canvas';
import { useToast } from "@/hooks/use-toast";
import clsx from 'clsx';

// Your existing types and actions
import type { ImageOptions, ListItem } from '@/lib/types';

// Your existing UI components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorPickerInput } from '@/components/ColorPickerInput';
import { Button } from '@/components/ui/button';
import { saveImageOptions } from '@/app/my-list/imageConfigActions'; // Adjust path if necessary
import { ImagePreviewCard } from '@/components/ImagePreviewCard';

// Import Shadcn Sheet components
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  // SheetClose, // Optional: if you want a dedicated close button within the Sheet
} from "@/components/ui/sheet";

// Define a more complete ListData type for props
export interface ListData {
    id: string;
    title: string;
    items: ListItem[];
}

interface ConfigPageClientProps {
    list: ListData;
    initialOptions: ImageOptions;
}

export function ConfigPageClient({ list, initialOptions }: ConfigPageClientProps) {
  const [config, setConfig] = useState<ImageOptions>(initialOptions);
  // Removed isSidebarOpen state as Sheet component manages its own open/close internally
  // const [isSidebarOpen, setIsSidebarOpen] = useState(true); // No longer needed
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Warn user about unsaved changes (keep this, as it's good practice)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  const handleConfigChange = (key: keyof ImageOptions, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    if (!isDirty) setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await saveImageOptions(config, list.id);
    setIsSaving(false);

    if (result.error) {
        toast({ title: "Error", description: `Failed to save configuration: ${result.message}`, variant: "destructive" });
    } else {
        setIsDirty(false);
        toast({ title: "Success!", description: "Configuration saved successfully." });
    }
  };

  const handleGenerateImage = useCallback(() => {
    const previewElement = document.getElementById('image-preview-content');
    if (previewElement) {
      html2canvas(previewElement, {
          useCORS: true,
          scale: 2,
          backgroundColor: config.backgroundColor,
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `${list.title.replace(/\s+/g, '_').toLowerCase()}_list.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  }, [list.title, config.backgroundColor]);

  const fontOptions = [
    { label: 'Sans-serif (Default)', value: 'font-sans' },
    { label: 'Serif', value: 'font-serif' },
    { label: 'Monospace', value: 'font-mono' },
    { label: 'Handwriting', value: 'font-handwriting' },
    { label: 'Headline', value: 'font-headline' },
    { label: 'Display', value: 'font-display' },
  ];

  const colorPickers = [
    { name: "Background Color", key: "backgroundColor", value: config.backgroundColor },
    { name: "Title Color", key: "titleColor", value: config.titleColor },
    { name: "Item Text Color", key: "textColor", value: config.textColor },
    { name: "Item Number Color", key: "itemNumberColor", value: config.itemNumberColor },
    { name: "Completed Item Text", key: "completedItemTextColor", value: config.completedItemTextColor },
    { name: "Completed Item Icon", key: "completedItemIconColor", value: config.completedItemIconColor },
  ];

  // Helper render function for sidebar content (used by both desktop and mobile)
  const renderSidebarContent = () => (
    <>
      <div className="space-y-4 flex-grow">
        {/* Font Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Font</label>
          <Select onValueChange={(value) => handleConfigChange('font', value)} value={config.font}>
            <SelectTrigger className={clsx("w-full", config.font)}>
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
        {/* Color Pickers */}
        {colorPickers.map((colorPicker) => (
          <div key={colorPicker.key}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{colorPicker.name}</label>
            <ColorPickerInput
              id={colorPicker.key} name={colorPicker.key}
              value={colorPicker.value} onChange={(value) => handleConfigChange(colorPicker.key as keyof ImageOptions, value)} />
          </div>
        ))}
      <div className="mt-auto pt-6 flex-shrink-0">
        <Button onClick={handleSave} disabled={!isDirty || isSaving} className="w-full">
          <Save size={18} className="mr-2"/>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:block bg-white dark:bg-gray-800 shadow-lg w-80 overflow-y-auto flex-shrink-0">
        <div className="p-6 h-full flex flex-col">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex-shrink-0">Customize Image</h2>
          {renderSidebarContent()}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-4 md:p-8">
        <div className="flex items-center mb-6">
          {/* Mobile Sidebar Trigger (Hamburger Icon) */}
          <div className="md:hidden mr-4"> {/* Only visible on mobile */}
            <Sheet>
              <SheetTrigger asChild>
                {/* Button to open the mobile sidebar/sheet */}
                <Button variant="outline" size="icon">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:max-w-sm p-6 flex flex-col"> {/* Full width on mobile, or max 320px on small tablets/widescreens */}
                <SheetHeader>
                  <SheetTitle className="text-2xl font-bold text-gray-800 dark:text-white">Customize Image</SheetTitle>
                </SheetHeader>
                {/* Use the helper function to render content */}
                <div className="flex-grow flex flex-col overflow-y-auto mt-4">
                  {renderSidebarContent()}
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Image Preview</h1>
        </div>

        <div className="flex-1 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
          {/* This is the div that will be captured by html2canvas */}
          <ImagePreviewCard listItems={list.items} listTitle={list.title} imageOptions={config}/>
        </div>

        <div className="mt-8 flex justify-center">
          <Button onClick={handleGenerateImage} size="lg" className="rounded-full px-8 py-6 text-lg">
            <Download size={22} className="mr-3"/>
            Generate & Download
          </Button>
        </div>
      </main>
    </div>
  );
}