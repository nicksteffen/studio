'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { CATEGORIES } from '@/lib/mock-data';
import type { CommunityList } from '@/lib/types';
import AddToListButton from './add-to-list-button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface BrowseClientPageProps {
    initialLists: CommunityList[];
    error?: string | null;
    loggedIn : boolean;
}

export default function BrowseClientPage({ initialLists, error, loggedIn}: BrowseClientPageProps) {

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredLists = initialLists.filter(list => {
    // Category filtering is complex as items don't have categories in this view. 
    // We will only filter by search term for now.
    // A future improvement could be to add categories to the list items query.
    // const matchesCategory = selectedCategory ? list.list_items.some(item => item.category?.toLowerCase() === selectedCategory.toLowerCase()) : true;

    const matchesSearch = searchTerm.trim() === '' ? true : 
        (list.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
         list.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         list.list_items.some(item => item.text.toLowerCase().includes(searchTerm.toLowerCase())));
         
    return matchesSearch;
  });

  const communityLists = searchTerm ? filteredLists : initialLists;

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
            <Input 
                placeholder="Search for ideas like 'visit Paris'..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {/* Category buttons are present for UI but filtering is not implemented yet */}
            <Button variant="outline" size="sm" className="rounded-full">All</Button>
            {CATEGORIES.map(category => (
                <Button key={category} variant="secondary" size="sm" className="rounded-full">{category}</Button>
            ))}
        </div>
      </div>

      {error && (
         <div className="text-center py-12 text-destructive">
            <p>Could not load community lists. {error}</p>
        </div>
      )}

      {!error && (communityLists.length === 0 && !searchTerm) ? (
        <div className="text-center py-12">
            <p className="text-muted-foreground">No public lists found yet. Be the first to make your list public!</p>
        </div>
      ) : null}

      {!error && (communityLists.length === 0 && searchTerm) ? (
        <div className="text-center py-12">
            <p className="text-muted-foreground">No lists found for "{searchTerm}".</p>
        </div>
      ) : null}


      {!error && communityLists.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {communityLists.map((list: CommunityList) => {
            const userName = list.profiles?.username ?? 'Anonymous';
            const userAvatar = list.profiles?.avatar_url ?? `https://placehold.co/100x100.png`;
            const fallbackChar = userName?.charAt(0)?.toUpperCase() || '?';
            const publicProfileUrl = `/public/${encodeURIComponent(userName)}`;

            return (
              <Card key={list.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <CardHeader>
                  <Link href={publicProfileUrl} className="flex items-center gap-4 group hover:no-underline">
                    <Avatar>
                      <AvatarImage src={userAvatar} data-ai-hint="person portrait" />
                      <AvatarFallback>{fallbackChar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="font-headline text-lg group-hover:underline">{list.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">by {userName}</p>
                    </div>
                  </Link>
                </CardHeader>
                <CardContent className="flex-grow">
                  {list.list_items && list.list_items.length > 0 ? (
                    <ul className="space-y-2 text-sm">
                      {list.list_items.slice(0, 4).map(item => (
                        <li key={item.id} className="flex items-center justify-between gap-2">
                          <span className={cn("truncate", item.completed && "line-through text-muted-foreground")}>{item.text}</span>
                          {loggedIn && <AddToListButton itemText={item.text} />}
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
      ) : null}
    </div>
  );
}
