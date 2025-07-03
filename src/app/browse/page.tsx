'use client';
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { CATEGORIES } from '@/lib/mock-data';
import type { CommunityList } from '@/lib/types';
import AddToListButton from './add-to-list-button';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { supabase as clientSupabase } from '@/lib/supabase';

export const revalidate = 60; // Revalidate every 60 seconds

export default function BrowsePage() {
  const [communityLists, setCommunityLists] = useState<CommunityList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLists = async () => {
      setLoading(true);
      const { data, error } = await clientSupabase
        .from('lists')
        .select(`
            id,
            title,
            profiles ( username, avatar_url ),
            list_items ( id, text, completed )
        `)
        .eq('is_public', true)
        .limit(9);

      if (error) {
        console.error("Error fetching community lists:", error);
        setError(error.message);
      } else {
        setCommunityLists(data as CommunityList[] || []);
      }
      setLoading(false);
    };
    fetchLists();
  }, []);


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

      {loading && (
         <div className="text-center py-12">
            <p className="text-muted-foreground">Loading community lists...</p>
        </div>
      )}

      {error && (
         <div className="text-center py-12 text-destructive">
            <p>Could not load community lists. {error}</p>
        </div>
      )}

      {!loading && !error && (communityLists.length === 0) ? (
        <div className="text-center py-12">
            <p className="text-muted-foreground">No public lists found yet. Be the first to make your list public!</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {communityLists.map((list: CommunityList) => {
            const userName = list.profiles?.username ?? 'Anonymous';
            const userAvatar = list.profiles?.avatar_url ?? `https://placehold.co/100x100.png`;
            const fallbackChar = userName?.charAt(0)?.toUpperCase() || '?';

            return (
              <Card key={list.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={userAvatar} data-ai-hint="person portrait" />
                      <AvatarFallback>{fallbackChar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="font-headline text-lg">{list.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">by {userName}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  {list.list_items && list.list_items.length > 0 ? (
                    <ul className="space-y-2 text-sm">
                      {list.list_items.slice(0, 4).map(item => (
                        <li key={item.id} className="flex items-center justify-between gap-2">
                          <span className={cn("truncate", item.completed && "line-through text-muted-foreground")}>{item.text}</span>
                          <AddToListButton itemText={item.text} />
                        </li>
                      ))}
                      {list.list_items.length > 4 && (
                          <li className="text-xs text-muted-foreground pt-1">...and {list.list_items.length - 4} more.</li>
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">This list is empty.</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
