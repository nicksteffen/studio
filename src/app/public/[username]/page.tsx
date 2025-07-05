import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { ListItem } from '@/lib/types';
import PublicListClientPage from './public-list-client';
import { profile } from 'console';

export default async function PublicProfilePage({ params }: { params: { username: string } }) {

  const supabase = await createClient();
  let { username }= await params
  username = decodeURIComponent(username);

  const {data: { user } }= await supabase.auth.getUser();
  const isLoggedIn = !!user; 

    
  console.log('looking for match by username ')
  console.log(username);
  const { data: userProfile, error: profileError } = await supabase
    // .from('profiles')
    .from('public_profiles')
    .select('user_id, username, avatar_url')
    .eq('username', username)
    .single();

  // console.log(`check: ${userProfile.id} vs ${user.id}`)
  const isOwner = userProfile?.user_id === user?.id;

  if (profileError || !userProfile) {
    console.log(profileError);
    console.log("profile or user pro erro")
    notFound();
  }



  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('id, title, is_public')
    .eq('user_id', userProfile.user_id)
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

  const listItems : ListItem[] = items;

  return <PublicListClientPage author={userProfile} listTitle={list.title} items={listItems || []}  isLoggedIn={isLoggedIn} isOwner={isOwner} />;
}
