"use client";

import { useState, useRef, useEffect, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useFormStatus } from "react-dom";
import { submitSuggestion, addVote } from "./actions"; // Import addVote action
import { ThumbsUp, ThumbsDown, LoaderCircle } from "lucide-react"; // Import icons
import type { User } from "@supabase/supabase-js"; // Import User type
import { cn } from "@/lib/utils"; // Import cn

// Define a type for a suggestion with vote counts and user's vote status
interface Suggestion {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  created_at: string;
  upvotes: number;
  downvotes: number;
  userVoteType?: "upvote" | "downvote" | null;
  isVoting?: boolean; // Temporary flag for pending vote UI
}

// Helper component to show pending state for submission
const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Submitting..." : "Submit Suggestion"}
    </Button>
  );
};

interface FeedbackClientProps {
  initialSuggestions: Suggestion[];
  currentUser: User | null;
}

export default function FeedbackClient({
  initialSuggestions,
  currentUser,
}: FeedbackClientProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction] = useActionState(submitSuggestion, {
    message: "",
    error: false,
    success: false,
  });

  // Use suggestions state to manage the list in the client component
  const [suggestions, setSuggestions] =
    useState<Suggestion[]>(initialSuggestions);

  // Effect to update suggestions state when initialSuggestions prop changes
  useEffect(() => {
    setSuggestions(initialSuggestions);
  }, [initialSuggestions]); // Add initialSuggestions as a dependency

  // Effect to show toast notifications and reset form on success
  useEffect(() => {
    if (state.message) {
      toast({
        title: state.error ? "Error" : "Success!",
        description: state.message,
        variant: state.error ? "destructive" : "default",
      });
    }
    // Reset form on success
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state, toast]);

  // Handle voting
  const handleVote = async (
    suggestionId: string,
    voteType: "upvote" | "downvote",
  ) => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "You must be logged in to vote.",
        variant: "default",
      });
      return;
    }

    // Optimistic update
    setSuggestions(
      suggestions.map((suggestion) => {
        if (suggestion.id === suggestionId) {
          let newUpvotes = suggestion.upvotes;
          let newDownvotes = suggestion.downvotes;
          let newUserVoteType = suggestion.userVoteType;

          if (suggestion.userVoteType === voteType) {
            // User is clicking the same vote type, remove their vote
            if (voteType === "upvote") newUpvotes--;
            else newDownvotes--;
            newUserVoteType = null;
          } else {
            // User is changing their vote or casting a new vote
            if (suggestion.userVoteType === "upvote") newUpvotes--; // Remove previous upvote
            if (suggestion.userVoteType === "downvote") newDownvotes--; // Remove previous downvote

            if (voteType === "upvote")
              newUpvotes++; // Add new upvote
            else newDownvotes++; // Add new downvote
            newUserVoteType = voteType;
          }

          return {
            ...suggestion,
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            userVoteType: newUserVoteType,
            isVoting: true, // Set voting state
          };
        }
        return suggestion;
      }),
    );

    // Call the server action
    const result = await addVote(suggestionId, voteType);

    // Handle server action response (optional: revert optimistic update on error)
    if (result.error) {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
      // Optional: Revert the optimistic update if the server action failed
      // You would need to store the original state before the optimistic update
    }

    // After the server action completes (success or failure), reset the isVoting state
    setSuggestions(
      suggestions.map((suggestion) => {
        if (suggestion.id === suggestionId) {
          return {
            ...suggestion,
            isVoting: false,
          };
        }
        return suggestion;
      }),
    );
  };

  return (
    <div className="w-full max-w-2xl py-12 px-4">
      <h1 className="font-headline text-4xl font-bold tracking-tight text-primary text-center">
        Feature Suggestions
      </h1>
      <p className="mt-2 text-lg text-foreground/80 max-w-2xl mx-auto text-center mb-8">
        Have an idea? Let us know! Vote on your favorite suggestions from the
        community.
      </p>

      <div className="mb-12">
        <form
          ref={formRef}
          action={formAction}
          className="space-y-4 rounded-lg border bg-card p-6 shadow-sm"
        >
          <h2 className="text-xl font-headline text-primary">
            Submit a new suggestion
          </h2>
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium leading-none">
              Title
            </label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Add custom themes"
              required
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium leading-none"
            >
              Description (optional)
            </label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your idea in more detail..."
            />
          </div>
          <SubmitButton />
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-headline text-primary text-center">
          Community Suggestions
        </h2>
        {suggestions.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No suggestions yet. Be the first!
          </p>
        ) : (
          suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <h3 className="font-bold">{suggestion.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {suggestion.description}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Submitted on{" "}
                  {new Date(suggestion.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleVote(suggestion.id, "upvote")}
                  disabled={suggestion.isVoting}
                >
                  {suggestion.isVoting &&
                  suggestion.userVoteType === "upvote" ? (
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                  ) : (
                    <ThumbsUp
                      className={cn(
                        "h-5 w-5",
                        suggestion.userVoteType === "upvote" &&
                          "text-primary fill-primary/20",
                      )}
                    />
                  )}
                </Button>
                {/* Display upvotes and downvotes */}
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground leading-none">
                    Up
                  </span>
                  <span className="font-bold text-sm">
                    {suggestion.upvotes}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground leading-none">
                    Down
                  </span>
                  <span className="font-bold text-sm">
                    {suggestion.downvotes}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleVote(suggestion.id, "downvote")}
                  disabled={suggestion.isVoting}
                >
                  {suggestion.isVoting &&
                  suggestion.userVoteType === "downvote" ? (
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                  ) : (
                    <ThumbsDown
                      className={cn(
                        "h-5 w-5",
                        suggestion.userVoteType === "downvote" &&
                          "text-destructive fill-destructive/20",
                      )}
                    />
                  )}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
