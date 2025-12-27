import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ToggleSchemaButton } from './schemas/components/ToggleSchemaButton'
import { DeleteSchemaButton } from './schemas/components/DeleteSchemaButton'
import { Plus, ArrowLeft } from 'lucide-react'
import { getSchemaLabel } from '@/lib/schema-labels'

export default async function PageSchemasManagementPage({
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

  // Fetch schemas for this page
  const { data: schemas } = await supabase
    .from('schemas')
    .select('*')
    .eq('page_id', pageId)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Powrót do projektu
        </Link>
        <div className="flex justify-between items-start mt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {page.name}
            </h1>
            <p className="text-gray-600">
              {project.domain}{page.url_path}
            </p>
          </div>
        </div>
      </div>

      {/* Schemas Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Informacje o stronie
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Zarządzaj informacjami wyświetlanymi w Google dla tej podstrony
            </p>
          </div>
        </div>

        {!schemas || schemas.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-gray-400 text-5xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Brak informacji
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Dodaj pierwsze informacje o tej podstronie
            </p>
            <Link
              href={`/dashboard/projects/${projectId}/pages/${pageId}/schemas/new`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-md hover:from-emerald-700 hover:to-teal-700 text-sm font-medium shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Dodaj informacje
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {schemas.map((schema) => (
                <div
                  key={schema.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${schema.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {getSchemaLabel(schema.type)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${schema.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                          {schema.enabled ? 'Aktywny' : 'Wyłączony'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Utworzono: {new Date(schema.created_at).toLocaleDateString('pl-PL')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ToggleSchemaButton 
                      schemaId={schema.id}
                      enabled={schema.enabled}
                    />
                    <Link
                      href={`/dashboard/projects/${projectId}/pages/${pageId}/schemas/${schema.id}/edit`}
                      className="px-3 py-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Edytuj
                    </Link>
                    <DeleteSchemaButton 
                      schemaId={schema.id}
                      schemaType={schema.type}
                      projectId={projectId}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Link
              href={`/dashboard/projects/${projectId}/pages/${pageId}/schemas/new`}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all font-medium"
            >
              <Plus className="w-5 h-5" />
              Dodaj kolejne informacje
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
