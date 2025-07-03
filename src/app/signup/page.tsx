'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
    } else {
      // On successful signup, Supabase SSR creates a session.
      // Redirect to the profile page to encourage completion and refresh the session.
      router.push('/profile');
      router.refresh();
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl text-primary">Create Account</CardTitle>
          <CardDescription>Start your journey today.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?
            <Button variant="link" asChild className="pl-1">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
