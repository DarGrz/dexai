import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CopyButton } from './components/CopyButton'
import { DeleteProjectButton } from '@/app/dashboard/components/DeleteProjectButton'
import { headers } from 'next/headers'
import { Plus, ExternalLink, Settings } from 'lucide-react'

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

  // Fetch pages for this project
  const { data: pages } = await supabase
    .from('pages')
    .select(`
      *,
      schemas:schemas(count)
    `)
    .eq('project_id', projectId)
    .order('url_path', { ascending: true })

  // Check if business profile exists
  const { data: businessProfile } = await supabase
    .from('business_profiles')
    .select('id, business_name')
    .eq('project_id', projectId)
    .single()

  // Fetch user profile with max schemas limit
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('max_schemas_per_project')
    .eq('id', user.id)
    .single()

  const maxPagesPerProject = userProfile?.max_schemas_per_project || 50
  const pageCount = pages?.length || 0
  const canAddPage = pageCount < maxPagesPerProject

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
            
            {!businessProfile ? (
              /* Empty State - No Business Profile */
              <div className="space-y-4">
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">
                    ⚡ JavaScript (zalecane)
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">
                    Wklej w sekcji <code className="bg-gray-100 px-1 rounded text-gray-400">&lt;head&gt;</code> lub przed <code className="bg-gray-100 px-1 rounded text-gray-400">&lt;/body&gt;</code>
                  </p>
                  <div className="bg-gray-200 p-4 rounded-md font-mono text-xs overflow-x-auto mb-2 min-h-[60px] flex items-center justify-center">
                    <span className="text-gray-400 italic">Najpierw utwórz profil firmy</span>
                  </div>
                  <button
                    disabled
                    className="text-xs bg-gray-300 text-gray-500 px-3 py-1.5 rounded cursor-not-allowed opacity-50"
                  >
                    Kopiuj
                  </button>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-emerald-600 text-xl">💡</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-emerald-900 mb-1">Utwórz profil firmy</h3>
                      <p className="text-sm text-emerald-800 mb-3">
                        Wprowadź podstawowe dane firmy, aby odblokować kod do wklejenia.
                      </p>
                      <Link
                        href={`/dashboard/projects/${projectId}/business-profile`}
                        className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm rounded-md hover:from-emerald-700 hover:to-teal-700 font-medium shadow-sm hover:shadow-md transition-all"
                      >
                        Utwórz profil firmy
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Active State - Business Profile Exists */
              <>
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
                        Bezpośredni URL do kodu HTML
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
              </>
            )}
          </div>

          {/* Pages/Subpages List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Podstrony
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Zarządzaj danymi dla różnych adresów w domenie {project.domain}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">Limit</div>
                <div className={`text-lg font-bold ${pageCount >= maxPagesPerProject ? 'text-red-600' : 'text-emerald-600'}`}>
                  {pageCount}/{maxPagesPerProject}
                </div>
              </div>
            </div>

            {!pages || pages.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <div className="text-gray-400 text-5xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Brak podstron
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Dodaj pierwszą podstronę z dedykowanymi informacjami
                </p>
                {businessProfile && canAddPage && (
                  <Link
                    href={`/dashboard/projects/${projectId}/pages/new`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-md hover:from-emerald-700 hover:to-teal-700 text-sm font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Dodaj pierwszą podstronę
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-4">
                  {pages.map((page: any) => {
                    const schemaCount = page.schemas?.[0]?.count || 0
                    return (
                      <Link
                        key={page.id}
                        href={`/dashboard/projects/${projectId}/pages/${page.id}`}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-sm text-gray-900">
                                {project.domain}{page.url_path}
                              </span>
                              <ExternalLink className="w-3 h-3 text-gray-400" />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {page.name}
                              </span>
                              <span className="text-xs text-gray-400">
                                • {schemaCount} {schemaCount === 1 ? 'informacja' : schemaCount < 5 ? 'informacje' : 'informacji'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-3 py-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                          <Settings className="w-4 h-4" />
                          Zarządzaj
                        </div>
                      </Link>
                    )
                  })}
                </div>

                {businessProfile && canAddPage && (
                  <Link
                    href={`/dashboard/projects/${projectId}/pages/new`}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    Dodaj kolejną podstronę
                  </Link>
                )}

                {!canAddPage && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      ⚠️ Osiągnięto limit {maxPagesPerProject} podstron. Usuń niepotrzebne aby dodać nowe.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Szybkie akcje</h3>
            <div className="space-y-2">
              {businessProfile ? (
                <>
                  {canAddPage ? (
                    <Link
                      href={`/dashboard/projects/${projectId}/pages/new`}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-md hover:from-emerald-700 hover:to-teal-700 text-sm font-medium shadow-md hover:shadow-lg transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Dodaj podstronę
                    </Link>
                  ) : (
                    <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-md text-sm text-center">
                      Limit podstron osiągnięty
                    </div>
                  )}
                  <Link
                    href={`/dashboard/projects/${projectId}/business-profile`}
                    className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium text-center"
                  >
                    Edytuj profil firmy
                  </Link>
                </>
              ) : (
                <Link
                  href={`/dashboard/projects/${projectId}/business-profile`}
                  className="block w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-md hover:from-emerald-700 hover:to-teal-700 text-sm text-center font-medium shadow-md hover:shadow-lg transition-all"
                >
                  Utwórz profil firmy
                </Link>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Statystyki</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Aktywne podstrony</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pages?.length || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Łącznie podstron</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pageCount}/{maxPagesPerProject}
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
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-teal-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-teal-900 mb-2">💡 Wskazówka</h3>
            <p className="text-xs text-teal-800">
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
