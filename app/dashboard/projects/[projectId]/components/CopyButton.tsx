'use client'

export function CopyButton({ text }: { text: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    alert('Skopiowano do schowka!')
  }

  return (
    <button
      onClick={handleCopy}
      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
    >
      📋 Kopiuj kod
    </button>
  )
}
