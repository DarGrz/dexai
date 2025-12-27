import Link from 'next/link'
import Image from 'next/image'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image 
              src="/dexai-logo-sq.png" 
              alt="DexAI Logo" 
              width={48} 
              height={48}
              className="w-12 h-12"
            />
            <h1 className="relative text-4xl font-bold overflow-hidden inline-block">
              <span className="relative z-10 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-900 bg-clip-text text-transparent animate-text-shine" style={{
                backgroundSize: '200% 100%',
                backgroundImage: 'linear-gradient(90deg, #111827 0%, #111827 35%, #10b981 45%, #14b8a6 50%, #10b981 55%, #111827 65%, #111827 100%)'
              }}>
                DexAI
              </span>
            </h1>
          </Link>
          <p className="text-gray-600 mt-2">Widoczność w nowoczesnych wyszukiwarkach</p>
        </div>
        <div className="bg-white shadow-xl rounded-lg p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
