'use client';

import { useEffect, useState, useActionState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { LoaderCircle, Save, ShieldCheck, Bell, Trash2, AlertTriangle } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { updateSettings } from './actions';
import { useFormStatus } from 'react-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const initialState = {
  message: '',
  error: false,
  success: false,
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Preferences
        </Button>
    )
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<{ is_public: boolean }>({ is_public: false });
  const [state, formAction] = useActionState(updateSettings, initialState);
  
  const formRef = useRef<HTMLFormElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const fetchUserSettings = async (userId: string) => {
      const { data, error } = await supabase
        .from('lists')
        .select('is_public')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching settings:", error);
        toast({ title: 'Error', description: 'Could not fetch your settings.', variant: 'destructive' });
      }
      if (data) {
        setSettings({ is_public: data.is_public || false });
      }
      setLoading(false);
    };

    const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUser(user);
            fetchUserSettings(user.id);
        } else {
            setLoading(false);
        }
    }
    getUser();
  }, [toast]);
  
  useEffect(() => {
    if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
    }
    if (state.message) {
      toast({
        title: state.error ? "Error" : "Success!",
        description: state.message,
        variant: state.error ? "destructive" : "default",
      });
    }
  }, [state, toast]);

  if (loading) {
    return (
        <div className="container mx-auto max-w-2xl py-12 px-4">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                    <div>
                        <Skeleton className="h-6 w-32 mb-4" />
                        <div className="flex items-center space-x-4 p-4 border rounded-lg">
                            <Skeleton className="h-6 w-6" />
                            <div className="space-y-1 flex-1">
                                <Skeleton className="h-5 w-1/4" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                            <Skeleton className="h-6 w-11" />
                        </div>
                    </div>
                     <div>
                        <Skeleton className="h-6 w-32 mb-4" />
                        <div className="flex items-center space-x-4 p-4 border rounded-lg">
                            <Skeleton className="h-6 w-6" />
                            <div className="space-y-1 flex-1">
                                <Skeleton className="h-5 w-1/4" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                            <Skeleton className="h-6 w-11" />
                        </div>
                    </div>
                    <div>
                        <Skeleton className="h-6 w-32 mb-4" />
                        <Skeleton className="h-10 w-48" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
  }

  if (!user) {
    return <div className="container mx-auto text-center py-12">Please log in to view your settings.</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <form ref={formRef} action={formAction}>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Settings</CardTitle>
            <CardDescription>Manage your account and list preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">

            {/* Privacy Settings */}
            <div className="space-y-4">
              <h3 className="text-xl font-headline text-primary flex items-center"><ShieldCheck className="mr-3" /> Privacy</h3>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="is-public" className="text-base">Public List</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow other users to see your list on the community browse page.
                  </p>
                </div>
                <Switch
                  id="is-public"
                  name="is_public"
                  defaultChecked={settings.is_public}
                />
              </div>
            </div>

            {/* Notification Settings */}
            <div className="space-y-4">
              <h3 className="text-xl font-headline text-primary flex items-center"><Bell className="mr-3" /> Notifications</h3>
               <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-summary" className="text-base">Weekly Summary</Label>
                  <p className="text-sm text-muted-foreground">
                    Get a weekly email with your progress and suggestions.
                  </p>
                </div>
                <Switch id="weekly-summary" name="weekly_summary" disabled />
              </div>
               <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="community-updates" className="text-base">Community Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Be notified about new features and community highlights.
                  </p>
                </div>
                <Switch id="community-updates" name="community_updates" disabled />
              </div>
            </div>
            
            {/* Account Deletion */}
            <div className="space-y-4">
               <h3 className="text-xl font-headline text-destructive flex items-center"><AlertTriangle className="mr-3" /> Danger Zone</h3>
                <Card className="border-destructive bg-destructive/5">
                    <CardHeader>
                        <CardTitle className="text-lg text-destructive">Delete Account</CardTitle>
                        <CardDescription className="text-destructive/80">
                            Permanently delete your account and all of your data, including your lists. This action is irreversible.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete My Account</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90">Yes, delete my account</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                </Card>
            </div>

          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
