'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export function DeleteProjectButton({ 
  projectId, 
  domain 
}: { 
  projectId: string
  domain: string 
}) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/dashboard/projects/${projectId}/delete`, {
        method: 'POST',
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Błąd podczas usuwania projektu')
      }
    } catch (error) {
      alert('Błąd podczas usuwania projektu')
    } finally {
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-gray-700">
          Czy na pewno chcesz usunąć <strong>{domain}</strong>?
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? 'Usuwanie...' : 'Tak, usuń'}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isDeleting}
            className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Anuluj
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="flex items-center gap-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
    >
      <Trash2 className="w-4 h-4" />
      Usuń projekt
    </button>
  )
}
