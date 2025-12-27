'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface BusinessProfileFormProps {
  projectId: string
  existingProfile?: any
}

export default function BusinessProfileForm({ projectId, existingProfile }: BusinessProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    business_name: existingProfile?.business_name || '',
    legal_name: existingProfile?.legal_name || '',
    description: existingProfile?.description || '',
    phone: existingProfile?.phone || '',
    email: existingProfile?.email || '',
    website: existingProfile?.website || '',
    street_address: existingProfile?.street_address || '',
    address_locality: existingProfile?.address_locality || '',
    address_region: existingProfile?.address_region || '',
    postal_code: existingProfile?.postal_code || '',
    address_country: existingProfile?.address_country || 'PL',
    logo_url: existingProfile?.logo_url || '',
    price_range: existingProfile?.price_range || '$$',
    vat_number: existingProfile?.vat_number || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Nie jesteś zalogowany')
        return
      }

      const profileData = {
        user_id: user.id,
        project_id: projectId,
        ...formData,
      }

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('business_profiles')
          .update(profileData)
          .eq('id', existingProfile.id)

        if (updateError) throw updateError
      } else {
        // Create new profile
        const { error: insertError } = await supabase
          .from('business_profiles')
          .insert([profileData])

        if (insertError) throw insertError
      }

      // Create default home page if it doesn't exist
      const { data: existingPage } = await supabase
        .from('pages')
        .select('id')
        .eq('project_id', projectId)
        .eq('url_path', '/')
        .single()

      let homePageId = existingPage?.id

      if (!homePageId) {
        const { data: newPage } = await supabase
          .from('pages')
          .insert({
            project_id: projectId,
            name: 'Strona główna',
            url_path: '/'
          })
          .select()
          .single()
        
        homePageId = newPage?.id
      }

      // Redirect to home page to add information
      router.push(`/dashboard/projects/${projectId}/pages/${homePageId}`)
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas zapisywania profilu firmy')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Podstawowe informacje</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nazwa firmy <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="np. Kwiaciarnia Róża"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pełna nazwa prawna
            </label>
            <input
              type="text"
              value={formData.legal_name}
              onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="np. Kwiaciarnia Róża Sp. z o.o."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opis działalności
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Krótki opis Twojej firmy..."
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dane kontaktowe</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="+48 123 456 789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="kontakt@firma.pl"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Strona internetowa
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="https://firma.pl"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Adres</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ulica i numer
            </label>
            <input
              type="text"
              value={formData.street_address}
              onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="ul. Kwiatowa 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Miasto
            </label>
            <input
              type="text"
              value={formData.address_locality}
              onChange={(e) => setFormData({ ...formData, address_locality: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Warszawa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kod pocztowy
            </label>
            <input
              type="text"
              value={formData.postal_code}
              onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="00-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Województwo
            </label>
            <input
              type="text"
              value={formData.address_region}
              onChange={(e) => setFormData({ ...formData, address_region: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="mazowieckie"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kraj
            </label>
            <select
              value={formData.address_country}
              onChange={(e) => setFormData({ ...formData, address_country: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="PL">Polska</option>
              <option value="DE">Niemcy</option>
              <option value="GB">Wielka Brytania</option>
              <option value="US">USA</option>
            </select>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dodatkowe informacje</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo (URL)
            </label>
            <input
              type="url"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="https://firma.pl/logo.png"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Przedział cenowy
            </label>
            <select
              value={formData.price_range}
              onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="$">$ - Tanie</option>
              <option value="$$">$$ - Średnie</option>
              <option value="$$$">$$$ - Drogie</option>
              <option value="$$$$">$$$$ - Bardzo drogie</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NIP
            </label>
            <input
              type="text"
              value={formData.vat_number}
              onChange={(e) => setFormData({ ...formData, vat_number: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="1234567890"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Wstecz
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-md hover:from-emerald-700 hover:to-teal-700 font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? 'Zapisywanie...' : existingProfile ? 'Aktualizuj profil' : 'Zapisz i kontynuuj'}
        </button>
      </div>
    </form>
  )
}
