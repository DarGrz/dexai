import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import BusinessProfileForm from './BusinessProfileForm'

export default async function BusinessProfilePage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch project
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .single()

  if (!project) {
    notFound()
  }

  // Check if business profile already exists
  const { data: existingProfile } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('project_id', projectId)
    .single()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {existingProfile ? 'Edytuj profil firmy' : 'Utwórz profil firmy'}
        </h1>
        <p className="text-gray-600">
          Wprowadź podstawowe dane swojej firmy. Będą one automatycznie wykorzystywane przy tworzeniu informacji dla różnych podstron.
        </p>
      </div>

      <BusinessProfileForm 
        projectId={projectId} 
        existingProfile={existingProfile}
      />
    </div>
  )
}
