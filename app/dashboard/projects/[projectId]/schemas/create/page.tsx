'use client'

import { useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'

type SchemaType = 'LocalBusiness' | 'Product' | 'FAQPage' | 'Review' | 'Article' | 'BreadcrumbList' | 'WebPage' | 'Service' | 'OpenGraph' | 'AggregateRating'

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

  // Review - multiple reviews
  const [reviewsData, setReviewsData] = useState([
    {
      itemName: '',
      authorName: '',
      ratingValue: '5',
      reviewBody: '',
      datePublished: new Date().toISOString().split('T')[0],
    }
  ])

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

  // AggregateRating
  const [aggregateRatingData, setAggregateRatingData] = useState({
    itemType: 'Organization',
    itemName: '',
    ratingValue: '5.0',
    bestRating: '5',
    worstRating: '1',
    reviewCount: '10',
  })

  // OpenGraph
  const [openGraphData, setOpenGraphData] = useState({
    og_title: '',
    og_description: '',
    og_image: '',
    og_url: '',
    og_type: 'website',
    og_site_name: '',
    og_locale: 'pl_PL',
    twitter_card: 'summary_large_image',
    twitter_title: '',
    twitter_description: '',
    twitter_image: '',
    twitter_site: '',
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
            openingHoursSpecification: openingHoursSpec,
          }
        })
      }

      if (selectedSchemas.has('Review')) {
        // Create separate schema for each review
        reviewsData.forEach(review => {
          if (review.authorName && review.itemName) {
            schemas.push({
              type: 'Review',
              json: {
                '@context': 'https://schema.org',
                '@type': 'Review',
                author: {
                  '@type': 'Person',
                  name: review.authorName,
                },
                reviewRating: {
                  '@type': 'Rating',
                  ratingValue: review.ratingValue,
                  bestRating: '5',
                  worstRating: '1',
                },
                reviewBody: review.reviewBody,
                datePublished: review.datePublished,
                itemReviewed: {
                  '@type': 'Organization',
                  name: review.itemName,
                }
              }
            })
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

      if (selectedSchemas.has('OpenGraph')) {
        schemas.push({
          type: 'OpenGraph',
          json: {
            og_title: openGraphData.og_title || undefined,
            og_description: openGraphData.og_description || undefined,
            og_image: openGraphData.og_image || undefined,
            og_url: openGraphData.og_url || undefined,
            og_type: openGraphData.og_type || 'website',
            og_site_name: openGraphData.og_site_name || undefined,
            og_locale: openGraphData.og_locale || 'pl_PL',
            twitter_card: openGraphData.twitter_card || 'summary_large_image',
            twitter_title: openGraphData.twitter_title || undefined,
            twitter_description: openGraphData.twitter_description || undefined,
            twitter_image: openGraphData.twitter_image || undefined,
            twitter_site: openGraphData.twitter_site || undefined,
          }
        })
      }

      if (selectedSchemas.has('AggregateRating')) {
        schemas.push({
          type: 'AggregateRating',
          json: {
            '@context': 'https://schema.org',
            '@type': 'AggregateRating',
            ratingValue: aggregateRatingData.ratingValue,
            bestRating: aggregateRatingData.bestRating,
            worstRating: aggregateRatingData.worstRating,
            reviewCount: aggregateRatingData.reviewCount,
            itemReviewed: {
              '@type': aggregateRatingData.itemType,
              name: aggregateRatingData.itemName,
            }
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
            {(['LocalBusiness', 'Review', 'Product', 'Service', 'FAQPage', 'Article', 'BreadcrumbList', 'WebPage', 'AggregateRating', 'OpenGraph'] as SchemaType[]).map(type => (
              <label key={type} className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-indigo-300 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={selectedSchemas.has(type)}
                  onChange={() => toggleSchema(type)}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{type}</div>
                  {type === 'OpenGraph' && <div className="text-xs text-gray-500">Meta tagi dla social media</div>}
                  {type === 'AggregateRating' && <div className="text-xs text-gray-500">Łączna ocena dla usługi/produktu</div>}
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Review - Opinie klientów</h2>
              <button
                type="button"
                onClick={() => setReviewsData([...reviewsData, {
                  itemName: '',
                  authorName: '',
                  ratingValue: '5',
                  reviewBody: '',
                  datePublished: new Date().toISOString().split('T')[0],
                }])}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" />
                Dodaj opinię
              </button>
            </div>
            <div className="space-y-6">
              {reviewsData.map((review, idx) => (
                <div key={idx} className="p-4 border border-gray-200 rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">Opinia #{idx + 1}</h3>
                    {reviewsData.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setReviewsData(reviewsData.filter((_, i) => i !== idx))}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Nazwa firmy/produktu *"
                    value={review.itemName}
                    onChange={(e) => {
                      const newReviews = [...reviewsData]
                      newReviews[idx].itemName = e.target.value
                      setReviewsData(newReviews)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Imię autora *"
                    value={review.authorName}
                    onChange={(e) => {
                      const newReviews = [...reviewsData]
                      newReviews[idx].authorName = e.target.value
                      setReviewsData(newReviews)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={review.ratingValue}
                      onChange={(e) => {
                        const newReviews = [...reviewsData]
                        newReviews[idx].ratingValue = e.target.value
                        setReviewsData(newReviews)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="5">5 ⭐⭐⭐⭐⭐</option>
                      <option value="4">4 ⭐⭐⭐⭐</option>
                      <option value="3">3 ⭐⭐⭐</option>
                      <option value="2">2 ⭐⭐</option>
                      <option value="1">1 ⭐</option>
                    </select>
                    <input
                      type="date"
                      value={review.datePublished}
                      onChange={(e) => {
                        const newReviews = [...reviewsData]
                        newReviews[idx].datePublished = e.target.value
                        setReviewsData(newReviews)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <textarea
                    placeholder="Treść opinii *"
                    value={review.reviewBody}
                    onChange={(e) => {
                      const newReviews = [...reviewsData]
                      newReviews[idx].reviewBody = e.target.value
                      setReviewsData(newReviews)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={4}
                  />
                </div>
              ))}
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

        {/* AggregateRating Form */}
        {selectedSchemas.has('AggregateRating') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">AggregateRating - Łączna ocena</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Typ ocenianego obiektu</label>
                  <select value={aggregateRatingData.itemType} onChange={(e) => setAggregateRatingData({ ...aggregateRatingData, itemType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="Organization">Organizacja</option>
                    <option value="LocalBusiness">Firma lokalna</option>
                    <option value="Product">Produkt</option>
                    <option value="Service">Usługa</option>
                  </select>
                </div>
                <input type="text" required placeholder="Nazwa ocenianego obiektu *" value={aggregateRatingData.itemName} onChange={(e) => setAggregateRatingData({ ...aggregateRatingData, itemName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Średnia ocena</label>
                  <input type="number" step="0.1" min="0" placeholder="np. 4.8" value={aggregateRatingData.ratingValue} onChange={(e) => setAggregateRatingData({ ...aggregateRatingData, ratingValue: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Najlepsza ocena</label>
                  <input type="number" placeholder="np. 5" value={aggregateRatingData.bestRating} onChange={(e) => setAggregateRatingData({ ...aggregateRatingData, bestRating: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Najgorsza ocena</label>
                  <input type="number" placeholder="np. 1" value={aggregateRatingData.worstRating} onChange={(e) => setAggregateRatingData({ ...aggregateRatingData, worstRating: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Liczba ocen</label>
                <input type="number" min="1" placeholder="np. 127" value={aggregateRatingData.reviewCount} onChange={(e) => setAggregateRatingData({ ...aggregateRatingData, reviewCount: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
            </div>
          </div>
        )}

        {/* OpenGraph Form */}
        {selectedSchemas.has('OpenGraph') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Open Graph - Meta tagi dla social media</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Open Graph</h3>
                <div className="space-y-3">
                  <input type="text" placeholder="Tytuł (og:title)" value={openGraphData.og_title} onChange={(e) => setOpenGraphData({ ...openGraphData, og_title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  <textarea placeholder="Opis (og:description)" value={openGraphData.og_description} onChange={(e) => setOpenGraphData({ ...openGraphData, og_description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={2} />
                  <input type="url" placeholder="URL obrazka (og:image)" value={openGraphData.og_image} onChange={(e) => setOpenGraphData({ ...openGraphData, og_image: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  <input type="url" placeholder="URL strony (og:url)" value={openGraphData.og_url} onChange={(e) => setOpenGraphData({ ...openGraphData, og_url: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  <div className="grid grid-cols-2 gap-4">
                    <select value={openGraphData.og_type} onChange={(e) => setOpenGraphData({ ...openGraphData, og_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option value="website">Website</option>
                      <option value="article">Article</option>
                      <option value="product">Product</option>
                    </select>
                    <input type="text" placeholder="Nazwa witryny (og:site_name)" value={openGraphData.og_site_name} onChange={(e) => setOpenGraphData({ ...openGraphData, og_site_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Twitter Card</h3>
                <div className="space-y-3">
                  <select value={openGraphData.twitter_card} onChange={(e) => setOpenGraphData({ ...openGraphData, twitter_card: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="summary">Summary</option>
                    <option value="summary_large_image">Summary Large Image</option>
                    <option value="app">App</option>
                    <option value="player">Player</option>
                  </select>
                  <input type="text" placeholder="Tytuł Twitter (opcjonalne)" value={openGraphData.twitter_title} onChange={(e) => setOpenGraphData({ ...openGraphData, twitter_title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  <textarea placeholder="Opis Twitter (opcjonalne)" value={openGraphData.twitter_description} onChange={(e) => setOpenGraphData({ ...openGraphData, twitter_description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={2} />
                  <input type="url" placeholder="URL obrazka Twitter (opcjonalne)" value={openGraphData.twitter_image} onChange={(e) => setOpenGraphData({ ...openGraphData, twitter_image: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  <input type="text" placeholder="@handle Twitter (np. @twojastrona)" value={openGraphData.twitter_site} onChange={(e) => setOpenGraphData({ ...openGraphData, twitter_site: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
              </div>
            </div>
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
