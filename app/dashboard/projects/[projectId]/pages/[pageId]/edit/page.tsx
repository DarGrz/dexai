import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EditPageForm from './EditPageForm'

export default async function EditPagePage({
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

  // Fetch page/schema
  const { data: page } = await supabase
    .from('schemas')
    .select('*')
    .eq('id', pageId)
    .eq('project_id', projectId)
    .single()

  if (!page) {
    notFound()
  }

  // Fetch business profile for auto-fill
  const { data: businessProfile } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('project_id', projectId)
    .single()

  return (
    <div className="max-w-4xl mx-auto">
      <EditPageForm 
        projectId={projectId}
        domain={project.domain}
        page={page}
        businessProfile={businessProfile}
      />
    </div>
  )
}
