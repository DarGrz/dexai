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
  areaServed: string
  includeRating: boolean
  ratingValue: string
  reviewCount: string
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
}

type ReviewFormData = {
  itemName: string
  authorName: string
  ratingValue: string
  reviewBody: string
  datePublished: string
}

type ArticleFormData = {
  headline: string
  description: string
  url: string
  keywords: string
}

type BreadcrumbFormData = {
  items: Array<{
    name: string
    url: string
  }>
}

type WebPageFormData = {
  name: string
  description: string
  url: string
}

type ServiceFormData = {
  name: string
  description: string
  serviceType: string
  providerName: string
  areaServed: string
  includeRating: boolean
  ratingValue: string
  reviewCount: string
}

type ProductFormData = {
  name: string
  description: string
  brand: string
  price: string
  availability: string
  includeRating: boolean
  ratingValue: string
  reviewCount: string
}

type FAQFormData = {
  questions: Array<{
    question: string
    answer: string
  }>
}

type OpenGraphFormData = {
  og_title: string
  og_description: string
  og_image: string
  og_url: string
  og_type: string
  og_site_name: string
  og_locale: string
  twitter_card: string
  twitter_title: string
  twitter_description: string
  twitter_image: string
  twitter_site: string
}

type FormData = LocalBusinessFormData | AggregateRatingFormData | ReviewFormData | ArticleFormData | BreadcrumbFormData | WebPageFormData | ServiceFormData | ProductFormData | FAQFormData | OpenGraphFormData

