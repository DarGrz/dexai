import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-4xl font-bold text-indigo-600">Dexio</h1>
          </Link>
          <p className="text-gray-600 mt-2">Optymalizacja widoczności w AI</p>
        </div>
        <div className="bg-white shadow-xl rounded-lg p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
