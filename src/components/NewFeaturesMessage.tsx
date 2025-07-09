// components/NewFeaturesMessage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"; // Import shadcn's Button component

interface NewFeaturesMessageProps {
  version: string;
  title?: string;
  children: React.ReactNode;
  dismissButtonText?: string;
}

const LOCAL_STORAGE_KEY_PREFIX = 'newFeaturesSeen_';

const NewFeaturesMessage: React.FC<NewFeaturesMessageProps> = ({
  version,
  title = 'What\'s New!',
  children,
  dismissButtonText = 'Got it!',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const localStorageKey = `${LOCAL_STORAGE_KEY_PREFIX}${version}`;

  useEffect(() => {
    // Check if the user has already seen this version's message
    if (typeof window !== 'undefined') { // Ensure localStorage is available (client-side)
      const hasSeen = localStorage.getItem(localStorageKey);
      if (!hasSeen) {
        setIsVisible(true);
      }
    }
  }, [version, localStorageKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Mark this version as seen in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(localStorageKey, 'true');
    }
  };

  if (!isVisible) {
    return null; // Don't render if not visible
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-background text-foreground rounded-lg shadow-lg p-6 max-w-md w-full animate-fade-in-up border border-border">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="leading-relaxed mb-6 text-muted-foreground">
          {children}
        </div>
        <Button
          onClick={handleDismiss}
          className="w-full" // shadcn Button already has good default styling
        >
          {dismissButtonText}
        </Button>
      </div>
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default NewFeaturesMessage;
