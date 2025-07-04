'use client';

import { useEffect, useState, useActionState, useRef } from 'react';
import type { User } from '@supabase/ssr';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderCircle, Save, Camera } from 'lucide-react';
import { updateProfile } from './actions';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

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
            Save Changes
        </Button>
    )
}

interface ProfileClientProps {
    user: User;
    profile: { username: string | null, avatar_url: string | null } | null;
}

export default function ProfileClientPage({ user, profile: initialProfile }: ProfileClientProps) {
  const supabase = createClient();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [profile, setProfile] = useState(initialProfile ?? { username: '', avatar_url: '' });
  const [state, formAction] = useActionState(updateProfile, initialState);
  
  const formRef = useRef<HTMLFormElement>(null);
  const isFirstRender = useRef(true);

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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to upload an avatar.', variant: 'destructive' });
      return;
    }
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploading(true);
    toast({ title: 'Uploading...', description: 'Your new avatar is being uploaded.' });

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Math.random()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('profile-avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('profile-avatars').getPublicUrl(filePath);
      const newAvatarUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, avatar_url: newAvatarUrl, updated_at: new Date().toISOString() });
      
      if (updateError) {
        throw updateError;
      }
      
      setProfile(prev => ({ ...prev, avatar_url: newAvatarUrl }));
      
      if (formRef.current) {
        const urlInput = formRef.current.elements.namedItem('avatar_url') as HTMLInputElement;
        if (urlInput) {
          urlInput.value = newAvatarUrl;
        }
      }
      
      toast({ title: 'Success!', description: 'Your avatar has been updated.' });

    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({ title: 'Upload Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Your Profile</CardTitle>
          <CardDescription>Update your username and avatar. This is how other users will see you.</CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-6">
             <div className="space-y-2">
                <Label>Avatar</Label>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Image 
                            src={profile?.avatar_url || 'https://placehold.co/100x100.png'} 
                            alt="Avatar preview" 
                            width={96} 
                            height={96} 
                            className="rounded-full w-24 h-24 object-cover border"
                            data-ai-hint="person face"
                        />
                         <Label 
                            htmlFor="avatar-upload" 
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                        >
                            {isUploading ? (
                                <LoaderCircle className="h-8 w-8 text-white animate-spin" />
                            ) : (
                                <Camera className="h-8 w-8 text-white" />
                            )}
                        </Label>
                        <Input 
                            id="avatar-upload" 
                            type="file" 
                            accept="image/*" 
                            className="hidden"
                            onChange={handleAvatarUpload}
                            disabled={isUploading}
                        />
                    </div>
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                defaultValue={profile?.username ?? ''}
                placeholder="Your public display name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input
                id="avatar_url"
                name="avatar_url"
                key={profile?.avatar_url} 
                defaultValue={profile?.avatar_url ?? ''}
                placeholder="Or paste an image URL"
              />
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
