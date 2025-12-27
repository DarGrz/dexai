'use client'

import { useState } from 'react'
import { Download, CheckCircle, AlertCircle, Loader2, Send } from 'lucide-react'

export function IndexNowWidget({ 
  projectId,
  indexnowKey,
  indexnowEnabled,
  indexnowVerifiedAt,
  domain 
}: {
  projectId: string
  indexnowKey: string | null
  indexnowEnabled: boolean
  indexnowVerifiedAt: string | null
  domain: string
}) {
  const [verifying, setVerifying] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const downloadKeyFile = () => {
    if (!indexnowKey) return
    
    const blob = new Blob([indexnowKey], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${indexnowKey}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const verifyDomain = async () => {
    setVerifying(true)
    setMessage(null)

    try {
      const response = await fetch('/api/indexnow/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, domain }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ type: 'error', text: data.details || data.error })
        setVerifying(false)
        return
      }

      setMessage({ type: 'success', text: data.message })
      // Reload page to show updated status
      setTimeout(() => window.location.reload(), 2000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Błąd połączenia. Spróbuj ponownie.' })
    } finally {
      setVerifying(false)
    }
  }

  const submitToIndexNow = async () => {
    setSubmitting(true)
    setMessage(null)

    try {
      // Get all pages from the project
      const pagesResponse = await fetch(`/api/projects/${projectId}/pages`)
      if (!pagesResponse.ok) throw new Error('Failed to fetch pages')
      
      const pages = await pagesResponse.json()
      const urls = pages.map((p: any) => p.url_path)

      const response = await fetch('/api/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, urls, domain }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ type: 'error', text: data.details || data.error })
        setSubmitting(false)
        return
      }

      setMessage({ type: 'success', text: `✅ Wysłano ${data.urlCount} URL do indeksacji!` })
    } catch (error) {
      setMessage({ type: 'error', text: 'Błąd wysyłania. Spróbuj ponownie.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">📡 IndexNow - Indeksacja w AI</h3>
        {indexnowEnabled && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
            Aktywne
          </span>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Automatycznie zgłaszaj zmiany do Bing, ChatGPT i Copilot
      </p>

      {/* Status */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Status weryfikacji:</span>
          {indexnowVerifiedAt ? (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              Zweryfikowano
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-600">
              <AlertCircle className="w-4 h-4" />
              Niezweryfikowano
            </span>
          )}
        </div>
        {indexnowVerifiedAt && (
          <div className="text-xs text-gray-500">
            Ostatnia weryfikacja: {new Date(indexnowVerifiedAt).toLocaleString('pl-PL')}
          </div>
        )}
      </div>

      {/* Instructions */}
      {!indexnowEnabled && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Instrukcja aktywacji:</h4>
          <ol className="text-xs text-blue-800 space-y-1 ml-4 list-decimal">
            <li>Pobierz plik weryfikacyjny</li>
            <li>Wgraj go do głównego katalogu swojej strony (obok index.html)</li>
            <li>Sprawdź czy plik jest dostępny pod adresem: <code className="bg-blue-100 px-1 rounded">{domain}/{indexnowKey}.txt</code></li>
            <li>Kliknij "Sprawdź połączenie"</li>
          </ol>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={downloadKeyFile}
          disabled={!indexnowKey}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-4 h-4" />
          Pobierz plik weryfikacyjny ({indexnowKey?.slice(0, 8)}...txt)
        </button>

        <button
          onClick={verifyDomain}
          disabled={verifying || !indexnowKey}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0375FF] hover:bg-[#0260D9] text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {verifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Weryfikuję...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Sprawdź połączenie
            </>
          )}
        </button>

        {indexnowEnabled && (
          <button
            onClick={submitToIndexNow}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Wysyłam...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Wyślij do indeksacji teraz
              </>
            )}
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          💡 IndexNow to bezpłatny protokół wspierany przez Bing, który natychmiast informuje wyszukiwarki AI (ChatGPT, Copilot) o zmianach na Twojej stronie.
        </p>
      </div>
    </div>
  )
}
