// components/ListActions.tsx
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Share2, Eye, Settings, Download, ImageIcon } from 'lucide-react'; // Make sure these icons are imported
import Link from 'next/link'; // For the Config button

// Assuming you have these from your context
import { useToast } from "@/hooks/use-toast"; // Assuming useToast is needed here for Share
import { PremiumUpgradeDialog } from '@/components/PremiumDialog';

interface ListActionsProps {
  listId: string;
  userId: string | null;
  isPremium: boolean;
  onGenerateImage: () => void; // Function to trigger image download
}

export function ListActions({ listId, userId, isPremium, onGenerateImage }: ListActionsProps) {
  const { toast } = useToast();
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = React.useState(false);

  const handleNoUsername = () => {
    toast({
        title: "Set a Username First!",
        description: (
          <span>
            You need a username to share your public profile. You can set one on the{' '}
            <Link href="/profile" className="underline font-bold">Profile page</Link>.
          </span>
        ),
        variant: "default",
    });
  }


  const handleShare = () => {
    if (!userId) {
        handleNoUsername()
    }
    // Replace with actual share logic (e.g., copy link to clipboard)
    const shareLink = `${window.location.origin}/public/${userId}`;
    navigator.clipboard.writeText(shareLink)
      .then(() => {
        toast({ title: "Link copied!", description: "The list URL has been copied to your clipboard.", duration: 3000 });
      })
      .catch(() => {
        toast({ title: "Error", description: "Failed to copy link.", variant: "destructive", duration: 3000 });
      });
  };

  const handleConfigClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isPremium) {
      e.preventDefault();
      setIsUpgradeDialogOpen(true);
    }
    // If premium, Link navigates normally
  };

  return (
    <div className="flex flex-wrap gap-3 justify-center md:justify-end mb-6">
      {/* Share Button */}
      <Button onClick={handleShare} variant="outline" className="flex-grow md:flex-grow-0">
        <Share2 className="mr-2 h-4 w-4" /> Share
      </Button>

      {/* Preview Button */}
      <Link href={`/public/${userId}`} passHref>
        <Button variant="outline" className="flex-grow md:flex-grow-0">
          <Eye className="mr-2 h-4 w-4" /> Preview
        </Button>
      </Link>

      {/* Config Button (with Premium Logic) */}
      <Button variant="outline" asChild className="flex-grow md:flex-grow-0">
        <Link href={`/list/${listId}/config`} onClick={handleConfigClick}>
          <Settings className="mr-2 h-4 w-4" /> Config
        </Link>
      </Button>

      {/* Generate & Download Button */}
    <Button onClick={onGenerateImage} disabled={false}>
        <ImageIcon className="mr-2 h-4 w-4" /> Generate Image
    </Button>

      {/* Premium Upgrade Dialog (reusable component) */}
      <PremiumUpgradeDialog
        isOpen={isUpgradeDialogOpen}
        onClose={() => setIsUpgradeDialogOpen(false)}
      />
    </div>
  );
}