'use client'

export function CopyButton({ text }: { text: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    alert('Skopiowano do schowka!')
  }

  return (
    <button
      onClick={handleCopy}
      className="mt-4 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-md hover:from-emerald-700 hover:to-teal-700 text-sm font-medium shadow-md hover:shadow-lg transition-all"
    >
      📋 Kopiuj kod
    </button>
  )
}
