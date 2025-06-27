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

  // --- Start of new single-query logic ---
  const { data: communityLists, error } = await supabase
    .from('lists')
    .select(`
        id,
        title,
        profiles ( username ),
        list_items ( id, text )
    `)
    .eq('is_public', true);
  // --- End of new single-query logic ---
  
  if (error) {
    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-2xl font-bold mb-4">Error Fetching Data with Complex Query</h1>
            <pre className="bg-muted p-4 rounded-md">{JSON.stringify(error, null, 2)}</pre>
        </div>
    )
  }
  
  if (!communityLists || communityLists.length === 0) {
     return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-2xl font-bold mb-4">Public Lists Test Page (Complex Query)</h1>
            <p>No public lists found.</p>
        </div>
     );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4">Public Lists Test Page (Complex Query)</h1>
      {communityLists.map(list => (
        <div key={list.id} className="mb-6 p-4 border rounded-lg">
            <h2 className="text-xl font-bold">List: {list.title ?? 'Untitled'} (ID: {list.id})</h2>
            <p className="text-sm text-muted-foreground">by {list.profiles?.username ?? 'Anonymous'}</p>
            <ul className="mt-2 list-disc list-inside">
            {(list.list_items && Array.isArray(list.list_items) && list.list_items.length > 0) ? (
                 list.list_items
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
