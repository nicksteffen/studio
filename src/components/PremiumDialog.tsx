// components/PremiumUpgradeDialog.tsx
"use client";

import React from 'react';
import Link from 'next/link'; // For Next.js navigation
import { Button } from "@/components/ui/button"; // Your shadcn button

// Import Shadcn Dialog components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"; // Adjust this path if necessary

interface PremiumUpgradeDialogProps {
  isOpen: boolean; // Controls whether the dialog is open
  onClose: () => void; // Callback function to close the dialog
}

export function PremiumUpgradeDialog({ isOpen, onClose }: PremiumUpgradeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md"> {/* Adjust max-width as needed for the dialog */}
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            Unlock Premium Customization!
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            This advanced customization feature is available exclusively to premium subscribers. Upgrade your account to personalize your lists with full control over colors, fonts, and more!
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-2"> {/* Content area with padding and spacing */}
          <p className="text-sm text-gray-700 dark:text-gray-300">
            As a premium member, you'll gain access to:
          </p>
          <ul className="list-disc list-inside ml-4 text-sm text-gray-800 dark:text-gray-200 space-y-1">
            <li> Customizable My List Image Generator</li>
            <li> Unlimited AI Idea Generation </li>
            <li>Create and Manage Multiple Lists</li>
            <li>Advanced List Styling for Sharing</li>
            <li>Ad-Free Browsing Experience</li>
            <li>Priority Support</li>
            <li>Keep Your Lists Private</li>
            <li>And much more!</li>
          </ul>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <DialogClose asChild>
            <Button variant="secondary">Maybe later</Button>
          </DialogClose>
          {/* The upgrade button links to the billing page and closes the dialog */}
          <Button asChild>
            <Link href="/billing" onClick={onClose}> {/* onClose will close the dialog */}
              Upgrade to Premium!
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}