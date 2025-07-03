import { createClient } from '@/lib/supabase/server';
import type { CommunityList } from '@/lib/types';
import BrowseClientPage from './browse-client';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function BrowsePage() {
  const supabase = createClient();

  // 1. Fetch public lists and their authors. Using a wildcard `*` to see if
  // this resolves the issue of avatar_url being null.
  const { data: lists, error: listsError } = await supabase
    .from('lists')
    .select(`
        id,
        title,
        profiles ( * )
    `)
    .eq('is_public', true)
    .limit(20);

  if (listsError) {
    console.error("Error fetching community lists:", listsError);
    // Render an error state in the client component
    return <BrowseClientPage initialLists={[]} error={listsError.message} />;
  }

  // 2. Fetch items for those lists
  const listIds = lists?.map(l => l.id) ?? [];
  let allItems: { id: string; text: string; completed: boolean; list_id: string }[] = [];

  if (listIds.length > 0) {
    const { data: itemsData, error: itemsError } = await supabase
        .from('list_items')
        .select('id, text, completed, list_id')
        .in('list_id', listIds);
    
    if (itemsError) {
        console.error("Error fetching list items:", itemsError);
        return <BrowseClientPage initialLists={[]} error={itemsError.message} />;
    }
    allItems = itemsData || [];
  }

  // 3. Combine the data into the CommunityList shape
  const communityLists: CommunityList[] = lists.map(list => ({
    ...list,
    list_items: allItems.filter(item => item.list_id === list.id)
  }));

  return <BrowseClientPage initialLists={communityLists} />;
}
