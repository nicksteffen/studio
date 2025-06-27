import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { CommunityList } from '@/lib/types'

export const revalidate = 0; // Don't cache this page

export default async function TestPage() {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  );

  // --- Start of two-query logic ---

  // 1. Fetch public lists and their authors
  const { data: lists, error: listsError } = await supabase
    .from('lists')
    .select(`
        id,
        title,
        profiles ( username, avatar_url )
    `)
    .eq('is_public', true);

  if (listsError) {
    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-2xl font-bold mb-4">Error Fetching Lists</h1>
            <pre className="bg-muted p-4 rounded-md">{JSON.stringify(listsError, null, 2)}</pre>
        </div>
    )
  }

  const listIds = lists?.map(l => l.id) ?? [];
  let allItems: { id: string; text: string; list_id: string }[] = [];

  // 2. Fetch items for those lists if any lists were found
  if (listIds.length > 0) {
    const { data: itemsData, error: itemsError } = await supabase
        .from('list_items')
        .select('id, text, list_id')
        .in('list_id', listIds);
    
    if (itemsError) {
        return (
            <div className="container mx-auto py-12 px-4">
                <h1 className="text-2xl font-bold mb-4">Error Fetching List Items</h1>
                <pre className="bg-muted p-4 rounded-md">{JSON.stringify(itemsError, null, 2)}</pre>
            </div>
        )
    }
    allItems = itemsData || [];
  }
  
  if (!lists || lists.length === 0) {
     return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-2xl font-bold mb-4">Public Lists Test Page (Two Queries)</h1>
            <p>No public lists found.</p>
        </div>
     );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4">Public Lists Test Page (Two Queries)</h1>
      {lists.map(list => (
        <div key={list.id} className="mb-6 p-4 border rounded-lg">
            <h2 className="text-xl font-bold">List: {list.title ?? 'Untitled'} (ID: {list.id})</h2>
            <p className="text-sm text-muted-foreground">by {list.profiles?.username ?? 'Anonymous'}</p>
            <ul className="mt-2 list-disc list-inside">
            {(allItems && allItems.length > 0) ? (
                 allItems
                    .filter(item => item.list_id === list.id)
                    .map(item => (
                        <li key={item.id} className="font-mono text-sm ml-4">
                            {item.text}
                        </li>
                    ))
            ) : (
                <li className="font-mono text-sm ml-4 text-muted-foreground">No items in this list.</li>
            )}
            </ul>
        </div>
      ))}
    </div>
  );
}
