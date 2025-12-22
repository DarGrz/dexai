import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckoutForm } from '../components/CheckoutForm'

export default async function CheckoutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const isActive = profile?.subscription_status === 'active'

  // Jeśli już ma aktywną subskrypcję, przekieruj do dashboardu
  if (isActive) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Link 
            href="/dashboard"
            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
          >
            ← Powrót do dashboardu
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Aktywacja subskrypcji</h1>
            <p className="text-indigo-100">
              Wypełnij dane do faktury i przejdź do płatności
            </p>
          </div>

          <div className="p-8">
            {/* Podsumowanie planu */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200 mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Plan Standard</h2>
                  <p className="text-sm text-gray-600 mt-1">Pełny dostęp do wszystkich funkcji</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900">
                    49 PLN
                  </span>
                  <span className="text-gray-600">/miesiąc</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Cena brutto (zawiera VAT 23%)</p>
              </div>

              <div className="border-t border-indigo-200 pt-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Co zawiera:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-gray-700">1 domena</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-gray-700">4 typy schematów</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-gray-700">5 edycji/miesiąc</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-gray-700">Automatyczna optymalizacja AI</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Formularz */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dane do faktury</h3>
              <CheckoutForm />
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 mt-6">
          <p>🔒 Bezpieczne płatności obsługiwane przez Stripe</p>
          <p className="mt-1">Możesz anulować subskrypcję w każdej chwili</p>
        </div>
      </div>
    </div>
  )
}
