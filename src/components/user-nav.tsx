'use client';

import { useState, useEffect } from 'react';
import type { User } from '@supabase/ssr';
import { createClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { CreditCard, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function UserNav() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ username: string | null; avatar_url: string | null } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndProfile = async (user: User) => {
      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();
      setProfile(data);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserAndProfile(session.user);
      } else {
        setProfile(null);
        // We don't need to force a router refresh here, layout shift can be jarring.
        // The redirects on protected pages will handle sending unauth'd users away.
      }
    });

    // Check for user on initial load
    async function getInitialSession() {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserAndProfile(session.user);
        }
    }
    getInitialSession();

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    );
  }

  const userEmail = user.email || 'no-email@example.com';
  const userName = profile?.username || user.user_metadata?.name || userEmail.split('@')[0];
  const userAvatar = profile?.avatar_url || user.user_metadata?.avatar_url || `https://placehold.co/100x100.png`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={userAvatar} alt={`@${userName}`} data-ai-hint="person face" />
            <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
            <Link href="/billing">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
