import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

  const { data: publicLists, error: listsError } = await supabase
    .from('lists')
    .select('id, title')
    .eq('is_public', true);

  if (listsError) {
    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-2xl font-bold mb-4">Error Fetching Lists</h1>
            <pre>{JSON.stringify(listsError, null, 2)}</pre>
        </div>
    )
  }
  
  if (!publicLists || publicLists.length === 0) {
     return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-2xl font-bold mb-4">Public Lists Test Page</h1>
            <p>No public lists found.</p>
        </div>
     );
  }

  const listIds = publicLists.map(list => list.id);

  const { data: listItems, error: itemsError } = await supabase
    .from('list_items')
    .select('id, text, list_id')
    .in('list_id', listIds);
  
  if (itemsError) {
    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-2xl font-bold mb-4">Error Fetching List Items</h1>
            <pre>{JSON.stringify(itemsError, null, 2)}</pre>
        </div>
    )
  }


  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4">Public Lists Test Page</h1>
      {publicLists.map(list => (
        <div key={list.id} className="mb-6 p-4 border rounded-lg">
            <h2 className="text-xl font-bold">List: {list.title ?? 'Untitled'} (ID: {list.id})</h2>
            <ul className="mt-2 list-disc list-inside">
            {listItems && listItems.length > 0 ? (
                 listItems
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
