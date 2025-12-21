import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ToggleSchemaButton } from './components/ToggleSchemaButton'
import { DeleteSchemaButton } from './components/DeleteSchemaButton'
import { Eye, EyeOff, Edit, Plus } from 'lucide-react'

export default async function SchemasManagementPage({
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

  // Fetch schemas
  const { data: schemas } = await supabase
    .from('schemas')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  // Get edit count for current month
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
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
        >
          ← Powrót do projektu
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Zarządzanie schematami
            </h1>
            <p className="text-gray-600">{project.domain}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Pozostało edycji w tym miesiącu</div>
            <div className={`text-2xl font-bold ${remainingEdits === 0 ? 'text-red-600' : 'text-indigo-600'}`}>
              {remainingEdits}/5
            </div>
          </div>
        </div>
      </div>

      {/* Add New Schema Button */}
      {!schemas || schemas.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center mb-6">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Brak schematów
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Zacznij od utworzenia pierwszego schematu danych strukturalnych
            </p>
            <Link
              href={`/dashboard/projects/${projectId}/schemas/setup`}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Dodaj pierwszy schemat
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-600">
              {schemas.filter(s => s.enabled).length} z {schemas.length} schematów aktywnych
            </p>
            <Link
              href={`/dashboard/projects/${projectId}/schemas/setup`}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Dodaj schemat
            </Link>
          </div>

          {/* Schemas List */}
          <div className="space-y-4">
            {schemas.map((schema) => (
              <div
                key={schema.id}
                className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
                  schema.enabled 
                    ? 'border-green-200 bg-green-50/30' 
                    : 'border-gray-200'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Left side - Schema info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {schema.enabled ? (
                          <Eye className="w-5 h-5 text-green-600" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-gray-400" />
                        )}
                        <h3 className="text-lg font-semibold text-gray-900">
                          {schema.type}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          schema.enabled 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {schema.enabled ? 'Aktywny' : 'Wyłączony'}
                        </span>
                      </div>

                      {schema.url_pattern && schema.url_pattern !== '*' && (
                        <p className="text-sm text-gray-600 mb-2">
                          Wzorzec URL: <code className="bg-gray-100 px-2 py-0.5 rounded">{schema.url_pattern}</code>
                        </p>
                      )}

                      <p className="text-xs text-gray-500">
                        Utworzono: {new Date(schema.created_at).toLocaleDateString('pl-PL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>

                      {schema.updated_at && schema.updated_at !== schema.created_at && (
                        <p className="text-xs text-gray-500">
                          Ostatnia edycja: {new Date(schema.updated_at).toLocaleDateString('pl-PL', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex items-center gap-3">
                      <ToggleSchemaButton 
                        schemaId={schema.id}
                        currentStatus={schema.enabled}
                      />
                      
                      <Link
                        href={`/dashboard/projects/${projectId}/schemas/${schema.id}/edit`}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Edit className="w-4 h-4" />
                        Edytuj
                      </Link>

                      <DeleteSchemaButton 
                        schemaId={schema.id}
                        schemaType={schema.type}
                        projectId={projectId}
                      />
                    </div>
                  </div>

                  {/* Schema Preview */}
                  <details className="mt-4 pt-4 border-t border-gray-200">
                    <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900 list-none flex items-center gap-2">
                      <span className="text-gray-400">▶</span>
                      Podgląd JSON-LD
                    </summary>
                    <pre className="mt-3 p-4 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-x-auto">
                      {typeof schema.json === 'string' 
                        ? schema.json 
                        : JSON.stringify(schema.json, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          ℹ️ Informacje o edycjach
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Masz {remainingEdits} {remainingEdits === 1 ? 'edycję' : 'edycji'} do wykorzystania w tym miesiącu</li>
          <li>• Włączanie/wyłączanie schematów nie liczy się jako edycja</li>
          <li>• Usuwanie schematów nie liczy się jako edycja</li>
          <li>• Limit resetuje się 1. dnia każdego miesiąca</li>
        </ul>
      </div>
    </div>
  )
}
