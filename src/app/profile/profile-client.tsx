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

function AvatarSpinner() {
    const { pending } = useFormStatus();
    return pending ? <LoaderCircle className="h-8 w-8 text-white animate-spin" /> : <Camera className="h-8 w-8 text-white" />
}

interface ProfileClientProps {
    user: User;
    profile: { username: string | null, avatar_url: string | null } | null;
}

export default function ProfileClientPage({ user, profile: initialProfile }: ProfileClientProps) {
  const { toast } = useToast();
  const [state, formAction] = useActionState(updateProfile, initialState);
  const [previewUrl, setPreviewUrl] = useState(initialProfile?.avatar_url);
  
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isFirstRender = useRef(true);

  // Effect to show toast messages from server action
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

  // When server passes new props after revalidation, update the preview
  useEffect(() => {
    setPreviewUrl(initialProfile?.avatar_url);
    if(fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear file input
    }
  }, [initialProfile?.avatar_url]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string); // Optimistic UI update
      };
      reader.readAsDataURL(file);
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
                            src={previewUrl || 'https://placehold.co/100x100.png'} 
                            alt="Avatar preview" 
                            width={96} 
                            height={96} 
                            className="rounded-full w-24 h-24 object-cover border"
                            data-ai-hint="person face"
                            key={previewUrl}
                        />
                         <Label 
                            htmlFor="avatar-upload" 
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                        >
                            <AvatarSpinner/>
                        </Label>
                        <Input 
                            id="avatar-upload"
                            ref={fileInputRef} 
                            name="avatar_file"
                            type="file" 
                            accept="image/*" 
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                defaultValue={initialProfile?.username ?? ''}
                placeholder="Your public display name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input
                id="avatar_url"
                name="avatar_url"
                key={initialProfile?.avatar_url} // Re-render if URL changes from server
                defaultValue={initialProfile?.avatar_url ?? ''}
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
