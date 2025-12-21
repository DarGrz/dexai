'use client'

import { useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'

type SchemaType = 'LocalBusiness' | 'AggregateRating' | 'Product' | 'FAQPage'

export default function CreateSchemaPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const industry = searchParams.get('industry') || 'local_services'

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Selected schema types
  const [selectedSchemas, setSelectedSchemas] = useState<Set<SchemaType>>(new Set(['LocalBusiness']))
  const [expandedSchemas, setExpandedSchemas] = useState<Set<SchemaType>>(new Set(['LocalBusiness']))

  // LocalBusiness form data
  const [localBusinessData, setLocalBusinessData] = useState({
    name: '',
    description: '',
    streetAddress: '',
    addressLocality: '',
    postalCode: '',
    addressCountry: 'PL',
    telephone: '',
    email: '',
    url: '',
    priceRange: '',
    openingHours: 'Mo-Fr 09:00-17:00',
  })

  // AggregateRating form data
  const [ratingData, setRatingData] = useState({
    itemName: '',
    ratingValue: '4.8',
    bestRating: '5',
    ratingCount: '10',
    reviews: [
      { author: '', rating: '5', text: '', date: new Date().toISOString().split('T')[0] }
    ],
  })

  // Product form data
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    image: '',
    brand: '',
    sku: '',
    price: '',
    currency: 'PLN',
    availability: 'InStock',
    ratingValue: '4.5',
    reviewCount: '5',
  })

  // FAQ form data
  const [faqData, setFaqData] = useState({
    questions: [
      { question: '', answer: '' }
    ],
  })

  const toggleSchema = (type: SchemaType) => {
    const newSelected = new Set(selectedSchemas)
    if (newSelected.has(type)) {
      newSelected.delete(type)
      const newExpanded = new Set(expandedSchemas)
      newExpanded.delete(type)
      setExpandedSchemas(newExpanded)
    } else {
      newSelected.add(type)
      const newExpanded = new Set(expandedSchemas)
      newExpanded.add(type)
      setExpandedSchemas(newExpanded)
    }
    setSelectedSchemas(newSelected)
  }

  const toggleExpanded = (type: SchemaType) => {
    const newExpanded = new Set(expandedSchemas)
    if (newExpanded.has(type)) {
      newExpanded.delete(type)
    } else {
      newExpanded.add(type)
    }
    setExpandedSchemas(newExpanded)
  }

  const addReview = () => {
    setRatingData({
      ...ratingData,
      reviews: [...ratingData.reviews, { author: '', rating: '5', text: '', date: new Date().toISOString().split('T')[0] }]
    })
  }

  const removeReview = (index: number) => {
    setRatingData({
      ...ratingData,
      reviews: ratingData.reviews.filter((_, i) => i !== index)
    })
  }

  const addFAQ = () => {
    setFaqData({
      questions: [...faqData.questions, { question: '', answer: '' }]
    })
  }

  const removeFAQ = (index: number) => {
    setFaqData({
      questions: faqData.questions.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Musisz być zalogowany')
        setLoading(false)
        return
      }

      // Get current month for edit tracking
      const now = new Date()
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

      // Check edit limit (5 per month) - each schema counts as 1 edit
      const { data: editCount } = await supabase
        .from('schema_edits')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('project_id', projectId)
        .gte('created_at', new Date(now.getFullYear(), now.getMonth(), 1).toISOString())

      const schemasToCreate = selectedSchemas.size
      const currentEdits = editCount?.length || 0
      const remainingEdits = 5 - currentEdits

      if (schemasToCreate > remainingEdits) {
        setError(`Nie masz wystarczającej liczby edycji. Potrzebujesz ${schemasToCreate}, masz ${remainingEdits}/5.`)
        setLoading(false)
        return
      }

      // Generate schemas
      const schemas = []

      if (selectedSchemas.has('LocalBusiness')) {
        schemas.push({
          type: 'LocalBusiness',
          json: {
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: localBusinessData.name,
            description: localBusinessData.description,
            address: {
              '@type': 'PostalAddress',
              streetAddress: localBusinessData.streetAddress,
              addressLocality: localBusinessData.addressLocality,
              postalCode: localBusinessData.postalCode,
              addressCountry: localBusinessData.addressCountry,
            },
            telephone: localBusinessData.telephone,
            email: localBusinessData.email,
            url: localBusinessData.url,
            priceRange: localBusinessData.priceRange,
            openingHours: localBusinessData.openingHours,
          }
        })
      }

      if (selectedSchemas.has('AggregateRating')) {
        schemas.push({
          type: 'AggregateRating',
          json: {
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: ratingData.itemName,
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: ratingData.ratingValue,
              bestRating: ratingData.bestRating,
              ratingCount: ratingData.ratingCount,
            },
            review: ratingData.reviews.filter(r => r.author && r.text).map(review => ({
              '@type': 'Review',
              author: {
                '@type': 'Person',
                name: review.author,
              },
              reviewRating: {
                '@type': 'Rating',
                ratingValue: review.rating,
                bestRating: '5',
              },
              reviewBody: review.text,
              datePublished: review.date,
            }))
          }
        })
      }

      if (selectedSchemas.has('Product')) {
        schemas.push({
          type: 'Product',
          json: {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: productData.name,
            description: productData.description,
            image: productData.image,
            brand: {
              '@type': 'Brand',
              name: productData.brand,
            },
            sku: productData.sku,
            offers: {
              '@type': 'Offer',
              price: productData.price,
              priceCurrency: productData.currency,
              availability: `https://schema.org/${productData.availability}`,
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: productData.ratingValue,
              reviewCount: productData.reviewCount,
            }
          }
        })
      }

      if (selectedSchemas.has('FAQPage')) {
        schemas.push({
          type: 'FAQPage',
          json: {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqData.questions.filter(q => q.question && q.answer).map(q => ({
              '@type': 'Question',
              name: q.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: q.answer,
              }
            }))
          }
        })
      }

      // Insert all schemas
      for (const schema of schemas) {
        const { error: schemaError } = await supabase
          .from('schemas')
          .insert({
            project_id: projectId,
            type: schema.type,
            enabled: true,
            url_pattern: '*',
            json: schema.json,
          })

        if (schemaError) {
          setError(schemaError.message)
          setLoading(false)
          return
        }

        // Track edit
        await supabase
          .from('schema_edits')
          .insert({
            user_id: user.id,
            project_id: projectId,
            action: 'create',
            month: currentMonth,
          })
      }

      // Redirect to project page
      router.push(`/dashboard/projects/${projectId}`)
    } catch (err) {
      setError('Wystąpił błąd podczas zapisywania')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          href={`/dashboard/projects/${projectId}/schemas/setup`}
          className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
        >
          ← Wstecz
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dodaj dane strukturalne
        </h1>
        <p className="text-gray-600">
          Wybierz typy schematów i wypełnij dane
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Schema Type Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Wybierz typy schematów
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-indigo-300 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={selectedSchemas.has('LocalBusiness')}
                onChange={() => toggleSchema('LocalBusiness')}
                className="w-5 h-5 text-indigo-600 rounded"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">LocalBusiness</div>
                <div className="text-sm text-gray-500">Podstawowe dane firmy (adres, telefon, godziny)</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-indigo-300 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={selectedSchemas.has('AggregateRating')}
                onChange={() => toggleSchema('AggregateRating')}
                className="w-5 h-5 text-indigo-600 rounded"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Opinie i oceny</div>
                <div className="text-sm text-gray-500">Gwiazdki, recenzje klientów</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-indigo-300 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={selectedSchemas.has('Product')}
                onChange={() => toggleSchema('Product')}
                className="w-5 h-5 text-indigo-600 rounded"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Product</div>
                <div className="text-sm text-gray-500">Informacje o produkcie, cena, dostępność</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-indigo-300 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={selectedSchemas.has('FAQPage')}
                onChange={() => toggleSchema('FAQPage')}
                className="w-5 h-5 text-indigo-600 rounded"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">FAQ</div>
                <div className="text-sm text-gray-500">Często zadawane pytania</div>
              </div>
            </label>
          </div>
        </div>
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adres URL strony
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Dane adresowe
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ulica i numer *
              </label>
              <input
                type="text"
                required
                value={formData.streetAddress}
                onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ul. Marszałkowska 12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Miasto *
              </label>
              <input
                type="text"
                required
                value={formData.addressLocality}
                onChange={(e) => setFormData({ ...formData, addressLocality: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Warszawa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kod pocztowy *
              </label>
              <input
                type="text"
                required
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="00-001"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Kontakt
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon *
              </label>
              <input
                type="tel"
                required
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="+48 123 456 789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="kontakt@example.com"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Dodatkowe informacje
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Przedział cenowy
              </label>
              <select
                value={formData.priceRange}
                onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Wybierz...</option>
                <option value="$">$ - Tanie</option>
                <option value="$$">$$ - Umiarkowane</option>
                <option value="$$$">$$$ - Drogie</option>
                <option value="$$$$">$$$$ - Bardzo drogie</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Godziny otwarcia
              </label>
              <input
                type="text"
                value={formData.openingHours}
                onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Mo-Fr 09:00-17:00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: Mo-Fr 09:00-17:00
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Wstecz
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Zapisywanie...' : 'Zapisz i zakończ'}
          </button>
        </div>
      </form>
    </div>
  )
}
