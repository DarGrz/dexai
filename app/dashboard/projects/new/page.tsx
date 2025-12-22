'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewProjectPage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const generateProjectId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Clean domain name
    let cleanDomain = domain.trim().toLowerCase()
    cleanDomain = cleanDomain.replace(/^https?:\/\//, '')
    cleanDomain = cleanDomain.replace(/^www\./, '')
    cleanDomain = cleanDomain.replace(/\/$/, '')

    if (!cleanDomain) {
      setError('Wprowadź poprawną domenę')
      setLoading(false)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Musisz być zalogowany')
        setLoading(false)
        return
      }

      // Fetch user profile to get max_domains limit
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('max_domains')
        .eq('id', user.id)
        .single()

      const maxDomains = userProfile?.max_domains || 1

      // Check project limit
      const { data: existingProjects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)

      if (existingProjects && existingProjects.length >= maxDomains) {
        setError(`Osiągnięto limit ${maxDomains} ${maxDomains === 1 ? 'domeny' : 'domen'} w planie. Usuń istniejący projekt aby dodać nowy.`)
        setLoading(false)
        return
      }

      // Check if domain already exists
      const { data: existingProject } = await supabase
        .from('projects')
        .select('*')
        .eq('domain', cleanDomain)
        .eq('user_id', user.id)
        .single()

      if (existingProject) {
        setError('Ta domena jest już dodana do Twojego konta')
        setLoading(false)
        return
      }

      // Generate unique project ID
      const projectId = generateProjectId()

      // Insert new project
      const { error: insertError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          domain: cleanDomain,
          project_id: projectId,
        })

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }

      // Update domain count
      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('domain_count')
        .eq('id', user.id)
        .single()

      await supabase
        .from('user_profiles')
        .update({ domain_count: (currentProfile?.domain_count || 0) + 1 })
        .eq('id', user.id)

      // Redirect to project page
      router.push(`/dashboard/projects/${projectId}`)
    } catch (err) {
      setError('Wystąpił błąd podczas dodawania domeny')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dodaj nową domenę</h1>
        <p className="mt-2 text-sm text-gray-600">
          Wpisz adres swojej strony internetowej, aby rozpocząć optymalizację
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
              Adres domeny
            </label>
            <input
              id="domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
              placeholder="przykład.pl"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Możesz wpisać: przykład.pl, www.przykład.pl lub https://przykład.pl
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Co się stanie po dodaniu?
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Wygenerujemy unikalny kod dla Twojej domeny</li>
              <li>✓ Otrzymasz snippet (kod) do wklejenia na stronie</li>
              <li>✓ Będziesz mógł zarządzać danymi strukturalnymi w panelu</li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Dodawanie...' : 'Dodaj domenę'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
