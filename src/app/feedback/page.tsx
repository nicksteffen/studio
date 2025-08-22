import FeedbackClient from "./feedback-client";
import { createClient } from "@/lib/supabase/server";
import { kMaxLength } from "buffer";
import { toast } from "@/hooks/use-toast";
import { redirect } from "next/navigation";

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

export default async function FeedbackPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
    // In a real app, you'd likely want a more user-friendly redirect or message
    redirect("/login");
  }

  const { data: suggestionsData, error: suggestionsError } = await supabase
    .from("feature_suggestions")
    .select("id, user_id, title, description, created_at")
    .order("created_at", { ascending: false });

  const { data: votesData, error: votesError } = await supabase
    .from("suggestion_votes")
    .select("suggestion_id, vote_type, user_id");

  if (suggestionsError) {
    console.error("Error fetching suggestions:", suggestionsError.message);
    // Handle error appropriately, maybe show an error message on the page
    return (
      <div className="flex flex-col items-center justify-center">
        Error loading suggestions.
      </div>
    );
  }

  if (votesError) {
    console.error("Error fetching votes:", votesError.message);
    // Decide how to handle vote fetching errors (show suggestions without votes, show error, etc.)
    // For now, we'll proceed without vote data if there's an error
  }

  const allVotes = votesData || [];

  // const initialSuggestionItems : Suggestion[] = data ? data.map(fetchedSuggestion => ({
  // const initialSuggestionItems : Suggestion[] = initialSuggestions.map(fetchedSuggestion => ({
  // ...fetchedSuggestion,
  // net_votes: 0,
  // userVoteType: null,
  // isVoting: false,
  // })) : []; // Initialize with empty suggestions if data is null

  // Process votes and merge with suggestions
  const suggestionsWithVotes: Suggestion[] = (suggestionsData || []).map(
    (suggestion) => {
      const suggestionVotes = allVotes.filter(
        (vote) => vote.suggestion_id === suggestion.id,
      );
      const upvotes = suggestionVotes.filter(
        (vote) => vote.vote_type === "upvote",
      ).length;
      const downvotes = suggestionVotes.filter(
        (vote) => vote.vote_type === "downvote",
      ).length;
      const userVote = suggestionVotes.find((vote) => vote.user_id === user.id);

      return {
        ...suggestion,
        upvotes: upvotes,
        downvotes: downvotes,
        net_votes: upvotes - downvotes,
        userVoteType: userVote ? userVote.vote_type : null,
      };
    },
  );

  return (
    <div className="flex flex-col items-center justify-center">
      <FeedbackClient
        // initialSuggestions={initialSuggestionItems}
        currentUser={user}
        initialSuggestions={suggestionsWithVotes} // Pass suggestions with vote data
      />
    </div>
  );
}
