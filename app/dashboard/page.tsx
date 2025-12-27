import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const isActive = profile?.subscription_status === 'active'
  const isPromo = profile?.is_promo

  // Fetch user's projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const canAddProject = (!projects || projects.length === 0) && isActive

  // Show payment prompt if not subscribed
  if (!isActive) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white text-center">
            <h1 className="text-3xl font-bold mb-2">🚀 Witaj w DexAI!</h1>
            <p className="text-emerald-100 text-lg">
            </p>
          </div>
          
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Aktywuj swój plan
              </h2>
              <p className="text-gray-600 mb-6">
                Aby rozpocząć korzystanie z DexAi, wybierz plan subskrypcji.
              </p>
              
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-6 border-2 border-emerald-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Plan Standard</h3>
                    <p className="text-sm text-gray-600 mt-1">Pełny dostęp do wszystkich funkcji</p>
                  </div>
                  {isPromo && (
                    <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      PROMOCJA
                    </span>
                  )}
                </div>
                
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {isPromo ? '49' : '99'} PLN
                    </span>
                    <span className="text-gray-600">/miesiąc</span>
                  </div>
                  {isPromo && (
                    <p className="text-sm text-green-700 font-medium mt-1">
                      Oszczędzasz 50 PLN miesięcznie!
                    </p>
                  )}
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-gray-700">1 domena</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-gray-700">4 typy schematów (LocalBusiness, Reviews, Products, FAQ)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-gray-700">5 edycji/miesiąc</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-gray-700">Automatyczna optymalizacja AI</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-gray-700">Generator snippetów</span>
                  </li>
                </ul>
                
                <div className="text-center">
                  <Link
                    href="/dashboard/checkout"
                    className="inline-block w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Aktywuj plan - 49 PLN/mies.
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="text-center text-sm text-gray-500">
              <p>🔒 Bezpieczne płatności obsługiwane przez Stripe</p>
              <p className="mt-1">Możesz anulować subskrypcję w każdej chwili</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end items-center mb-6">
        <div>
          {canAddProject ? (
            <Link
              href="/dashboard/projects/new"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-md hover:from-emerald-700 hover:to-teal-700 font-medium shadow-md hover:shadow-lg transition-all"
            >
              + Dodaj domenę
            </Link>
          ) : (
            <div className="text-sm text-gray-500 flex items-center">
              Limit: 1/1 domena
            </div>
          )}
        </div>
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
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all hover:shadow-lg"
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
