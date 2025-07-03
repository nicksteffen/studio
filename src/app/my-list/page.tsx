import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MyListClient from './my-list-client';
import type { ListItem } from '@/lib/types';

export default async function MyListPage() {
    console.log("list page")
  const supabase = await createClient();

  const { data:  { user }  } = await supabase.auth.getUser();
  console.log(user)

  if (!user) {
    console.log("couldnt find user")
    redirect('/login');
  }

  // Fetch list and items
  let { data: listData, error: listError } = await supabase
    .from('lists')
    .select('id')
    .eq('user_id', user.id)
    .single();
  
  let listId = listData?.id;
  let items: ListItem[] = [];

  if (listError && listError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching list:', listError);
      // In a real app, you might want to show an error page
  }

  // If the user has no list yet, create one. This is a good place for it.
  if (!listData) {
      const { data: newListData, error: newListError } = await supabase
          .from('lists')
          .insert({ user_id: user.id, title: `${user.email?.split('@')[0] || 'My'}'s 30 Before 30 List` })
          .select('id')
          .single();

      if (newListError) {
          console.error('Error creating list:', newListError);
          // Handle error display
      } else {
          listId = newListData.id;
      }
  }
  
  if (listId) {
      const { data: itemsData, error: itemsError } = await supabase
          .from('list_items')
          .select('*')
          .eq('list_id', listId)
          .order('position', { ascending: true });

      if (itemsError) {
          console.error('Error fetching items:', itemsError);
          // Handle error
      } else {
          items = itemsData || [];
      }
  }

  return <MyListClient user={user} initialListId={listId} initialItems={items} />;
}
