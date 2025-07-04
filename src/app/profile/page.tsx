import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProfileClientPage from './profile-client';

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', user.id)
    .single();

  return <ProfileClientPage user={user} profile={profile} />;
}
