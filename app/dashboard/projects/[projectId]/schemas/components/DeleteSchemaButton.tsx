'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'

export function DeleteSchemaButton({ 
  schemaId, 
  schemaType,
  projectId
}: { 
  schemaId: number
  schemaType: string
  projectId: string
}) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // Delete related schema_edits first
      await supabase
        .from('schema_edits')
        .delete()
        .eq('schema_id', schemaId)

      // Delete schema
      const { error } = await supabase
        .from('schemas')
        .delete()
        .eq('id', schemaId)

      if (error) {
        alert('Błąd podczas usuwania schematu')
      } else {
        router.refresh()
      }
    } catch (error) {
      alert('Błąd podczas usuwania schematu')
    } finally {
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Usuń schemat?
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Czy na pewno chcesz usunąć schemat <strong>{schemaType}</strong>? Ta operacja jest nieodwracalna.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
            >
              {isDeleting ? 'Usuwanie...' : 'Tak, usuń'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 font-medium"
            >
              Anuluj
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50"
    >
      <Trash2 className="w-4 h-4" />
      Usuń
    </button>
  )
}
