'use client';

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Share2, Check, Lock } from 'lucide-react';
import { cn } from "@/lib/utils";

type Profile = {
  username: string | null;
  avatar_url: string | null;
}

type List = {
  title: string | null;
}

type Item = {
  id: string;
  text: string;
  completed: boolean;
}

interface PublicListClientPageProps {
  profile: Profile;
  list: List;
  items: Item[];
}

export default function PublicListClientPage({ profile, list, items }: PublicListClientPageProps) {
    const { toast } = useToast();

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({ title: "Link Copied!", description: "Public list URL copied to your clipboard." });
    };

    const userName = profile?.username ?? 'Anonymous';
    const userAvatar = profile?.avatar_url ?? `https://placehold.co/100x100.png`;
    const fallbackChar = userName?.charAt(0)?.toUpperCase() || '?';

    return (
        <div className="container mx-auto max-w-2xl py-12 px-4">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={userAvatar} data-ai-hint="person portrait" />
                      <AvatarFallback>{fallbackChar}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="font-headline text-3xl font-bold text-primary">{list.title}</h1>
                        <p className="text-muted-foreground">by {userName}</p>
                    </div>
                </div>
                 <Button variant="outline" onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
            </div>

             <Card className="shadow-lg">
                <CardContent className="pt-6">
                  {items && items.length > 0 ? (
                    <ul className="space-y-3 text-lg">
                      {items.map(item => (
                        <li key={item.id} className="flex items-center gap-4 p-2 rounded-md">
                           {item.completed ? <Check className="h-6 w-6 text-accent flex-shrink-0" /> : <div className="h-6 w-6 border-2 border-border rounded-full flex-shrink-0" />}
                          <span className={cn("flex-1", item.completed && "line-through text-muted-foreground")}>{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-lg text-muted-foreground italic text-center py-8">This list is empty.</p>
                  )}
                </CardContent>
              </Card>
        </div>
    );
}
