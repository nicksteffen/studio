import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SuggestionsClientPage from './suggestions-client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Star } from 'lucide-react';

export default async function SuggestionsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?message=Please log in to access AI Suggestions.');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('id', user.id)
    .single();

  const isPremium = profile?.is_premium ?? false;

  if (isPremium) {
    return <SuggestionsClientPage />;
  }

  // If not premium, show an upgrade prompt.
  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <Card className="shadow-2xl border-accent">
        <CardHeader className="text-center">
            <div className="mx-auto bg-accent/20 text-accent p-3 rounded-full w-fit mb-4">
                <Star className="h-8 w-8" />
            </div>
            <CardTitle className="font-headline text-4xl text-primary">Upgrade to Premium</CardTitle>
            <CardDescription className="text-lg text-foreground/80 pt-2">
                The AI Suggestion tool is a premium feature.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-center text-foreground/90">
                Unlock unlimited AI-powered suggestions, advanced list features, and an ad-free experience by upgrading your account.
            </p>
        </CardContent>
        <CardFooter className="flex-col gap-4">
             <Button size="lg" className="w-full" asChild>
                <Link href="/billing">
                    View Premium Options
                </Link>
            </Button>
            <p className="text-xs text-muted-foreground">
                Get inspired like never before.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
