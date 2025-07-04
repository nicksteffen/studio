'use client';

import { useEffect, useState } from 'react';
import type { ListItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Check, Circle, ListPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import AddToListButton from '@/app/browse/add-to-list-button';
import { ShareButton } from '@/components/share-button';

interface PublicListClientProps {
    listTitle: string;
    items: ListItem[];
    author: {
        username: string | null;
        avatar_url: string | null;
    } | null;
    isOwner?: boolean;
    isLoggedIn?: boolean;
}

export default function PublicListClient({ listTitle, items, author, isOwner, isLoggedIn }: PublicListClientProps) {
    const [shareUrl, setShareUrl] = useState('');
    
    useEffect(() => {
        if(typeof window !== 'undefined'){
            setShareUrl(window.location.href);
        }
    }, [])

    const userName = author?.username ?? 'Anonymous';
    const userAvatar = author?.avatar_url ?? `https://placehold.co/100x100.png`;
    const fallbackChar = userName?.charAt(0)?.toUpperCase() || '?';

    return (
        <div className="container mx-auto max-w-2xl py-12 px-4">
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={userAvatar} data-ai-hint="person face" />
                            <AvatarFallback>{fallbackChar}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="font-headline text-2xl">{listTitle}</CardTitle>
                            <p className="text-md text-muted-foreground">A public list by {userName}</p>
                        </div>
                    </div>
                    <ShareButton url={shareUrl} title={`Check out ${userName}'s list!`} />
                </CardHeader>
                <CardContent>
                    {items.length > 0 ? (
                        <ul className="space-y-3">
                            {items.map((item, index) => (
                                <li key={item.id} className="flex items-center justify-between gap-2 p-3 rounded-lg bg-secondary/50">
                                    <div className="flex items-center gap-4">
                                        {item.completed ? (
                                            <Check className="h-6 w-6 text-accent flex-shrink-0" />
                                        ) : (
                                            <Circle className="h-6 w-6 text-border flex-shrink-0" />
                                        )}
                                        <span className={cn(item.completed && "line-through text-muted-foreground")}>
                                            {item.text}
                                        </span>
                                    </div>
                                    {isLoggedIn && !isOwner && <AddToListButton itemText={item.text} />}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-muted-foreground italic py-8">This user hasn't added any items to their list yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
