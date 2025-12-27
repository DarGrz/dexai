import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import NewPageForm from './NewPageForm'
import { PRICING } from '@/lib/constants'

export default async function NewPagePage({
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

  // Check schema count
  const { data: schemas } = await supabase
    .from('schemas')
    .select('id')
    .eq('project_id', projectId)

  const pageCount = schemas?.length || 0

  if (pageCount >= PRICING.MAX_SCHEMAS_PER_PROJECT) {
    redirect(`/dashboard/projects/${projectId}`)
  }

  // Check if business profile exists
  const { data: businessProfile } = await supabase
    .from('business_profiles')
    .select('id')
    .eq('project_id', projectId)
    .single()

  if (!businessProfile) {
    redirect(`/dashboard/projects/${projectId}/business-profile`)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dodaj nową podstronę
        </h1>
        <p className="text-gray-600">
          Podstrony: {pageCount}/{PRICING.MAX_SCHEMAS_PER_PROJECT}
        </p>
      </div>

      <NewPageForm projectId={projectId} domain={project.domain} />
    </div>
  )
}
