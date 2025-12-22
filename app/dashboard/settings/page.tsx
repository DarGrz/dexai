import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CancelSubscriptionButton } from './components/CancelSubscriptionButton'
import { ManageBillingButton } from './components/ManageBillingButton'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

export default async function SettingsPage() {
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

  // Fetch invoices
  let invoices: any[] = []
  if (profile?.stripe_customer_id) {
    try {
      const stripeInvoices = await stripe.invoices.list({
        customer: profile.stripe_customer_id,
        limit: 20,
      })
      invoices = stripeInvoices.data
    } catch (error) {
      console.error('Error fetching invoices:', error)
    }
  }

  const isActive = profile?.subscription_status === 'active'

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <Link 
          href="/dashboard"
          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
        >
          ← Powrót do dashboardu
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Ustawienia konta</h1>

      {/* Account Info */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Informacje o koncie</h2>
        <div className="space-y-3">
          <div>
            <span className="text-gray-600">Email:</span>
            <span className="ml-2 font-medium text-gray-900">{user.email}</span>
          </div>
          <div>
            <span className="text-gray-600">Status subskrypcji:</span>
            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
              isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {isActive ? 'Aktywna' : 'Nieaktywna'}
            </span>
          </div>
          {profile?.subscription_end_date && (
            <div>
              <span className="text-gray-600">Data odnowienia:</span>
              <span className="ml-2 font-medium text-gray-900">
                {new Date(profile.subscription_end_date).toLocaleDateString('pl-PL')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Billing Info */}
      {(profile?.billing_name || profile?.billing_address_line1) && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dane fakturowe</h2>
          <div className="space-y-2 text-gray-700">
            {profile.billing_name && <div><strong>Nazwa:</strong> {profile.billing_name}</div>}
            {profile.billing_address_line1 && <div>{profile.billing_address_line1}</div>}
            {profile.billing_address_line2 && <div>{profile.billing_address_line2}</div>}
            {(profile.billing_postal_code || profile.billing_city) && (
              <div>{profile.billing_postal_code} {profile.billing_city}</div>
            )}
            {profile.billing_country && <div>{profile.billing_country}</div>}
            {profile.billing_tax_id && <div><strong>NIP:</strong> {profile.billing_tax_id}</div>}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Możesz zaktualizować te dane klikając "Zarządzaj danymi płatności" poniżej.
          </p>
        </div>
      )}

      {/* Subscription Management */}
      {isActive && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Zarządzanie subskrypcją</h2>
          
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Dane płatności i faktury</h3>
            <p className="text-gray-600 mb-3">
              Możesz zaktualizować swoją kartę kredytową, adres rozliczeniowy oraz zarządzać fakturami w portalu Stripe.
            </p>
            <ManageBillingButton />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-medium text-gray-900 mb-2">Anulowanie subskrypcji</h3>
            <p className="text-gray-600 mb-4">
              Możesz anulować swoją subskrypcję w każdej chwili. Plan będzie aktywny do końca bieżącego okresu rozliczeniowego.
            </p>
            <CancelSubscriptionButton />
          </div>
        </div>
      )}

      {/* Invoices */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Faktury</h2>
        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Data</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Kwota</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Status</th>
                  <th className="text-right py-3 px-4 text-gray-600 font-medium">PDF</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice: any) => (
                  <tr key={invoice.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-900">
                      {new Date(invoice.created * 1000).toLocaleDateString('pl-PL')}
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {(invoice.amount_paid / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {invoice.status === 'paid' ? 'Opłacona' : invoice.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {invoice.invoice_pdf && (
                        <a
                          href={invoice.invoice_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          Pobierz
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Brak faktur</p>
        )}
      </div>
    </div>
  )
}
