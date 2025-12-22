'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CancelSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/cancel', {
        method: 'POST',
      })

      if (response.ok) {
        alert('Subskrypcja została anulowana. Pozostanie aktywna do końca bieżącego okresu rozliczeniowego.')
        router.refresh()
      } else {
        const data = await response.json()
        alert(`Błąd: ${data.error}`)
      }
    } catch (error) {
      alert('Wystąpił błąd podczas anulowania subskrypcji')
    } finally {
      setIsLoading(false)
      setShowConfirm(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Czy na pewno chcesz anulować?
        </h3>
        <p className="text-red-700 mb-4">
          Twoja subskrypcja będzie aktywna do końca bieżącego okresu rozliczeniowego. 
          Później nie będziesz mógł korzystać z DexAi.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Anulowanie...' : 'Tak, anuluj subskrypcję'}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Nie, zachowaj subskrypcję
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      Anuluj subskrypcję
    </button>
  )
}
