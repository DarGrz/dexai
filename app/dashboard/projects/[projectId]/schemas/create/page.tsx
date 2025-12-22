'use client'

import { useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'

type SchemaType = 'LocalBusiness' | 'Product' | 'FAQPage' | 'Review' | 'Article' | 'BreadcrumbList' | 'WebPage' | 'Service'

export default function CreateSchemaPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedSchemas, setSelectedSchemas] = useState<Set<SchemaType>>(new Set(['LocalBusiness']))

  // LocalBusiness
  const [localBusinessData, setLocalBusinessData] = useState({
    name: '',
    description: '',
    streetAddress: '',
    addressLocality: '',
    postalCode: '',
    telephone: '',
    email: '',
    priceRange: '',
    areaServed: '',
    includeRating: false,
    ratingValue: '5.0',
    reviewCount: '10',
    openingHours: [
      { day: 'Monday', opens: '09:00', closes: '17:00', closed: false },
      { day: 'Tuesday', opens: '09:00', closes: '17:00', closed: false },
      { day: 'Wednesday', opens: '09:00', closes: '17:00', closed: false },
      { day: 'Thursday', opens: '09:00', closes: '17:00', closed: false },
      { day: 'Friday', opens: '09:00', closes: '17:00', closed: false },
      { day: 'Saturday', opens: '10:00', closes: '14:00', closed: false },
      { day: 'Sunday', opens: '', closes: '', closed: true },
    ],
  })

  // Review
  const [reviewData, setReviewData] = useState({
    itemName: '',
    authorName: '',
    ratingValue: '5',
    reviewBody: '',
    datePublished: new Date().toISOString().split('T')[0],
  })

  // Article
  const [articleData, setArticleData] = useState({
    headline: '',
    description: '',
    url: '',
    keywords: '',
  })

  // BreadcrumbList
  const [breadcrumbData, setBreadcrumbData] = useState({
    items: [
      { name: 'Strona główna', url: '/' },
      { name: '', url: '' },
    ],
  })

  // WebPage
  const [webPageData, setWebPageData] = useState({
    name: '',
    description: '',
    url: '',
  })

  // Service
  const [serviceData, setServiceData] = useState({
    name: '',
    description: '',
    providerName: '',
    serviceType: '',
    areaServed: '',
  })

  // Product
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    brand: '',
    price: '',
    availability: 'InStock',
  })

  // FAQ
  const [faqData, setFaqData] = useState({
    questions: [
      { question: '', answer: '' }
    ],
  })

  const toggleSchema = (type: SchemaType) => {
    const newSelected = new Set(selectedSchemas)
    if (newSelected.has(type)) {
      newSelected.delete(type)
    } else {
      newSelected.add(type)
    }
    setSelectedSchemas(newSelected)
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

      const now = new Date()

      // Check existing schemas to prevent duplicates
      const { data: existingSchemas } = await supabase
        .from('schemas')
        .select('type')
        .eq('project_id', projectId)

      const existingTypes = new Set(existingSchemas?.map(s => s.type) || [])
      const duplicates = Array.from(selectedSchemas).filter(type => existingTypes.has(type))

      if (duplicates.length > 0) {
        setError(`Następujące schematy już istnieją dla tego projektu: ${duplicates.join(', ')}. Usuń istniejące lub przejdź do edycji.`)
        setLoading(false)
        return
      }

      // Check edit limit
      const { data: editCount } = await supabase
        .from('schema_edits')
        .select('*')
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
        const openingHoursSpec = localBusinessData.openingHours
          .filter(h => !h.closed)
          .map(h => ({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: h.day,
            opens: h.opens,
            closes: h.closes,
          }))

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
              addressCountry: 'PL',
            },
            telephone: localBusinessData.telephone,
            email: localBusinessData.email,
            priceRange: localBusinessData.priceRange,
            areaServed: localBusinessData.areaServed ? localBusinessData.areaServed.split(',').map(s => s.trim()).filter(s => s) : undefined,
            ...(localBusinessData.includeRating && {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: localBusinessData.ratingValue,
                bestRating: '5',
                reviewCount: localBusinessData.reviewCount,
              }
            }),
            openingHoursSpecification: openingHoursSpec,
          }
        })
      }

      if (selectedSchemas.has('Review')) {
        schemas.push({
          type: 'Review',
          json: {
            '@context': 'https://schema.org',
            '@type': 'Review',
            author: {
              '@type': 'Person',
              name: reviewData.authorName,
            },
            reviewRating: {
              '@type': 'Rating',
              ratingValue: reviewData.ratingValue,
              bestRating: '5',
              worstRating: '1',
            },
            reviewBody: reviewData.reviewBody,
            datePublished: reviewData.datePublished,
            itemReviewed: {
              '@type': 'Organization',
              name: reviewData.itemName,
            }
          }
        })
      }

      if (selectedSchemas.has('Article')) {
        schemas.push({
          type: 'Article',
          json: {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: articleData.headline,
            description: articleData.description,
            url: articleData.url,
            keywords: articleData.keywords,
            articleSection: 'Business Reviews',
            inLanguage: 'pl-PL',
            publisher: {
              '@type': 'Organization',
              name: 'DexAi',
            }
          }
        })
      }

      if (selectedSchemas.has('BreadcrumbList')) {
        schemas.push({
          type: 'BreadcrumbList',
          json: {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbData.items.filter(i => i.name && i.url).map((item, idx) => ({
              '@type': 'ListItem',
              position: idx + 1,
              name: item.name,
              item: item.url,
            }))
          }
        })
      }

      if (selectedSchemas.has('WebPage')) {
        schemas.push({
          type: 'WebPage',
          json: {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: webPageData.name,
            description: webPageData.description,
            url: webPageData.url,
            inLanguage: 'pl-PL',
          }
        })
      }

      if (selectedSchemas.has('Service')) {
        schemas.push({
          type: 'Service',
          json: {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: serviceData.name,
            description: serviceData.description,
            serviceType: serviceData.serviceType,
            provider: {
              '@type': 'Organization',
              name: serviceData.providerName,
            },
            areaServed: serviceData.areaServed,
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
            brand: { '@type': 'Brand', name: productData.brand },
            offers: {
              '@type': 'Offer',
              price: productData.price,
              priceCurrency: 'PLN',
              availability: `https://schema.org/${productData.availability}`,
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
              acceptedAnswer: { '@type': 'Answer', text: q.answer }
            }))
          }
        })
      }

      // Insert all schemas
      for (const schema of schemas) {
        await supabase.from('schemas').insert({
          project_id: projectId,
          type: schema.type,
          enabled: true,
          url_pattern: '*',
          json: schema.json,
        })

        await supabase.from('schema_edits').insert({
          user_id: user.id,
          project_id: projectId,
          action: 'create',
          month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
        })
      }

      router.push(`/dashboard/projects/${projectId}`)
    } catch (err) {
      setError('Wystąpił błąd podczas zapisywania')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href={`/dashboard/projects/${projectId}/schemas/setup`} className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block">
          ← Wstecz
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dodaj dane strukturalne</h1>
        <p className="text-gray-600">Wybierz typy schematów i wypełnij dane</p>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Schema Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Wybierz typy schematów</h2>
          <div className="space-y-3">
            {(['LocalBusiness', 'Review', 'Product', 'Service', 'FAQPage', 'Article', 'BreadcrumbList', 'WebPage'] as SchemaType[]).map(type => (
              <label key={type} className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-indigo-300 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={selectedSchemas.has(type)}
                  onChange={() => toggleSchema(type)}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{type}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* LocalBusiness Form */}
        {selectedSchemas.has('LocalBusiness') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">LocalBusiness - Dane firmy</h2>
            <div className="space-y-4">
              <input type="text" required placeholder="Nazwa firmy *" value={localBusinessData.name} onChange={(e) => setLocalBusinessData({ ...localBusinessData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              <textarea placeholder="Opis" value={localBusinessData.description} onChange={(e) => setLocalBusinessData({ ...localBusinessData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={2} />
              <input type="text" placeholder="Ulica" value={localBusinessData.streetAddress} onChange={(e) => setLocalBusinessData({ ...localBusinessData, streetAddress: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Miasto" value={localBusinessData.addressLocality} onChange={(e) => setLocalBusinessData({ ...localBusinessData, addressLocality: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                <input type="text" placeholder="Kod pocztowy" value={localBusinessData.postalCode} onChange={(e) => setLocalBusinessData({ ...localBusinessData, postalCode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="tel" placeholder="Telefon" value={localBusinessData.telephone} onChange={(e) => setLocalBusinessData({ ...localBusinessData, telephone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                <input type="email" placeholder="Email" value={localBusinessData.email} onChange={(e) => setLocalBusinessData({ ...localBusinessData, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <input type="text" placeholder="Zakres cenowy (np. $$)" value={localBusinessData.priceRange} onChange={(e) => setLocalBusinessData({ ...localBusinessData, priceRange: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              <textarea placeholder="Obszar świadczenia usług - miasta/regiony oddzielone przecinkami (np. Warszawa, Praga, Mokotów)" value={localBusinessData.areaServed} onChange={(e) => setLocalBusinessData({ ...localBusinessData, areaServed: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={2} />
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={localBusinessData.includeRating}
                    onChange={(e) => setLocalBusinessData({ ...localBusinessData, includeRating: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="font-medium text-gray-900">Dodaj łączną ocenę (AggregateRating)</span>
                </label>
                {localBusinessData.includeRating && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Średnia ocena (np. 5.0)"
                      value={localBusinessData.ratingValue}
                      onChange={(e) => setLocalBusinessData({ ...localBusinessData, ratingValue: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="number"
                      placeholder="Liczba ocen"
                      value={localBusinessData.reviewCount}
                      onChange={(e) => setLocalBusinessData({ ...localBusinessData, reviewCount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Godziny otwarcia</h3>
                <div className="space-y-2">
                  {localBusinessData.openingHours.map((hours, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <label className="flex items-center gap-2 w-32">
                        <input
                          type="checkbox"
                          checked={!hours.closed}
                          onChange={(e) => {
                            const newHours = [...localBusinessData.openingHours]
                            newHours[idx].closed = !e.target.checked
                            setLocalBusinessData({ ...localBusinessData, openingHours: newHours })
                          }}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <span className="text-sm font-medium">{hours.day === 'Monday' ? 'Pon' : hours.day === 'Tuesday' ? 'Wt' : hours.day === 'Wednesday' ? 'Śr' : hours.day === 'Thursday' ? 'Czw' : hours.day === 'Friday' ? 'Pt' : hours.day === 'Saturday' ? 'Sob' : 'Ndz'}</span>
                      </label>
                      {!hours.closed && (
                        <>
                          <input
                            type="time"
                            value={hours.opens}
                            onChange={(e) => {
                              const newHours = [...localBusinessData.openingHours]
                              newHours[idx].opens = e.target.value
                              setLocalBusinessData({ ...localBusinessData, openingHours: newHours })
                            }}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <span className="text-gray-500">-</span>
                          <input
                            type="time"
                            value={hours.closes}
                            onChange={(e) => {
                              const newHours = [...localBusinessData.openingHours]
                              newHours[idx].closes = e.target.value
                              setLocalBusinessData({ ...localBusinessData, openingHours: newHours })
                            }}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </>
                      )}
                      {hours.closed && <span className="text-sm text-gray-500">Zamknięte</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review Form */}
        {selectedSchemas.has('Review') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Review - Pojedyncza opinia</h2>
            <div className="space-y-4">
              <input type="text" required placeholder="Nazwa firmy/produktu *" value={reviewData.itemName} onChange={(e) => setReviewData({ ...reviewData, itemName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              <input type="text" required placeholder="Imię autora *" value={reviewData.authorName} onChange={(e) => setReviewData({ ...reviewData, authorName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              <div className="grid grid-cols-2 gap-4">
                <select value={reviewData.ratingValue} onChange={(e) => setReviewData({ ...reviewData, ratingValue: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="5">5 ⭐⭐⭐⭐⭐</option>
                  <option value="4">4 ⭐⭐⭐⭐</option>
                  <option value="3">3 ⭐⭐⭐</option>
                  <option value="2">2 ⭐⭐</option>
                  <option value="1">1 ⭐</option>
                </select>
                <input type="date" value={reviewData.datePublished} onChange={(e) => setReviewData({ ...reviewData, datePublished: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <textarea required placeholder="Treść opinii *" value={reviewData.reviewBody} onChange={(e) => setReviewData({ ...reviewData, reviewBody: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={4} />
            </div>
          </div>
        )}

        {/* Article Form */}
        {selectedSchemas.has('Article') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Article - Artykuł</h2>
            <div className="space-y-4">
              <input type="text" required placeholder="Tytuł artykułu *" value={articleData.headline} onChange={(e) => setArticleData({ ...articleData, headline: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              <textarea placeholder="Opis" value={articleData.description} onChange={(e) => setArticleData({ ...articleData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={2} />
              <input type="url" placeholder="URL artykułu" value={articleData.url} onChange={(e) => setArticleData({ ...articleData, url: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              <input type="text" placeholder="Słowa kluczowe (oddzielone przecinkami)" value={articleData.keywords} onChange={(e) => setArticleData({ ...articleData, keywords: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>
        )}

        {/* BreadcrumbList Form */}
        {selectedSchemas.has('BreadcrumbList') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">BreadcrumbList - Okruszki nawigacyjne</h2>
              <button type="button" onClick={() => setBreadcrumbData({ items: [...breadcrumbData.items, { name: '', url: '' }] })} className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                <Plus className="w-4 h-4" /> Dodaj poziom
              </button>
            </div>
            {breadcrumbData.items.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input type="text" placeholder="Nazwa" value={item.name} onChange={(e) => { const newItems = [...breadcrumbData.items]; newItems[idx].name = e.target.value; setBreadcrumbData({ items: newItems }) }} className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm" />
                <input type="text" placeholder="URL" value={item.url} onChange={(e) => { const newItems = [...breadcrumbData.items]; newItems[idx].url = e.target.value; setBreadcrumbData({ items: newItems }) }} className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm" />
                {breadcrumbData.items.length > 1 && (
                  <button type="button" onClick={() => setBreadcrumbData({ items: breadcrumbData.items.filter((_, i) => i !== idx) })} className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* WebPage Form */}
        {selectedSchemas.has('WebPage') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">WebPage - Strona internetowa</h2>
            <div className="space-y-4">
              <input type="text" required placeholder="Nazwa strony *" value={webPageData.name} onChange={(e) => setWebPageData({ ...webPageData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              <textarea placeholder="Opis strony" value={webPageData.description} onChange={(e) => setWebPageData({ ...webPageData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={2} />
              <input type="url" placeholder="URL strony" value={webPageData.url} onChange={(e) => setWebPageData({ ...webPageData, url: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>
        )}

        {/* Service Form */}
        {selectedSchemas.has('Service') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Service - Usługa</h2>
            <div className="space-y-4">
              <input type="text" required placeholder="Nazwa usługi *" value={serviceData.name} onChange={(e) => setServiceData({ ...serviceData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              <textarea placeholder="Opis usługi" value={serviceData.description} onChange={(e) => setServiceData({ ...serviceData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} />
              <input type="text" placeholder="Typ usługi (np. Naprawa komputerów)" value={serviceData.serviceType} onChange={(e) => setServiceData({ ...serviceData, serviceType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              <input type="text" placeholder="Nazwa dostawcy" value={serviceData.providerName} onChange={(e) => setServiceData({ ...serviceData, providerName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              <input type="text" placeholder="Obszar świadczenia (np. Warszawa)" value={serviceData.areaServed} onChange={(e) => setServiceData({ ...serviceData, areaServed: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>
        )}

        {/* Product Form */}
        {selectedSchemas.has('Product') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product - Produkt</h2>
            <div className="space-y-4">
              <input type="text" required placeholder="Nazwa produktu *" value={productData.name} onChange={(e) => setProductData({ ...productData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              <textarea placeholder="Opis produktu" value={productData.description} onChange={(e) => setProductData({ ...productData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={2} />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Marka" value={productData.brand} onChange={(e) => setProductData({ ...productData, brand: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                <input type="number" step="0.01" placeholder="Cena (PLN)" value={productData.price} onChange={(e) => setProductData({ ...productData, price: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <select value={productData.availability} onChange={(e) => setProductData({ ...productData, availability: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="InStock">Dostępny</option>
                <option value="OutOfStock">Niedostępny</option>
                <option value="PreOrder">Przedsprzedaż</option>
              </select>
            </div>
          </div>
        )}

        {/* FAQ Form */}
        {selectedSchemas.has('FAQPage') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">FAQ - Często zadawane pytania</h2>
              <button type="button" onClick={() => setFaqData({ questions: [...faqData.questions, { question: '', answer: '' }] })} className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                <Plus className="w-4 h-4" /> Dodaj pytanie
              </button>
            </div>
            {faqData.questions.map((q, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg mb-3 space-y-2">
                <div className="flex items-start gap-2">
                  <input type="text" placeholder="Pytanie" value={q.question} onChange={(e) => { const newQ = [...faqData.questions]; newQ[idx].question = e.target.value; setFaqData({ questions: newQ }) }} className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  {faqData.questions.length > 1 && (
                    <button type="button" onClick={() => setFaqData({ questions: faqData.questions.filter((_, i) => i !== idx) })} className="text-red-600 hover:text-red-700 mt-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <textarea placeholder="Odpowiedź" value={q.answer} onChange={(e) => { const newQ = [...faqData.questions]; newQ[idx].answer = e.target.value; setFaqData({ questions: newQ }) }} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" rows={2} />
              </div>
            ))}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <Link href={`/dashboard/projects/${projectId}/schemas/setup`} className="text-gray-600 hover:text-gray-900">← Anuluj</Link>
          <button type="submit" disabled={loading || selectedSchemas.size === 0} className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Zapisywanie...' : `Zapisz (${selectedSchemas.size} ${selectedSchemas.size === 1 ? 'schemat' : 'schematów'})`}
          </button>
        </div>
      </form>
    </div>
  )
}
