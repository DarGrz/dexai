import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { DeleteProjectButton } from './components/DeleteProjectButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch user's projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const canAddProject = !projects || projects.length === 0

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Twoje projekty</h1>
        {canAddProject ? (
          <Link
            href="/dashboard/projects/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium"
          >
            + Dodaj domenę
          </Link>
        ) : (
          <div className="text-sm text-gray-500">
            Limit: 1/1 domena
          </div>
        )}
      </div>

      {!projects || projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Brak projektów
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Zacznij od dodania swojej pierwszej domeny
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard/projects/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Dodaj pierwszą domenę
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <Link
                href={`/dashboard/projects/${project.project_id}`}
                className="block"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {project.domain}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      ID: {project.project_id}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Utworzono: {new Date(project.created_at).toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <DeleteProjectButton 
                  projectId={project.project_id}
                  domain={project.domain}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