export function EditSchemaForm({ 
  schema, 
  projectId,
  remainingEdits,
  maxEditsPerMonth
}: { 
  schema: SchemaData
  projectId: string
  remainingEdits: number
  maxEditsPerMonth: number
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
        const existing = existingHours.find((h: any) => {
          const dayValue = h.dayOfWeek
          // Obsługa formatu http://schema.org/Monday
          if (typeof dayValue === 'string') {
            const normalizedDay = dayValue.replace('http://schema.org/', '')
            return normalizedDay === day
          }
          // Obsługa tablicy
          if (Array.isArray(dayValue)) {
            return dayValue.some((d: string) => d.replace('http://schema.org/', '') === day)
          }
          return dayValue === day
        })
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
        areaServed: Array.isArray(jsonData.areaServed) ? jsonData.areaServed.join(', ') : (jsonData.areaServed || ''),
        includeRating: jsonData.aggregateRating !== undefined ? !!jsonData.aggregateRating : true,
        ratingValue: jsonData.aggregateRating?.ratingValue || '5.0',
        reviewCount: jsonData.aggregateRating?.reviewCount || '10',
        openingHours,
      }
    } else if (schema.type === 'AggregateRating') {
      return {
        itemName: jsonData.name || '',
        ratingValue: jsonData.aggregateRating?.ratingValue || '4.8',
        ratingCount: jsonData.aggregateRating?.ratingCount || '10',
      }
    } else if (schema.type === 'Review') {
      return {
        itemName: jsonData.itemReviewed?.name || '',
        authorName: jsonData.author?.name || '',
        ratingValue: jsonData.reviewRating?.ratingValue || '5',
        reviewBody: jsonData.reviewBody || '',
        datePublished: jsonData.datePublished || new Date().toISOString().split('T')[0],
      }
    } else if (schema.type === 'Article') {
      return {
        headline: jsonData.headline || '',
        description: jsonData.description || '',
        url: jsonData.url || '',
        keywords: jsonData.keywords || '',
      }
    } else if (schema.type === 'BreadcrumbList') {
      return {
        items: jsonData.itemListElement?.map((item: any) => ({
          name: item.name || '',
          url: item.item || '',
        })) || [{ name: 'Strona główna', url: '/' }],
      }
    } else if (schema.type === 'WebPage') {
      return {
        name: jsonData.name || '',
        description: jsonData.description || '',
        url: jsonData.url || '',
      }
    } else if (schema.type === 'Service') {
      return {
        name: jsonData.name || '',
        description: jsonData.description || '',
        serviceType: jsonData.serviceType || '',
        providerName: jsonData.provider?.name || '',
        areaServed: jsonData.areaServed || '',
        includeRating: jsonData.aggregateRating !== undefined ? !!jsonData.aggregateRating : true,
        ratingValue: jsonData.aggregateRating?.ratingValue || '5.0',
        reviewCount: jsonData.aggregateRating?.reviewCount || '10',
      }
    } else if (schema.type === 'Product') {
      return {
        name: jsonData.name || '',
        description: jsonData.description || '',
        brand: jsonData.brand?.name || '',
        price: jsonData.offers?.price || '',
        availability: jsonData.offers?.availability?.split('/').pop() || 'InStock',
        includeRating: jsonData.aggregateRating !== undefined ? !!jsonData.aggregateRating : true,
        ratingValue: jsonData.aggregateRating?.ratingValue || '5.0',
        reviewCount: jsonData.aggregateRating?.reviewCount || '10',
      }
    } else if (schema.type === 'FAQPage') {
      return {
        questions: jsonData.mainEntity?.map((q: any) => ({
          question: q.name || '',
          answer: q.acceptedAnswer?.text || '',
        })) || [{ question: '', answer: '' }]
      }
    } else if (schema.type === 'OpenGraph') {
      return {
        og_title: jsonData.og_title || '',
        og_description: jsonData.og_description || '',
        og_image: jsonData.og_image || '',
        og_url: jsonData.og_url || '',
        og_type: jsonData.og_type || 'website',
        og_site_name: jsonData.og_site_name || '',
        og_locale: jsonData.og_locale || 'pl_PL',
        twitter_card: jsonData.twitter_card || 'summary_large_image',
        twitter_title: jsonData.twitter_title || '',
        twitter_description: jsonData.twitter_description || '',
        twitter_image: jsonData.twitter_image || '',
        twitter_site: jsonData.twitter_site || '',
      }
    }
    
    return { name: '', description: '', street: '', city: '', postalCode: '', phone: '', email: '', priceRange: '', areaServed: '', includeRating: true, ratingValue: '5.0', reviewCount: '10', openingHours: [] }
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (remainingEdits === 0) {
      setError(`Osiągnięto limit edycji w tym miesiącu (${maxEditsPerMonth}/${maxEditsPerMonth})`)
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
            dayOfWeek: `http://schema.org/${h.day}`,
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
          areaServed: data.areaServed ? data.areaServed.split(',').map(s => s.trim()).filter(s => s) : undefined,
          ...(data.includeRating && {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: data.ratingValue,
              bestRating: '5',
              reviewCount: data.reviewCount,
            }
          }),
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
        }
      } else if (schema.type === 'Review') {
        const data = formData as ReviewFormData
        updatedJsonData = {
          '@context': 'https://schema.org',
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: data.authorName,
          },
          reviewRating: {
            '@type': 'Rating',
            ratingValue: data.ratingValue,
            bestRating: '5',
            worstRating: '1',
          },
          reviewBody: data.reviewBody,
          datePublished: data.datePublished,
          itemReviewed: {
            '@type': 'Organization',
            name: data.itemName,
          }
        }
      } else if (schema.type === 'Article') {
        const data = formData as ArticleFormData
        updatedJsonData = {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: data.headline,
          description: data.description,
          url: data.url,
          keywords: data.keywords,
          articleSection: 'Business Reviews',
          inLanguage: 'pl-PL',
          publisher: {
            '@type': 'Organization',
            name: 'DexAi',
          }
        }
      } else if (schema.type === 'BreadcrumbList') {
        const data = formData as BreadcrumbFormData
        updatedJsonData = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: data.items.filter(i => i.name && i.url).map((item, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: item.name,
            item: item.url,
          }))
        }
      } else if (schema.type === 'WebPage') {
        const data = formData as WebPageFormData
        updatedJsonData = {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: data.name,
          description: data.description,
          url: data.url,
          inLanguage: 'pl-PL',
        }
      } else if (schema.type === 'Service') {
        const data = formData as ServiceFormData
        updatedJsonData = {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: data.name,
          description: data.description,
          serviceType: data.serviceType,
          provider: {
            '@type': 'Organization',
            name: data.providerName,
          },
          areaServed: data.areaServed,
        }
        
        if (data.includeRating) {
          updatedJsonData.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: data.ratingValue,
            reviewCount: data.reviewCount,
          }
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
        
        if (data.includeRating) {
          updatedJsonData.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: data.ratingValue,
            reviewCount: data.reviewCount,
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
      } else if (schema.type === 'OpenGraph') {
        const data = formData as OpenGraphFormData
        updatedJsonData = {
          og_title: data.og_title || undefined,
          og_description: data.og_description || undefined,
          og_image: data.og_image || undefined,
          og_url: data.og_url || undefined,
          og_type: data.og_type || 'website',
          og_site_name: data.og_site_name || undefined,
          og_locale: data.og_locale || 'pl_PL',
          twitter_card: data.twitter_card || 'summary_large_image',
          twitter_title: data.twitter_title || undefined,
          twitter_description: data.twitter_description || undefined,
          twitter_image: data.twitter_image || undefined,
          twitter_site: data.twitter_site || undefined,
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

      // Redirect back to project page
      router.push(`/dashboard/projects/${projectId}`)
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
          href={`/dashboard/projects/${projectId}`}
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
                <div>
                  <textarea
                    value={(formData as LocalBusinessFormData).areaServed}
                    onChange={(e) => setFormData({ ...formData, areaServed: e.target.value } as FormData)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Obszar świadczenia usług - miasta/regiony oddzielone przecinkami (np. Warszawa, Praga, Mokotów)"
                    rows={2}
                  />
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <label className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={(formData as LocalBusinessFormData).includeRating}
                      onChange={(e) => setFormData({ ...formData, includeRating: e.target.checked } as FormData)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="font-medium text-gray-900">Łączna ocena</span>
                  </label>
                  <p className="text-sm text-gray-600 mb-4 ml-6">Dodaj średnią ocenę i liczbę opinii - zwiększa zaufanie klientów i poprawia widoczność w wyszukiwarkach</p>
                  {(formData as LocalBusinessFormData).includeRating && (
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Średnia ocena (np. 5.0)"
                        value={(formData as LocalBusinessFormData).ratingValue}
                        onChange={(e) => setFormData({ ...formData, ratingValue: e.target.value } as FormData)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                      <input
                        type="number"
                        placeholder="Liczba ocen"
                        value={(formData as LocalBusinessFormData).reviewCount}
                        onChange={(e) => setFormData({ ...formData, reviewCount: e.target.value } as FormData)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  )}
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
                            disabled={hours.opens === '00:00' && hours.closes === '23:59'}
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
                            disabled={hours.opens === '00:00' && hours.closes === '23:59'}
                          />
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={hours.opens === '00:00' && hours.closes === '23:59'}
                              onChange={(e) => {
                                const data = formData as LocalBusinessFormData
                                const newHours = [...data.openingHours]
                                if (e.target.checked) {
                                  newHours[idx].opens = '00:00'
                                  newHours[idx].closes = '23:59'
                                } else {
                                  newHours[idx].opens = '09:00'
                                  newHours[idx].closes = '17:00'
                                }
                                setFormData({ ...formData, openingHours: newHours } as FormData)
                              }}
                              className="w-4 h-4 text-[#0375FF] rounded"
                            />
                            <span className="text-sm font-medium text-gray-700">Otwarte 24h</span>
                          </label>
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4">AggregateRating - Łączna ocena</h2>
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
                  <p className="text-sm text-gray-500">💡 Dodaj pojedyncze opinie używając typu &quot;Review&quot;</p>
                </div>
              </div>
            </>
          )}

          {/* Review Form */}
          {schema.type === 'Review' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Review - Pojedyncza opinia</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Nazwa firmy/produktu *"
                  value={(formData as ReviewFormData).itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value } as FormData)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  required
                  placeholder="Imię autora *"
                  value={(formData as ReviewFormData).authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value } as FormData)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={(formData as ReviewFormData).ratingValue}
                    onChange={(e) => setFormData({ ...formData, ratingValue: e.target.value } as FormData)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="5">5 ⭐⭐⭐⭐⭐</option>
                    <option value="4">4 ⭐⭐⭐⭐</option>
                    <option value="3">3 ⭐⭐⭐</option>
                    <option value="2">2 ⭐⭐</option>
                    <option value="1">1 ⭐</option>
                  </select>
                  <input
                    type="date"
                    value={(formData as ReviewFormData).datePublished}
                    onChange={(e) => setFormData({ ...formData, datePublished: e.target.value } as FormData)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <textarea
                  required
                  placeholder="Treść opinii *"
                  value={(formData as ReviewFormData).reviewBody}
                  onChange={(e) => setFormData({ ...formData, reviewBody: e.target.value } as FormData)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Article Form */}
          {schema.type === 'Article' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Article - Artykuł</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Tytuł artykułu *"
                  value={(formData as ArticleFormData).headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value } as FormData)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
                <textarea
                  placeholder="Opis"
                  value={(formData as ArticleFormData).description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value } as FormData)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  rows={2}
                />
                <input
                  type="url"
                  placeholder="URL artykułu"
                  value={(formData as ArticleFormData).url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value } as FormData)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Słowa kluczowe (oddzielone przecinkami)"
                  value={(formData as ArticleFormData).keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value } as FormData)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          )}

          {/* BreadcrumbList Form */}
          {schema.type === 'BreadcrumbList' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">BreadcrumbList - Okruszki nawigacyjne</h2>
                <button
                  type="button"
                  onClick={() => {
                    const data = formData as BreadcrumbFormData
                    setFormData({ items: [...data.items, { name: '', url: '' }] } as FormData)
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Dodaj poziom
                </button>
              </div>
              {(formData as BreadcrumbFormData).items.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Nazwa"
                    value={item.name}
                    onChange={(e) => {
                      const data = formData as BreadcrumbFormData
                      const newItems = [...data.items]
                      newItems[idx].name = e.target.value
                      setFormData({ items: newItems } as FormData)
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="text"
                    placeholder="URL"
                    value={item.url}
                    onChange={(e) => {
                      const data = formData as BreadcrumbFormData
                      const newItems = [...data.items]
                      newItems[idx].url = e.target.value
                      setFormData({ items: newItems } as FormData)
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  {(formData as BreadcrumbFormData).items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const data = formData as BreadcrumbFormData
                        setFormData({ items: data.items.filter((_, i) => i !== idx) } as FormData)
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* WebPage Form */}
          {schema.type === 'WebPage' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">WebPage - Strona internetowa</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Nazwa strony *"
                  value={(formData as WebPageFormData).name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value } as FormData)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
                <textarea
                  placeholder="Opis strony"
                  value={(formData as WebPageFormData).description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value } as FormData)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  rows={2}
                />
                <input
                  type="url"
                  placeholder="URL strony"
                  value={(formData as WebPageFormData).url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value } as FormData)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          )}

          {/* Service Form */}
          {schema.type === 'Service' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Service - Usługa</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Nazwa usługi *"
                  value={(formData as ServiceFormData).name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value } as FormData)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
                <textarea
                  placeholder="Opis usługi"
                  value={(formData as ServiceFormData).description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value } as FormData)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
                <input
                  type="text"
                  placeholder="Typ usługi (np. Naprawa komputerów)"
                  value={(formData as ServiceFormData).serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value } as FormData)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Nazwa dostawcy"
                  value={(formData as ServiceFormData).providerName}
                  onChange={(e) => setFormData({ ...formData, providerName: e.target.value } as FormData)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Obszar świadczenia (np. Warszawa)"
                  value={(formData as ServiceFormData).areaServed}
                  onChange={(e) => setFormData({ ...formData, areaServed: e.target.value } as FormData)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
                
                <div className="pt-4 border-t border-gray-200">
                  <label className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={(formData as ServiceFormData).includeRating}
                      onChange={(e) => setFormData({ ...formData, includeRating: e.target.checked } as FormData)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="font-medium text-gray-900">Łączna ocena</span>
                  </label>
                  <p className="text-sm text-gray-600 mb-4 ml-6">Dodaj średnią ocenę i liczbę opinii - zwiększa zaufanie klientów i poprawia widoczność w wyszukiwarkach</p>
                  {(formData as ServiceFormData).includeRating && (
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Średnia ocena (np. 5.0)"
                        value={(formData as ServiceFormData).ratingValue}
                        onChange={(e) => setFormData({ ...formData, ratingValue: e.target.value } as FormData)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                      <input
                        type="number"
                        placeholder="Liczba ocen"
                        value={(formData as ServiceFormData).reviewCount}
                        onChange={(e) => setFormData({ ...formData, reviewCount: e.target.value } as FormData)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
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
                
                <div className="pt-4 border-t border-gray-200">
                  <label className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={(formData as ProductFormData).includeRating}
                      onChange={(e) => setFormData({ ...formData, includeRating: e.target.checked } as FormData)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="font-medium text-gray-900">Łączna ocena</span>
                  </label>
                  <p className="text-sm text-gray-600 mb-4 ml-6">Dodaj średnią ocenę i liczbę opinii - zwiększa zaufanie klientów i poprawia widoczność w wyszukiwarkach</p>
                  {(formData as ProductFormData).includeRating && (
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Średnia ocena (np. 5.0)"
                        value={(formData as ProductFormData).ratingValue}
                        onChange={(e) => setFormData({ ...formData, ratingValue: e.target.value } as FormData)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                      <input
                        type="number"
                        placeholder="Liczba ocen"
                        value={(formData as ProductFormData).reviewCount}
                        onChange={(e) => setFormData({ ...formData, reviewCount: e.target.value } as FormData)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  )}
                </div>
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

          {/* OpenGraph Form */}
          {schema.type === 'OpenGraph' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Open Graph</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Tytuł (og:title)"
                    value={(formData as OpenGraphFormData).og_title}
                    onChange={(e) => setFormData({ ...(formData as OpenGraphFormData), og_title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <textarea
                    placeholder="Opis (og:description)"
                    value={(formData as OpenGraphFormData).og_description}
                    onChange={(e) => setFormData({ ...(formData as OpenGraphFormData), og_description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                  <input
                    type="url"
                    placeholder="URL obrazka (og:image)"
                    value={(formData as OpenGraphFormData).og_image}
                    onChange={(e) => setFormData({ ...(formData as OpenGraphFormData), og_image: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="url"
                    placeholder="URL strony (og:url)"
                    value={(formData as OpenGraphFormData).og_url}
                    onChange={(e) => setFormData({ ...(formData as OpenGraphFormData), og_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={(formData as OpenGraphFormData).og_type}
                      onChange={(e) => setFormData({ ...(formData as OpenGraphFormData), og_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="website">Website</option>
                      <option value="article">Article</option>
                      <option value="product">Product</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Nazwa witryny (og:site_name)"
                      value={(formData as OpenGraphFormData).og_site_name}
                      onChange={(e) => setFormData({ ...(formData as OpenGraphFormData), og_site_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <select
                    value={(formData as OpenGraphFormData).og_locale}
                    onChange={(e) => setFormData({ ...(formData as OpenGraphFormData), og_locale: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="pl_PL">Polski (pl_PL)</option>
                    <option value="en_US">English (en_US)</option>
                    <option value="en_GB">English UK (en_GB)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Twitter Card</h3>
                <div className="space-y-3">
                  <select
                    value={(formData as OpenGraphFormData).twitter_card}
                    onChange={(e) => setFormData({ ...(formData as OpenGraphFormData), twitter_card: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="summary">Summary</option>
                    <option value="summary_large_image">Summary Large Image</option>
                    <option value="app">App</option>
                    <option value="player">Player</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Tytuł Twitter (opcjonalne)"
                    value={(formData as OpenGraphFormData).twitter_title}
                    onChange={(e) => setFormData({ ...(formData as OpenGraphFormData), twitter_title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <textarea
                    placeholder="Opis Twitter (opcjonalne)"
                    value={(formData as OpenGraphFormData).twitter_description}
                    onChange={(e) => setFormData({ ...(formData as OpenGraphFormData), twitter_description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                  <input
                    type="url"
                    placeholder="URL obrazka Twitter (opcjonalne)"
                    value={(formData as OpenGraphFormData).twitter_image}
                    onChange={(e) => setFormData({ ...(formData as OpenGraphFormData), twitter_image: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="@handle Twitter (np. @twojastrona)"
                    value={(formData as OpenGraphFormData).twitter_site}
                    onChange={(e) => setFormData({ ...(formData as OpenGraphFormData), twitter_site: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <Link
              href={`/dashboard/projects/${projectId}`}
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
