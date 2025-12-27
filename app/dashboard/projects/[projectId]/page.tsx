import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CopyButton } from './components/CopyButton'
import { DeleteProjectButton } from '@/app/dashboard/components/DeleteProjectButton'
import { headers } from 'next/headers'

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    notFound()
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

  // Fetch schemas for this project
  const { data: schemas } = await supabase
    .from('schemas')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  // Get base URL for snippet
  const headersList = await headers()
  const host = headersList.get('host') || 'dexai.pl'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`
  
  // JavaScript snippet (for dynamic loading) - uses schema-html endpoint
  const jsSnippet = `<script src="${baseUrl}/embed.js" data-project="${projectId}" data-api="${baseUrl}/api/schema-html" defer></script>`
  
  // Server-side snippet (for SEO - Google can see it)
  const seoSnippet = `<?php
// Snippet dla SEO - Google widzi statyczny HTML
$schema_url = '${baseUrl}/api/schema-html?projectId=${projectId}';
$schema_html = file_get_contents($schema_url);
echo $schema_html;
?>`

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
        >
          ← Powrót do projektów
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{project.domain}</h1>
        <p className="text-sm text-gray-500 mt-1">ID projektu: {project.project_id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Snippet */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Kod do wklejenia na stronie
            </h2>
            
            {/* JavaScript Snippet */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                ⚡ JavaScript (zalecane)
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                Wklej w sekcji <code className="bg-gray-100 px-1 rounded">&lt;head&gt;</code> lub przed <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code>
              </p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-xs overflow-x-auto mb-2">
                <code>{jsSnippet}</code>
              </div>
              <CopyButton text={jsSnippet} />
            </div>

            {/* Advanced Options - Collapsed */}
            <details className="mt-4">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 flex items-center gap-1">
                <span>⚙️</span>
                <span>Opcjonalnie</span>
              </summary>
              <div className="mt-4 space-y-6 pl-4 border-l-2 border-gray-200">
                {/* SEO Snippet (for PHP/Server-side) */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Dla SEO (PHP/Server-side)
                  </h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Dla stron PHP - wklej w <code className="bg-gray-100 px-1 rounded">&lt;head&gt;</code>
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-xs overflow-x-auto mb-2">
                    <code>{seoSnippet}</code>
                  </div>
                  <CopyButton text={seoSnippet} />
                </div>

                {/* Direct URL */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Bezpośredni URL do schematów HTML
                  </h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Otwórz ten URL i skopiuj zawartość bezpośrednio do swojego HTML
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-xs overflow-x-auto mb-2 break-all">
                    <code>{baseUrl}/api/schema-html?projectId={projectId}</code>
                  </div>
                  <div className="flex gap-2">
                    <CopyButton text={`${baseUrl}/api/schema-html?projectId=${projectId}`} />
                    <a
                      href={`${baseUrl}/api/schema-html?projectId=${projectId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-1.5 rounded hover:from-emerald-700 hover:to-teal-700 transition-all shadow-sm hover:shadow-md"
                    >
                      Otwórz URL
                    </a>
                  </div>
                </div>
              </div>
            </details>
          </div>

          {/* Schemas List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Informacje o firmie
              </h2>
              <Link
                href={`/dashboard/projects/${projectId}/schemas`}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Zarządzaj →
              </Link>
            </div>

            {!schemas || schemas.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  Nie masz jeszcze żadnych danych strukturalnych
                </p>
                <Link
                  href={`/dashboard/projects/${projectId}/schemas/setup`}
                  className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-md hover:from-emerald-700 hover:to-teal-700 text-sm font-medium shadow-md hover:shadow-lg transition-all"
                >
                  Rozpocznij konfigurację
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {schemas.map((schema) => (
                  <div
                    key={schema.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${schema.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="font-medium text-gray-900">{schema.type}</span>
                      {schema.url_pattern && schema.url_pattern !== '*' && (
                        <span className="text-xs text-gray-500">({schema.url_pattern})</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {schema.enabled ? 'Aktywne' : 'Wyłączone'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Szybkie akcje</h3>
            <div className="space-y-2">
              <Link
                href={`/dashboard/projects/${projectId}/schemas/setup`}
                className="block w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-md hover:from-emerald-700 hover:to-teal-700 text-sm text-center font-medium shadow-md hover:shadow-lg transition-all"
              >
                Konfiguruj schema
              </Link>
              <button
                className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
              >
                Testuj w Google
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Statystyki</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Aktywne sekcje</p>
                <p className="text-2xl font-bold text-gray-900">
                  {schemas?.filter(s => s.enabled).length || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Łącznie sekcji</p>
                <p className="text-2xl font-bold text-gray-900">
                  {schemas?.length || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Data utworzenia</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(project.created_at).toLocaleDateString('pl-PL')}
                </p>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Wskazówka</h3>
            <p className="text-xs text-blue-800">
              Po wklejeniu kodu na stronie, dane będą automatycznie aktualizowane bez potrzeby zmiany kodu.
            </p>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Strefa niebezpieczna</h3>
            <DeleteProjectButton 
              projectId={project.project_id}
              domain={project.domain}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
