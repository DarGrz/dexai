'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Trash2 } from 'lucide-react'

type SchemaData = {
  id: string
  type: string
  json: any
  url_pattern: string
  project_id: string
}

type LocalBusinessFormData = {
  name: string
  description: string
  street: string
  city: string
  postalCode: string
  phone: string
  email: string
  priceRange: string
  openingHours: Array<{
    day: string
    opens: string
    closes: string
    closed: boolean
  }>
}

type AggregateRatingFormData = {
  itemName: string
  ratingValue: string
  ratingCount: string
  reviews: Array<{
    author: string
    rating: string
    text: string
    date: string
  }>
}

type ProductFormData = {
  name: string
  description: string
  brand: string
  price: string
  availability: string
}

type FAQFormData = {
  questions: Array<{
    question: string
    answer: string
  }>
}

type FormData = LocalBusinessFormData | AggregateRatingFormData | ProductFormData | FAQFormData

export function EditSchemaForm({ 
  schema, 
  projectId,
  remainingEdits
}: { 
  schema: SchemaData
  projectId: string
  remainingEdits: number
}) {
  const router = useRouter()
  const supabase = createClient()
  
  // Parse json
  const jsonData = typeof schema.json === 'string' 
    ? JSON.parse(schema.json) 
    : schema.json

  // Initialize form data based on schema type
  const [formData, setFormData] = useState<FormData>(() => {
    if (schema.type === 'LocalBusiness') {
      const existingHours = jsonData.openingHoursSpecification || []
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      
      const openingHours = daysOfWeek.map(day => {
        const existing = existingHours.find((h: any) => 
          Array.isArray(h.dayOfWeek) ? h.dayOfWeek.includes(day) : h.dayOfWeek === day
        )
        return {
          day,
          opens: existing?.opens || '09:00',
          closes: existing?.closes || '17:00',
          closed: !existing,
        }
      })

      return {
        name: jsonData.name || '',
        description: jsonData.description || '',
        street: jsonData.address?.streetAddress || '',
        city: jsonData.address?.addressLocality || '',
        postalCode: jsonData.address?.postalCode || '',
        phone: jsonData.telephone || '',
        email: jsonData.email || '',
        priceRange: jsonData.priceRange || '',
        openingHours,
      }
    } else if (schema.type === 'AggregateRating') {
      return {
        itemName: jsonData.name || '',
        ratingValue: jsonData.aggregateRating?.ratingValue || '4.8',
        ratingCount: jsonData.aggregateRating?.ratingCount || '10',
        reviews: jsonData.review?.map((r: any) => ({
          author: r.author?.name || '',
          rating: r.reviewRating?.ratingValue || '5',
          text: r.reviewBody || '',
          date: r.datePublished || new Date().toISOString().split('T')[0],
        })) || [{ author: '', rating: '5', text: '', date: new Date().toISOString().split('T')[0] }]
      }
    } else if (schema.type === 'Product') {
      return {
        name: jsonData.name || '',
        description: jsonData.description || '',
        brand: jsonData.brand?.name || '',
        price: jsonData.offers?.price || '',
        availability: jsonData.offers?.availability?.split('/').pop() || 'InStock',
      }
    } else if (schema.type === 'FAQPage') {
      return {
        questions: jsonData.mainEntity?.map((q: any) => ({
          question: q.name || '',
          answer: q.acceptedAnswer?.text || '',
        })) || [{ question: '', answer: '' }]
      }
    }
    
    return { name: '', description: '', street: '', city: '', postalCode: '', phone: '', email: '', priceRange: '', openingHours: [] }
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (remainingEdits === 0) {
      setError('Osiągnięto limit edycji w tym miesiącu (5/5)')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Generate updated JSON-LD
      let updatedJsonData: any

      if (schema.type === 'LocalBusiness') {
        const data = formData as LocalBusinessFormData
        const openingHoursSpec = data.openingHours
          .filter(h => !h.closed)
          .map(h => ({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: h.day,
            opens: h.opens,
            closes: h.closes,
          }))

        updatedJsonData = {
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: data.name,
          description: data.description,
          address: {
            '@type': 'PostalAddress',
            streetAddress: data.street,
            addressLocality: data.city,
            postalCode: data.postalCode,
            addressCountry: 'PL',
          },
          telephone: data.phone,
          email: data.email,
          priceRange: data.priceRange,
          openingHoursSpecification: openingHoursSpec,
        }
      } else if (schema.type === 'AggregateRating') {
        const data = formData as AggregateRatingFormData
        updatedJsonData = {
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: data.itemName,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: data.ratingValue,
            bestRating: '5',
            ratingCount: data.ratingCount,
          },
          review: data.reviews.filter(r => r.author && r.text).map(review => ({
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
      } else if (schema.type === 'Product') {
        const data = formData as ProductFormData
        updatedJsonData = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: data.name,
          description: data.description,
          brand: { '@type': 'Brand', name: data.brand },
          offers: {
            '@type': 'Offer',
            price: data.price,
            priceCurrency: 'PLN',
            availability: `https://schema.org/${data.availability}`,
          }
        }
      } else if (schema.type === 'FAQPage') {
        const data = formData as FAQFormData
        updatedJsonData = {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: data.questions.filter(q => q.question && q.answer).map(q => ({
            '@type': 'Question',
            name: q.question,
            acceptedAnswer: { '@type': 'Answer', text: q.answer }
          }))
        }
      }

      // Update schema
      const { error: updateError } = await supabase
        .from('schemas')
        .update({
          json: updatedJsonData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', schema.id)

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }

      // Track edit
      await supabase
        .from('schema_edits')
        .insert({
          project_id: projectId,
          schema_id: schema.id,
        })

      // Redirect back to schemas page
      router.push(`/dashboard/projects/${projectId}/schemas`)
      router.refresh()
    } catch (err) {
      setError('Wystąpił błąd podczas zapisywania')
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/dashboard/projects/${projectId}/schemas`}
          className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
        >
          ← Powrót do zarządzania
        </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edytuj schemat: {schema.type}
          </h1>
          <p className="text-gray-600">
            Pozostało edycji w tym miesiącu: <strong>{remainingEdits}/5</strong>
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* LocalBusiness Form */}
          {schema.type === 'LocalBusiness' && (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Podstawowe informacje
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nazwa firmy *
                    </label>
                    <input
                      type="text"
                      required
                      value={(formData as LocalBusinessFormData).name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value } as FormData)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="np. Salon Fryzjerski Magda"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opis działalności
                    </label>
                    <textarea
                      value={(formData as LocalBusinessFormData).description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value } as FormData)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Krótki opis Twojej firmy i oferowanych usług"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Adres</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={(formData as LocalBusinessFormData).street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value } as FormData)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Ulica i numer"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={(formData as LocalBusinessFormData).city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value } as FormData)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      placeholder="Miasto"
                    />
                    <input
                      type="text"
                      value={(formData as LocalBusinessFormData).postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value } as FormData)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      placeholder="Kod pocztowy"
                    />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Kontakt</h2>
                <div className="space-y-4">
                  <input
                    type="tel"
                    value={(formData as LocalBusinessFormData).phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value } as FormData)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Telefon"
                  />
                  <input
                    type="email"
                    value={(formData as LocalBusinessFormData).email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value } as FormData)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Email"
                  />
                  <select
                    value={(formData as LocalBusinessFormData).priceRange}
                    onChange={(e) => setFormData({ ...formData, priceRange: e.target.value } as FormData)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Przedział cenowy</option>
                    <option value="$">$ - Niskie ceny</option>
                    <option value="$$">$$ - Średnie ceny</option>
                    <option value="$$$">$$$ - Wyższe ceny</option>
                    <option value="$$$$">$$$$ - Premium</option>
                  </select>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Godziny otwarcia</h2>
                <div className="space-y-2">
                  {(formData as LocalBusinessFormData).openingHours.map((hours, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <label className="flex items-center gap-2 w-32">
                        <input
                          type="checkbox"
                          checked={!hours.closed}
                          onChange={(e) => {
                            const data = formData as LocalBusinessFormData
                            const newHours = [...data.openingHours]
                            newHours[idx].closed = !e.target.checked
                            setFormData({ ...formData, openingHours: newHours } as FormData)
                          }}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <span className="text-sm font-medium">
                          {hours.day === 'Monday' ? 'Poniedziałek' : 
                           hours.day === 'Tuesday' ? 'Wtorek' : 
                           hours.day === 'Wednesday' ? 'Środa' : 
                           hours.day === 'Thursday' ? 'Czwartek' : 
                           hours.day === 'Friday' ? 'Piątek' : 
                           hours.day === 'Saturday' ? 'Sobota' : 'Niedziela'}
                        </span>
                      </label>
                      {!hours.closed && (
                        <>
                          <input
                            type="time"
                            value={hours.opens}
                            onChange={(e) => {
                              const data = formData as LocalBusinessFormData
                              const newHours = [...data.openingHours]
                              newHours[idx].opens = e.target.value
                              setFormData({ ...formData, openingHours: newHours } as FormData)
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                          <span className="text-gray-500">-</span>
                          <input
                            type="time"
                            value={hours.closes}
                            onChange={(e) => {
                              const data = formData as LocalBusinessFormData
                              const newHours = [...data.openingHours]
                              newHours[idx].closes = e.target.value
                              setFormData({ ...formData, openingHours: newHours } as FormData)
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </>
                      )}
                      {hours.closed && <span className="text-sm text-gray-500">Zamknięte</span>}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* AggregateRating Form */}
          {schema.type === 'AggregateRating' && (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Opinie i oceny</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    required
                    placeholder="Nazwa (np. nazwa firmy) *"
                    value={(formData as AggregateRatingFormData).itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value } as FormData)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Średnia ocena"
                      value={(formData as AggregateRatingFormData).ratingValue}
                      onChange={(e) => setFormData({ ...formData, ratingValue: e.target.value } as FormData)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="number"
                      placeholder="Liczba ocen"
                      value={(formData as AggregateRatingFormData).ratingCount}
                      onChange={(e) => setFormData({ ...formData, ratingCount: e.target.value } as FormData)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-900">Przykładowe opinie</h3>
                      <button
                        type="button"
                        onClick={() => {
                          const data = formData as AggregateRatingFormData
                          setFormData({
                            ...formData,
                            reviews: [...data.reviews, { author: '', rating: '5', text: '', date: new Date().toISOString().split('T')[0] }]
                          } as FormData)
                        }}
                        className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" /> Dodaj opinię
                      </button>
                    </div>
                    {(formData as AggregateRatingFormData).reviews.map((review, idx) => (
                      <div key={idx} className="p-4 border border-gray-200 rounded-lg mb-3 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Imię autora"
                            value={review.author}
                            onChange={(e) => {
                              const data = formData as AggregateRatingFormData
                              const newReviews = [...data.reviews]
                              newReviews[idx].author = e.target.value
                              setFormData({ ...formData, reviews: newReviews } as FormData)
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                          <select
                            value={review.rating}
                            onChange={(e) => {
                              const data = formData as AggregateRatingFormData
                              const newReviews = [...data.reviews]
                              newReviews[idx].rating = e.target.value
                              setFormData({ ...formData, reviews: newReviews } as FormData)
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                          >
                            {['5','4','3','2','1'].map(r => <option key={r} value={r}>{r} ⭐</option>)}
                          </select>
                          {(formData as AggregateRatingFormData).reviews.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const data = formData as AggregateRatingFormData
                                setFormData({ ...formData, reviews: data.reviews.filter((_, i) => i !== idx) } as FormData)
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <textarea
                          placeholder="Treść opinii"
                          value={review.text}
                          onChange={(e) => {
                            const data = formData as AggregateRatingFormData
                            const newReviews = [...data.reviews]
                            newReviews[idx].text = e.target.value
                            setFormData({ ...formData, reviews: newReviews } as FormData)
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Product Form */}
          {schema.type === 'Product' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Product - Produkt</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Nazwa produktu *"
                  value={(formData as ProductFormData).name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value } as FormData)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
                <textarea
                  placeholder="Opis produktu"
                  value={(formData as ProductFormData).description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value } as FormData)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Marka"
                    value={(formData as ProductFormData).brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value } as FormData)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Cena (PLN)"
                    value={(formData as ProductFormData).price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value } as FormData)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <select
                  value={(formData as ProductFormData).availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value } as FormData)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="InStock">Dostępny</option>
                  <option value="OutOfStock">Niedostępny</option>
                  <option value="PreOrder">Przedsprzedaż</option>
                </select>
              </div>
            </div>
          )}

          {/* FAQ Form */}
          {schema.type === 'FAQPage' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">FAQ - Często zadawane pytania</h2>
                <button
                  type="button"
                  onClick={() => {
                    const data = formData as FAQFormData
                    setFormData({ questions: [...data.questions, { question: '', answer: '' }] } as FormData)
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Dodaj pytanie
                </button>
              </div>
              {(formData as FAQFormData).questions.map((q, idx) => (
                <div key={idx} className="p-4 border border-gray-200 rounded-lg mb-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <input
                      type="text"
                      placeholder="Pytanie"
                      value={q.question}
                      onChange={(e) => {
                        const data = formData as FAQFormData
                        const newQ = [...data.questions]
                        newQ[idx].question = e.target.value
                        setFormData({ questions: newQ } as FormData)
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    {(formData as FAQFormData).questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const data = formData as FAQFormData
                          setFormData({ questions: data.questions.filter((_, i) => i !== idx) } as FormData)
                        }}
                        className="text-red-600 hover:text-red-700 mt-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <textarea
                    placeholder="Odpowiedź"
                    value={q.answer}
                    onChange={(e) => {
                      const data = formData as FAQFormData
                      const newQ = [...data.questions]
                      newQ[idx].answer = e.target.value
                      setFormData({ questions: newQ } as FormData)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <Link
              href={`/dashboard/projects/${projectId}/schemas`}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Anuluj
            </Link>
            <button
              type="submit"
              disabled={loading || remainingEdits === 0}
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </button>
          </div>
        </form>
      </div>
    )
}
