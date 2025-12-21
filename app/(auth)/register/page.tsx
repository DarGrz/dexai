'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Hasła nie są identyczne')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Hasło musi mieć minimum 6 znaków')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    // Jeśli email confirmation jest wyłączone, użytkownik jest od razu zalogowany
    if (!error && data.user && !data.user.identities?.length) {
      setError('Ten email jest już zarejestrowany')
      setLoading(false)
      return
    }

    // Jeśli email confirmation jest wyłączone, użytkownik jest od razu zalogowany
    if (!error && data.user && !data.user.identities?.length) {
      setError('Ten email jest już zarejestrowany')
      setLoading(false)
      return
    }

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Sprawdź czy email confirmation jest wymagane
      const { data: session } = await supabase.auth.getSession()
      
      if (session.session) {
        // Email confirmation wyłączone - redirect do dashboardu
        router.push('/dashboard')
        router.refresh()
      } else {
        // Email confirmation włączone - pokaż komunikat
        setSuccess(true)
        setLoading(false)
      }
    }
  }

  if (success) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Sprawdź email</h2>
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md mb-4">
          <p className="font-medium">Rejestracja prawie ukończona!</p>
          <p className="text-sm mt-2">
            Wysłaliśmy link weryfikacyjny na adres <strong>{email}</strong>. 
            Kliknij w link, aby aktywować konto.
          </p>
        </div>
        <Link
          href="/login"
          className="block text-center text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Przejdź do logowania
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Utwórz konto</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Adres email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="twoj@email.pl"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Hasło
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Minimum 6 znaków"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Powtórz hasło
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Powtórz hasło"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Tworzenie konta...' : 'Zarejestruj się'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Masz już konto?{' '}
        <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
          Zaloguj się
        </Link>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-500 text-center">
        Rejestrując się akceptujesz{' '}
        <a href="#" className="text-indigo-600 hover:underline">
          regulamin
        </a>{' '}
        i{' '}
        <a href="#" className="text-indigo-600 hover:underline">
          politykę prywatności
        </a>
      </div>
    </div>
  )
}
