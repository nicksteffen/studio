import FeedbackClient from './feedback-client';
import { createClient } from '@/lib/supabase/server';
import { fetchSuggestions } from './actions';

export default async function FeedbackPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const initialSuggestions = await fetchSuggestions();

   // Fetch user's votes for optimistic updates
  let initialUserVotes: { suggestion_id: string; vote_type: 'upvote' | 'downvote' }[] = [];
  if (user) {
      const { data, error } = await supabase
          .from('suggestion_votes')
          .select('suggestion_id, vote_type')
          .eq('user_id', user.id);

      if (error) {
          console.error("Error fetching user votes:", error);
      } else {
          initialUserVotes = data || [];
      }
  }


  return (
    <div className="flex flex-col items-center justify-center">
      <FeedbackClient
          initialSuggestions={initialSuggestions}
          currentUser={user}
          initialUserVotes={initialUserVotes} // Pass initial user votes
       />
    </div>
  );
}
