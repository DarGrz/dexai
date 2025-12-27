'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SCHEMA_TYPES_OPTIONS } from '@/lib/schema-labels'

interface NewSchemaFormProps {
  projectId: string
  pageId: string
  businessProfile: any
}

export default function NewSchemaForm({ projectId, pageId, businessProfile }: NewSchemaFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedType, setSelectedType] = useState('LocalBusiness')

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

      // Create minimal schema based on type
      let baseSchema: any = {
        '@context': 'https://schema.org',
        '@type': selectedType,
      }

      // Add business profile data if LocalBusiness type
      if (selectedType === 'LocalBusiness' && businessProfile) {
        baseSchema = {
          ...baseSchema,
          name: businessProfile.business_name,
          description: businessProfile.description,
          telephone: businessProfile.phone,
          email: businessProfile.email,
          url: businessProfile.website,
          address: businessProfile.street_address ? {
            '@type': 'PostalAddress',
            streetAddress: businessProfile.street_address,
            addressLocality: businessProfile.address_locality,
            addressRegion: businessProfile.address_region,
            postalCode: businessProfile.postal_code,
            addressCountry: businessProfile.address_country || 'PL',
          } : undefined,
        }
      }

      // Insert schema
      const { data: newSchema, error: insertError } = await supabase
        .from('schemas')
        .insert([{
          page_id: pageId,
          type: selectedType,
          json: baseSchema,
          enabled: false, // Disabled until user completes the data
        }])
        .select()
        .single()

      if (insertError) throw insertError

      // Redirect to edit page
      router.push(`/dashboard/projects/${projectId}/pages/${pageId}/schemas/${newSchema.id}/edit`)
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas tworzenia schematu')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Wybierz typ informacji
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Wybierz typ informacji, który najlepiej opisuje zawartość tej podstrony
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SCHEMA_TYPES_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectedType(option.value)}
              className={`p-4 text-left rounded-lg border-2 transition-all ${
                selectedType === option.value
                  ? 'border-emerald-600 bg-emerald-50'
                  : 'border-gray-200 bg-white hover:border-emerald-300'
              }`}
            >
              <div className="font-semibold text-gray-900 mb-1">
                {option.label}
              </div>
              <div className="text-xs text-gray-600">
                {option.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Anuluj
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-md hover:from-emerald-700 hover:to-teal-700 font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? 'Tworzenie...' : 'Dalej - uzupełnij dane'}
        </button>
      </div>
    </form>
  )
}
