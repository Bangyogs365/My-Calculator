import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)

  return (
    <main>
      <h1>My Calculator</h1>
      <p>Supabase connection test</p>
      <pre>
        {JSON.stringify({ data, error }, null, 2)}
      </pre>
    </main>
  )
}
