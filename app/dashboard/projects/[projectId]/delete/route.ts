import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Delete schemas first (foreign key constraint)
  await supabase
    .from('schemas')
    .delete()
    .eq('project_id', projectId)

  // Delete schema edits
  await supabase
    .from('schema_edits')
    .delete()
    .eq('project_id', projectId)

  // Delete project
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
