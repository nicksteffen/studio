'use client';

import { useState, useRef, useEffect, useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { useFormStatus } from 'react-dom';
import { submitSuggestion, addVote } from './actions'; // Import addVote action
import { ThumbsUp, ThumbsDown, LoaderCircle } from 'lucide-react'; // Import icons
import type { User } from '@supabase/supabase-js'; // Import User type
import { cn } from '@/lib/utils'; // Import cn

// Define a type for a suggestion with net votes and potentially user's vote status
interface Suggestion {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    created_at: string;
    net_votes: number;
    userVoteType?: 'upvote' | 'downvote' | null;
    isVoting?: boolean; // Temporary flag for pending vote UI
}

// Helper component to show pending state for submission
const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit Suggestion'}
    </Button>
  );
};

interface FeedbackClientProps {
    initialSuggestions: Suggestion[]; // Use the Suggestion type
    currentUser: User | null; // Pass the current user for identifying user's votes
    initialUserVotes: { suggestion_id: string; vote_type: 'upvote' | 'downvote' }[]; // Pass initial user votes
}

export default function FeedbackClient({ initialSuggestions, currentUser, initialUserVotes }: FeedbackClientProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const isFirstRender = useRef(true);

  const [state, formAction] = useActionState(submitSuggestion, { message: '', error: false, success: false });

  // Initialize suggestions state and merge in user's initial votes
  const [suggestions, setSuggestions] = useState<Suggestion[]>(
      (initialSuggestions || []).map(suggestion => {
          const userVote = initialUserVotes.find(vote => vote.suggestion_id === suggestion.id);
          return {
              ...suggestion,
              userVoteType: userVote ? userVote.vote_type : null
          };
      })
  );


  // Effect to show toast notifications based on submission action state
  useEffect(() => {
    if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
    }
    if (state.message) {
      toast({
        title: state.error ? "Error" : "Success!",
        description: state.message,
        variant: state.error ? "destructive" : "default",
      });
    }
    // Optionally reset the form on success
    if (state.success && formRef.current) {
        formRef.current.reset();
    }
  }, [state, toast]);

    // Optimistic update and action call for voting
  const handleVote = async (suggestionId: string, voteType: 'upvote' | 'downvote') => {
    if (!currentUser) {
        toast({ title: "Login Required", description: "You must be logged in to vote.", variant: "default" });
        return;
    }
    // Note: Full voting logic is not yet implemented in the action.
    toast({ title: "Coming Soon!", description: "Voting functionality is under development." });
  }

  return (
    <div className="w-full max-w-2xl py-12 px-4">
      <h1 className="font-headline text-4xl font-bold tracking-tight text-primary text-center">
        Feature Suggestions
      </h1>
      <p className="mt-2 text-lg text-foreground/80 max-w-2xl mx-auto text-center mb-8">
        Have an idea? Let us know! Vote on your favorite suggestions from the community.
      </p>

      <div className="mb-12">
        <form ref={formRef} action={formAction} className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-headline text-primary">Submit a new suggestion</h2>
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium leading-none">Title</label>
            <Input id="title" name="title" placeholder="e.g., Add custom themes" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium leading-none">Description (optional)</label>
            <Textarea id="description" name="description" placeholder="Describe your idea in more detail..." />
          </div>
          <SubmitButton />
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-headline text-primary text-center">Community Suggestions</h2>
        {suggestions.length === 0 ? (
          <p className="text-center text-muted-foreground">No suggestions yet. Be the first!</p>
        ) : (
          suggestions.map(suggestion => (
            <div key={suggestion.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-bold">{suggestion.title}</h3>
                <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                 <p className="text-xs text-muted-foreground mt-2">
                    Submitted on {new Date(suggestion.created_at).toLocaleDateString()}
                 </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleVote(suggestion.id, 'upvote')} disabled={suggestion.isVoting}>
                    <ThumbsUp className={cn("h-5 w-5", suggestion.userVoteType === 'upvote' && 'text-primary fill-primary/20')} />
                </Button>
                <span className="font-bold w-6 text-center">{suggestion.net_votes}</span>
                <Button variant="ghost" size="icon" onClick={() => handleVote(suggestion.id, 'downvote')} disabled={suggestion.isVoting}>
                    <ThumbsDown className={cn("h-5 w-5", suggestion.userVoteType === 'downvote' && 'text-destructive fill-destructive/20')} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
