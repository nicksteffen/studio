import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Circle, Lock } from 'lucide-react';
import AddToListButton from '@/app/browse/add-to-list-button';
import { cn } from '@/lib/utils';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function PublicListPage({ params }: { params: { username: string } }) {
  const supabase = createClient();
  const { data: { user: loggedInUser } } = await supabase.auth.getUser();
  const username = decodeURIComponent(params.username);

  // 1. Fetch profile by username
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .eq('username', username)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  // 2. Fetch list for that user
  const { data: list } = await supabase
    .from('lists')
    .select('id, title, is_public')
    .eq('user_id', profile.id)
    .single();
  
  // If list is private or doesn't exist, show a private page view
  if (!list || !list.is_public) {
    return (
      <div className="container mx-auto max-w-2xl py-20 px-4 text-center">
        <div className="flex justify-center mb-6">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={profile.avatar_url || 'https://placehold.co/100x100.png'} alt={profile.username || 'user'} data-ai-hint="person face" />
                <AvatarFallback>{profile.username?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
            </Avatar>
        </div>
        <h1 className="font-headline text-3xl font-bold">{profile.username}'s List</h1>
        <Card className="mt-8 text-center">
            <CardContent className="p-10">
                <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold">This List is Private</h2>
                <p className="text-muted-foreground">The user has chosen not to share this list publicly.</p>
            </CardContent>
        </Card>
      </div>
    );
  }

  // 3. Fetch list items
  const { data: items } = await supabase
    .from('list_items')
    .select('*')
    .eq('list_id', list.id)
    .order('position', { ascending: true });

  const completedCount = items ? items.filter(item => item.completed).length : 0;
  const totalItems = items ? items.length : 0;

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
        <div className="flex flex-col items-center text-center mb-8">
            <Avatar className="h-24 w-24 mb-4 border-4 border-white shadow-lg">
                <AvatarImage src={profile.avatar_url || `https://placehold.co/100x100.png`} alt={profile.username || 'user'} data-ai-hint="person face" />
                <AvatarFallback>{profile.username?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
            </Avatar>
            <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">
                {list.title || `${profile.username}'s List`}
            </h1>
            <p className="mt-2 text-lg text-foreground/80">
                Inspired by {profile.username}? Add their goals to your own list!
            </p>
        </div>

        <Card className="shadow-xl">
             <CardHeader>
                <CardTitle className="flex justify-between items-center text-base font-semibold">
                    <span>Progress</span>
                    <span>{completedCount} / {totalItems} completed</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                {items && items.length > 0 ? (
                    <ul className="space-y-1">
                      {items.map((item) => (
                        <li key={item.id} className="flex items-center justify-between gap-2 p-2 rounded-lg transition-colors hover:bg-secondary/50">
                            <div className="flex items-center flex-1 mr-4">
                                {item.completed ? <Check className="h-5 w-5 mr-3 text-accent flex-shrink-0" /> : <Circle className="h-5 w-5 mr-3 text-border flex-shrink-0" />}
                                <span className={cn("flex-1", item.completed && "line-through text-muted-foreground")}>{item.text}</span>
                            </div>
                            {loggedInUser && <AddToListButton itemText={item.text} />}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground italic text-center p-8">This list doesn't have any items yet.</p>
                  )}
            </CardContent>
        </Card>
    </div>
  );
}
