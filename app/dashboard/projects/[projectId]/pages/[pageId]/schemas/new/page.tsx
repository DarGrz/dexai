import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import NewSchemaForm from './NewSchemaForm'
import { ArrowLeft } from 'lucide-react'

export default async function NewSchemaPage({
  params,
}: {
  params: Promise<{ projectId: string; pageId: string }>
}) {
  const { projectId, pageId } = await params
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

  // Fetch page
  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('id', pageId)
    .eq('project_id', projectId)
    .single()

  if (!page) {
    notFound()
  }

  // Check if business profile exists
  const { data: businessProfile } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('project_id', projectId)
    .single()

  if (!businessProfile) {
    redirect(`/dashboard/projects/${projectId}/business-profile`)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          href={`/dashboard/projects/${projectId}/pages/${pageId}`}
          className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Powrót do zarządzania podstroną
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">
          Dodaj informacje
        </h1>
        <p className="text-gray-600">
          {page.name} • {project.domain}{page.url_path}
        </p>
      </div>

      <NewSchemaForm 
        projectId={projectId} 
        pageId={pageId}
        businessProfile={businessProfile}
      />
    </div>
  )
}
