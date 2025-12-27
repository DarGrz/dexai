'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function ToggleSchemaButton({ 
  schemaId, 
  enabled 
}: { 
  schemaId: string
  enabled: boolean 
}) {
  const [isToggling, setIsToggling] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleToggle = async () => {
    setIsToggling(true)
    try {
      const { error } = await supabase
        .from('schemas')
        .update({ enabled: !enabled })
        .eq('id', schemaId)

      if (error) {
        alert('Błąd podczas zmiany statusu')
      } else {
        router.refresh()
      }
    } catch (error) {
      alert('Błąd podczas zmiany statusu')
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={enabled}
        onChange={handleToggle}
        disabled={isToggling}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
      <span className="ml-3 text-sm font-medium text-gray-700">
        {enabled ? 'Włączony' : 'Wyłączony'}
      </span>
    </label>
  )
}
