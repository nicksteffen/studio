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

  const { data: publicLists, error } = await supabase
    .from('lists')
    .select('id, title')
    .eq('is_public', true);

  if (error) {
    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-2xl font-bold mb-4">Error Fetching Lists</h1>
            <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4">Public Lists Test Page</h1>
      {publicLists && publicLists.length > 0 ? (
        <ul>
          {publicLists.map(list => (
            <li key={list.id} className="font-mono text-sm">
              <strong>ID:</strong> {list.id}, <strong>Title:</strong> {list.title}
            </li>
          ))}
        </ul>
      ) : (
        <p>No public lists found.</p>
      )}
    </div>
  );
}
