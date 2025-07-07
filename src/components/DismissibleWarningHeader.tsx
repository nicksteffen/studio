// components/DismissibleWarningHeader.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { X, Timer } from 'lucide-react'; // Import X for dismiss, Timer for countdown

interface DismissibleWarningHeaderProps {
  message: string;
  subMessage?: string; // Optional subtitle/more detailed message
  autoDismissSeconds?: number; // Optional prop to set countdown duration
}

export function DismissibleWarningHeader({ message, subMessage, autoDismissSeconds = 15 }: DismissibleWarningHeaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [countdown, setCountdown] = useState(autoDismissSeconds);

  useEffect(() => {
    if (!isVisible) return; // If already dismissed, stop timer

    const timer = setTimeout(() => {
      setIsVisible(false); // Auto-dismiss after autoDismissSeconds
    }, autoDismissSeconds * 1000);

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval); // Stop interval when countdown reaches 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isVisible, autoDismissSeconds]); // Depend on isVisible and autoDismissSeconds

  if (!isVisible) {
    return null; // Don't render if not visible
  }

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 sticky top-0 z-10 shadow-md flex items-center justify-between" role="alert">
      <div className="flex items-center">
        <p className="font-bold mr-2">{message}</p>
        {subMessage && <p className="text-sm">{subMessage}</p>}
      </div>
      <div className="flex items-center space-x-3">
        {countdown > 0 && (
          <span className="flex items-center text-sm">
            <Timer size={16} className="mr-1" /> {countdown}s
          </span>
        )}
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 rounded-full hover:bg-yellow-200 text-yellow-700 transition-colors duration-200"
          aria-label="Dismiss message"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}