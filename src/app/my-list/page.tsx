import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MyListClient from './my-list-client';
import type { ImageOptions, ListItem } from '@/lib/types';
import { getImageOptionsForList } from './imageConfigActions';

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

  // Fetch profile to get username for sharing
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, is_premium')
    .eq('id', user.id)
    .single();

  const isPremium = profile?.is_premium || false;
  
//   const { data, error } = await supabase
//       .from('user_image_options')
//       .select(
//         `
//           text_color,
//           background_color,
//           font,
//           title_color,
//           item_number_color,
//           completed_item_text_color,
//           completed_item_icon_color
//         `
//       )
//       .eq('list_id', listId)
//       .single(); // Use .single() if you expect at most one row for a given list_id
    
//     // if (!data || error) {
        
//     // }

//     const userOptions: ImageOptions = {
//       textColor: data?.text_color || '#1f2937',
//       backgroundColor: data?.background_color || '#fefae0',
//       font: data?.font || 'font-handwriting', // Ensure 'font' matches FontClasses type if strict
//       titleColor: data?.title_color || '#d4a373',
//       itemNumberColor: data?.item_number_color || '#9ca3af',
//       completedItemTextColor: data?.completed_item_text_color || '#6b7280',
//       completedItemIconColor: data?.completed_item_icon_color || '#16a34a',
//     };
    const userOptions  = await getImageOptionsForList(listId);

    console.log('current user options')
    console.log(userOptions)


//   console.log("user options")
//   console.log(userOptions)

//   const imageOptions = userOptions || defaultOptions;
//   console.log("image options")
//   console.log(imageOptions)


  return <MyListClient 
    initialListId={listId} 
    initialListTitle={listTitle || "My 30 Before 30 List"} 
    initialItems={items} 
    initialUsername={profile?.username || null}
    userConfigOptions={userOptions}
    isPremium={isPremium}
    />;
}
