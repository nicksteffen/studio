import { sampleCommunityLists, CATEGORIES } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle, ListPlus, Search } from 'lucide-react';

export default function BrowsePage() {
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

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {sampleCommunityLists.map(list => (
          <Card key={list.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={list.userAvatar} data-ai-hint="person portrait" />
                  <AvatarFallback>{list.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="font-headline text-lg">{list.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">by {list.userName}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {list.items.map(item => (
                  <li key={item.id} className="flex items-center justify-between gap-2 text-sm">
                    <div className="flex items-center gap-2">
                        <CheckCircle className={`h-4 w-4 ${item.completed ? 'text-accent' : 'text-border'}`} />
                        <span className={item.completed ? 'line-through text-muted-foreground' : ''}>{item.text}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <ListPlus className="h-4 w-4" />
                      <span className="sr-only">Add to my list</span>
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
