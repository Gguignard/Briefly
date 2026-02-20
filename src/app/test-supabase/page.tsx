import { createAdminClient } from '@/lib/supabase/admin'

export default async function TestSupabasePage() {
  // Utilise le client admin pour bypasser le RLS lors des tests
  const supabase = createAdminClient()

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Supabase - Erreur</h1>
        <pre className="bg-red-100 p-4 rounded">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Supabase - Connexion réussie!</h1>
      <p className="mb-4">Nombre d&apos;utilisateurs: {users?.length || 0}</p>

      <div className="bg-green-100 p-4 rounded">
        <h2 className="font-bold mb-2">Utilisateurs (depuis le seed):</h2>
        <pre className="text-sm">
          {JSON.stringify(users, null, 2)}
        </pre>
      </div>
    </div>
  )
}
