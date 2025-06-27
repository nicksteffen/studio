import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle, Search } from 'lucide-react';
import type { CommunityList } from '@/lib/types';
import { CATEGORIES } from '@/lib/mock-data';
import AddToListButton from './add-to-list-button';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function BrowsePage() {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  );

  // --- START OF CHANGES ---

  // 1. Fetch public lists and their associated profiles
  const { data: lists, error: listsError } = await supabase
    .from('lists')
    .select(`
        id,
        title,
        profiles ( username, avatar_url )
    `)
    .eq('is_public', true)
    .limit(9);

  if (listsError) {
    console.error("Error fetching community lists:", listsError);
    // In a real app, you'd want to show an error component here
  }
  
  const communityListsData = lists || [];
  let communityLists: CommunityList[] = [];

  if (communityListsData.length > 0) {
    // 2. Fetch all items for the lists we found
    const listIds = communityListsData.map(list => list.id);
    const { data: listItems, error: itemsError } = await supabase
      .from('list_items')
      .select('id, text, completed, list_id')
      .in('list_id', listIds)
      .order('position', { ascending: true });

    if (itemsError) {
      console.error("Error fetching list items:", itemsError);
    }

    // 3. Combine the lists and their items
    const itemsByListId = (listItems || []).reduce((acc, item) => {
      if (!acc[item.list_id]) {
        acc[item.list_id] = [];
      }
      acc[item.list_id].push(item);
      return acc;
    }, {} as Record<string, { id: string; text: string; completed: boolean; }[]>);
    
    communityLists = communityListsData.map(list => ({
      ...list,
      list_items: itemsByListId[list.id] || []
    }));
  }
  // --- END OF CHANGES ---


  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">
          Explore The Community
        </h1>
        <p className="mt-2 text-lg text-foreground/80 max-w-2xl mx-auto">
          Get inspired by what others are dreaming of. Add ideas from their lists to your own with a single click.
        </p>
      </div>

      <div className="mb-8 max-w-xl mx-auto">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search for ideas like 'visit Paris'..." className="pl-10" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map(category => (
                <Button key={category} variant="secondary" size="sm" className="rounded-full">{category}</Button>
            ))}
        </div>
      </div>

      {communityLists.length === 0 ? (
        <div className="text-center py-12">
            <p className="text-muted-foreground">No public lists found yet. Be the first to make your list public!</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {communityLists.map(list => (
            <Card key={list.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={list.profiles?.avatar_url ?? undefined} data-ai-hint="person portrait" />
                    <AvatarFallback>{list.profiles?.username?.charAt(0) ?? '?'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="font-headline text-lg">{list.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">by {list.profiles?.username ?? 'Anonymous'}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {list.list_items.map(item => (
                    <li key={item.id} className="flex items-center justify-between gap-2 text-sm">
                      <div className="flex items-center gap-2">
                          <CheckCircle className={`h-4 w-4 ${item.completed ? 'text-accent' : 'text-border'}`} />
                          <span className={item.completed ? 'line-through text-muted-foreground' : ''}>{item.text}</span>
                      </div>
                      <AddToListButton itemText={item.text} />
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
