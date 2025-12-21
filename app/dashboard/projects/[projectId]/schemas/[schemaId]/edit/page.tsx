import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { EditSchemaForm } from './EditSchemaForm'

export default async function EditSchemaPage({
  params,
}: {
  params: Promise<{ projectId: string; schemaId: string }>
}) {
  const { projectId, schemaId } = await params
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

  // Fetch schema
  const { data: schema } = await supabase
    .from('schemas')
    .select('*')
    .eq('id', schemaId)
    .eq('project_id', projectId)
    .single()

  if (!schema) {
    notFound()
  }

  // Check edit limit
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const { data: edits } = await supabase
    .from('schema_edits')
    .select('*')
    .eq('project_id', projectId)
    .gte('created_at', firstDayOfMonth.toISOString())

  const editCount = edits?.length || 0
  const remainingEdits = Math.max(0, 5 - editCount)

  return (
    <div className="max-w-4xl mx-auto">
      <EditSchemaForm 
        schema={schema}
        projectId={projectId}
        remainingEdits={remainingEdits}
      />
    </div>
  )
}
