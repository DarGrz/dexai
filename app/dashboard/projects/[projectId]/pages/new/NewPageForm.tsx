'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const SCHEMA_TYPES = [
  { value: 'LocalBusiness', label: 'Lokalna firma', description: 'Strona główna, informacje o firmie' },
  { value: 'Product', label: 'Produkt', description: 'Strona produktu w sklepie' },
  { value: 'Service', label: 'Usługa', description: 'Strona ofertowej usługi' },
  { value: 'BlogPosting', label: 'Wpis na blogu', description: 'Artykuł, post blogowy' },
  { value: 'Article', label: 'Artykuł', description: 'Artykuł informacyjny' },
  { value: 'FAQPage', label: 'FAQ', description: 'Strona z pytaniami i odpowiedziami' },
  { value: 'ContactPage', label: 'Kontakt', description: 'Strona kontaktowa' },
  { value: 'AboutPage', label: 'O nas', description: 'Strona o firmie' },
  { value: 'Event', label: 'Wydarzenie', description: 'Strona wydarzenia, szkolenia' },
  { value: 'Recipe', label: 'Przepis', description: 'Przepis kulinarny' },
  { value: 'VideoObject', label: 'Wideo', description: 'Strona z materiałem wideo' },
  { value: 'Course', label: 'Kurs', description: 'Strona kursu, szkolenia online' },
]

interface NewPageFormProps {
  projectId: string
  domain: string
}

export default function NewPageForm({ projectId, domain }: NewPageFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [urlPath, setUrlPath] = useState('/')
  const [schemaType, setSchemaType] = useState('LocalBusiness')

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

      // Normalize URL path
      let normalizedPath = urlPath.trim()
      if (!normalizedPath.startsWith('/')) {
        normalizedPath = '/' + normalizedPath
      }

      // Check if URL already exists
      const { data: existing } = await supabase
        .from('schemas')
        .select('id')
        .eq('project_id', projectId)
        .eq('url_pattern', normalizedPath)
        .single()

      if (existing) {
        setError(`Podstrona ${normalizedPath} już istnieje`)
        setLoading(false)
        return
      }

      // Create minimal schema - will be filled in edit page
      const emptySchema = {
        '@context': 'https://schema.org',
        '@type': schemaType,
        name: '', // Will be filled in edit form
      }

      const { data: newSchema, error: insertError } = await supabase
        .from('schemas')
        .insert([{
          project_id: projectId,
          type: schemaType,
          url_pattern: normalizedPath,
          json: emptySchema,
          enabled: false, // Disabled until user fills the data
        }])
        .select()
        .single()

      if (insertError) throw insertError

      // Redirect to edit page to fill schema data
      router.push(`/dashboard/projects/${projectId}/pages/${newSchema.id}/edit`)
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas tworzenia podstrony')
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

      {/* URL Path */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Adres URL podstrony</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ścieżka URL <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-mono text-sm bg-gray-50 px-3 py-2 rounded-md border border-gray-300">
              {domain}
            </span>
            <input
              type="text"
              required
              value={urlPath}
              onChange={(e) => setUrlPath(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm"
              placeholder="/blog/moj-artykul"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Przykłady: <code>/</code>, <code>/blog</code>, <code>/produkty/laptop</code>, <code>/kontakt</code>
          </p>
        </div>
      </div>

      {/* Schema Type Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Typ zawartości</h3>
        <p className="text-sm text-gray-600 mb-4">
          Wybierz typ zawartości, który najlepiej opisuje tę podstronę
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SCHEMA_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setSchemaType(type.value)}
              className={`p-4 text-left rounded-lg border-2 transition-all ${
                schemaType === type.value
                  ? 'border-emerald-600 bg-emerald-50'
                  : 'border-gray-200 bg-white hover:border-emerald-300'
              }`}
            >
              <div className="font-semibold text-gray-900 mb-1">{type.label}</div>
              <div className="text-xs text-gray-600">{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
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
