import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MyListClient from './my-list-client';
import type { ListItem } from '@/lib/types';

export default async function MyListPage() {
  const supabase = await createClient();

  const { data:  { user }  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch list and items
  let { data: listData, error: listError } = await supabase
    .from('lists')
    .select('id, title')
    .eq('user_id', user.id)
    .single();
  
  let listId = listData?.id;
  let listTitle = listData?.title;
  let items: ListItem[] = [];

  if (listError && listError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching list:', listError);
      // In a real app, you might want to show an error page
  }

  // If the user has no list yet, create one. This is a good place for it.
  if (!listData) {
      const defaultTitle = "My 30 Before 30 List";
      const { data: newListData, error: newListError } = await supabase
          .from('lists')
          .insert({ user_id: user.id, title: defaultTitle })
          .select('id, title')
          .single();

      if (newListError) {
          console.error('Error creating list:', newListError);
          // Handle error display
      } else if (newListData) {
          listId = newListData.id;
          listTitle = newListData.title;
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

  return <MyListClient user={user} initialListId={listId} initialListTitle={listTitle || "My 30 Before 30 List"} initialItems={items} />;
}
