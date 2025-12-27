'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface NewPageFormProps {
  projectId: string
  domain: string
}

export default function NewPageForm({ projectId, domain }: NewPageFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [pageName, setPageName] = useState('')
  const [urlPath, setUrlPath] = useState('/')
  const [description, setDescription] = useState('')

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

      // Validate page name
      if (!pageName.trim()) {
        setError('Nazwa podstrony jest wymagana')
        setLoading(false)
        return
      }

      // Check if URL already exists
      const { data: existing } = await supabase
        .from('pages')
        .select('id')
        .eq('project_id', projectId)
        .eq('url_path', normalizedPath)
        .single()

      if (existing) {
        setError(`Podstrona z adresem ${normalizedPath} już istnieje`)
        setLoading(false)
        return
      }

      // Create new page
      const { data: newPage, error: insertError } = await supabase
        .from('pages')
        .insert([{
          project_id: projectId,
          name: pageName.trim(),
          url_path: normalizedPath,
          description: description.trim() || null,
        }])
        .select()
        .single()

      if (insertError) throw insertError

      // Redirect to page schemas management
      router.push(`/dashboard/projects/${projectId}/pages/${newPage.id}`)
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

      {/* Page Name */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Nazwa podstrony <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={pageName}
          onChange={(e) => setPageName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
          placeholder="np. Strona główna, Blog, Kontakt"
        />
        <p className="text-xs text-gray-500 mt-2">
          Nazwa wyświetlana w panelu zarządzania
        </p>
      </div>

      {/* URL Path */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Adres URL podstrony <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
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

      {/* Description (Optional) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Opis (opcjonalnie)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
          placeholder="Krótki opis podstrony..."
        />
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
          {loading ? 'Tworzenie...' : 'Utwórz podstronę'}
        </button>
      </div>
    </form>
  )
}
