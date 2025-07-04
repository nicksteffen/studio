import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import PublicListClientPage from './public-list-client';

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const supabase = createClient();
  const username = decodeURIComponent(params.username);

  const { data: userProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .eq('username', username)
    .single();

  if (profileError || !userProfile) {
    notFound();
  }

  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('id, title, is_public')
    .eq('user_id', userProfile.id)
    .single();

  if (listError || !list) {
    notFound();
  }

  if (!list.is_public) {
    return (
        <div className="container mx-auto text-center py-20">
            <h1 className="text-2xl font-bold">This list is private.</h1>
            <p className="text-muted-foreground">The owner of this list has not made it public.</p>
        </div>
    );
  }

  const { data: items, error: itemsError } = await supabase
    .from('list_items')
    .select('id, text, completed')
    .eq('list_id', list.id)
    .order('position', { ascending: true });

  if (itemsError) {
    // Or handle this more gracefully
    notFound();
  }

  return <PublicListClientPage profile={userProfile} list={list} items={items || []} />;
}
