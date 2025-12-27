'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Check, Info, Plus, Trash2 } from 'lucide-react'
import { getSchemaLabel } from '@/lib/schema-labels'

// Typy schematów pogrupowane według branży
const SCHEMA_GROUPS: Record<string, string[]> = {
  medical: ['MedicalOrganization', 'Physician', 'Dentist', 'Hospital', 'Pharmacy'],
  hotel: ['Hotel', 'LodgingBusiness'],
  automotive: ['AutoRepair', 'AutoDealer'],
  finance: ['FinancialService', 'BankOrCreditUnion', 'InsuranceAgency'],
  local_services: ['LocalBusiness'],
  ecommerce: ['Product', 'Store'],
  restaurant: ['Restaurant'],
  real_estate: ['RealEstateAgent'],
  education: ['EducationalOrganization', 'School', 'CollegeOrUniversity', 'Course'],
  legal: ['LawFirm', 'Attorney'],
  fitness: ['SportsActivityLocation', 'HealthAndBeautyBusiness'],
  beauty: ['BeautySalon', 'HairSalon', 'DaySpa'],
  entertainment: ['Event'],
  technology: ['Organization'],
  other: ['Organization', 'LocalBusiness'],
}

// Wspólne schematy dla wszystkich branż
const COMMON_SCHEMAS = ['Service', 'AggregateRating', 'Review', 'FAQPage', 'ContactPoint', 'OpeningHoursSpecification']

type Step = 'select' | 'business-info' | 'hours' | 'contact' | 'reviews' | 'faq' | 'summary'

export default function SchemaWizardPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const industry = searchParams.get('industry') || 'other'

  const [currentStep, setCurrentStep] = useState<Step>('select')
  const [selectedSchemas, setSelectedSchemas] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [businessProfile, setBusinessProfile] = useState<any>(null)

  // Dane formularzy
  const [businessData, setBusinessData] = useState({
    name: '',
    description: '',
    businessType: SCHEMA_GROUPS[industry]?.[0] || 'Organization',
    streetAddress: '',
    addressLocality: '',
    postalCode: '',
    telephone: '',
    email: '',
    website: '',
    priceRange: '',
    areaServed: '',
  })

  // Fetch business profile and auto-fill
  useEffect(() => {
    async function fetchBusinessProfile() {
      const supabase = createClient()
      const { data } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('project_id', projectId)
        .single()

      if (data) {
        setBusinessProfile(data)
        // Auto-fill business data
        setBusinessData(prev => ({
          ...prev,
          name: data.business_name || prev.name,
          description: data.description || prev.description,
          streetAddress: data.street_address || prev.streetAddress,
          addressLocality: data.address_locality || prev.addressLocality,
          postalCode: data.postal_code || prev.postalCode,
          telephone: data.phone || prev.telephone,
          email: data.email || prev.email,
          website: data.website || prev.website,
          priceRange: data.price_range || prev.priceRange,
        }))

        // Auto-fill contact data
        setContactData(prev => ({
          ...prev,
          telephone: data.phone || prev.telephone,
          email: data.email || prev.email,
        }))
      }
    }
    fetchBusinessProfile()
  }, [projectId])

  const [hoursData, setHoursData] = useState([
    { day: 'Poniedziałek', opens: '09:00', closes: '17:00', closed: false },
    { day: 'Wtorek', opens: '09:00', closes: '17:00', closed: false },
    { day: 'Środa', opens: '09:00', closes: '17:00', closed: false },
    { day: 'Czwartek', opens: '09:00', closes: '17:00', closed: false },
    { day: 'Piątek', opens: '09:00', closes: '17:00', closed: false },
    { day: 'Sobota', opens: '10:00', closes: '14:00', closed: false },
    { day: 'Niedziela', opens: '', closes: '', closed: true },
  ])

  const [contactData, setContactData] = useState({
    contactType: 'customer service',
    telephone: '',
    email: '',
    availableLanguage: 'Polish',
  })

  const [reviewsData, setReviewsData] = useState([
    { author: '', rating: '5', text: '', date: new Date().toISOString().split('T')[0] }
  ])

  const [faqData, setFaqData] = useState([
    { question: '', answer: '' }
  ])

  const [aggregateRating, setAggregateRating] = useState({
    ratingValue: '4.8',
    bestRating: '5',
    reviewCount: '50',
  })

  useEffect(() => {
    // Automatycznie zaznacz główny schemat branży
    const mainSchemas = SCHEMA_GROUPS[industry] || ['Organization']
    setSelectedSchemas(new Set([mainSchemas[0]]))
  }, [industry])

  // Automatyczne pomijanie kroków dla niewywołanych schematów
  useEffect(() => {
    if (currentStep === 'contact' && !selectedSchemas.has('ContactPoint')) {
      nextStep()
    }
    if (currentStep === 'reviews' && !selectedSchemas.has('Review') && !selectedSchemas.has('AggregateRating')) {
      nextStep()
    }
    if (currentStep === 'faq' && !selectedSchemas.has('FAQPage')) {
      nextStep()
    }
  }, [currentStep, selectedSchemas])

  const steps: Step[] = ['select', 'business-info', 'hours', 'contact', 'reviews', 'faq', 'summary']
  const stepIndex = steps.indexOf(currentStep)

  const nextStep = () => {
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1])
    }
  }

  const prevStep = () => {
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1])
    }
  }

  const handleSubmit = async () => {
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

      // Generuj schematy
      const schemas = []

      // Główny schemat biznesowy
      if (selectedSchemas.has(businessData.businessType)) {
        const openingHours = hoursData
          .filter(h => !h.closed)
          .map(h => ({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: h.day,
            opens: h.opens,
            closes: h.closes,
          }))

        schemas.push({
          project_id: projectId,
          type: businessData.businessType,
          enabled: true,
          url_pattern: '*',
          json: {
            '@context': 'https://schema.org',
            '@type': businessData.businessType,
            name: businessData.name,
            description: businessData.description,
            address: {
              '@type': 'PostalAddress',
              streetAddress: businessData.streetAddress,
              addressLocality: businessData.addressLocality,
              postalCode: businessData.postalCode,
              addressCountry: 'PL',
            },
            telephone: businessData.telephone,
            email: businessData.email,
            url: businessData.website,
            priceRange: businessData.priceRange,
            areaServed: businessData.areaServed,
            openingHoursSpecification: openingHours.length > 0 ? openingHours : undefined,
          }
        })
      }

      // AggregateRating
      if (selectedSchemas.has('AggregateRating')) {
        schemas.push({
          project_id: projectId,
          type: 'AggregateRating',
          enabled: true,
          url_pattern: '*',
          json: {
            '@context': 'https://schema.org',
            '@type': 'AggregateRating',
            itemReviewed: {
              '@type': businessData.businessType,
              name: businessData.name,
            },
            ratingValue: aggregateRating.ratingValue,
            bestRating: aggregateRating.bestRating,
            reviewCount: aggregateRating.reviewCount,
          }
        })
      }

      // Reviews
      if (selectedSchemas.has('Review')) {
        reviewsData.forEach((review, idx) => {
          if (review.author && review.text) {
            schemas.push({
              project_id: projectId,
              type: 'Review',
              enabled: true,
              url_pattern: '*',
              json: {
                '@context': 'https://schema.org',
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
                itemReviewed: {
                  '@type': businessData.businessType,
                  name: businessData.name,
                }
              }
            })
          }
        })
      }

      // FAQPage
      if (selectedSchemas.has('FAQPage')) {
        const validQuestions = faqData.filter(f => f.question && f.answer)
        if (validQuestions.length > 0) {
          schemas.push({
            project_id: projectId,
            type: 'FAQPage',
            enabled: true,
            url_pattern: '*',
            json: {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: validQuestions.map(f => ({
                '@type': 'Question',
                name: f.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: f.answer,
                }
              }))
            }
          })
        }
      }

      // ContactPoint
      if (selectedSchemas.has('ContactPoint')) {
        schemas.push({
          project_id: projectId,
          type: 'ContactPoint',
          enabled: true,
          url_pattern: '*',
          json: {
            '@context': 'https://schema.org',
            '@type': 'ContactPoint',
            contactType: contactData.contactType,
            telephone: contactData.telephone || businessData.telephone,
            email: contactData.email || businessData.email,
            availableLanguage: contactData.availableLanguage,
          }
        })
      }

      // Zapisz wszystkie schematy
      const { error: insertError } = await supabase
        .from('schemas')
        .insert(schemas)

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }

      // Zapisz edycje
      const edits = schemas.map(s => ({
        user_id: user.id,
        project_id: projectId,
        action: 'create',
      }))

      await supabase.from('schema_edits').insert(edits)

      // Sukces - przekieruj
      router.push(`/dashboard/projects/${projectId}/schemas`)
    } catch (err) {
      setError('Wystąpił błąd podczas tworzenia schematów')
      setLoading(false)
    }
  }

  const toggleSchema = (schema: string) => {
    const newSet = new Set(selectedSchemas)
    if (newSet.has(schema)) {
      newSet.delete(schema)
    } else {
      newSet.add(schema)
    }
    setSelectedSchemas(newSet)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <Link href={`/dashboard/projects/${projectId}`} className="text-sm text-gray-600 hover:text-gray-900">
            ← Powrót
          </Link>
          <span className="text-sm text-gray-600">
            Krok {stepIndex + 1} z {steps.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-emerald-600 to-teal-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Step: Wybór schematów */}
      {currentStep === 'select' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Wybierz informacje do uzupełnienia
          </h2>
          <p className="text-gray-600 mb-6">
            Zaznacz sekcje, które chcesz wypełnić. Zalecamy wszystkie dla maksymalnej widoczności.
          </p>

          <div className="space-y-6">
            {/* Główny schemat branży */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Typ działalności</h3>
              <div className="space-y-2">
                {(SCHEMA_GROUPS[industry] || ['Organization']).map(schema => (
                  <label key={schema} className="flex items-start space-x-3 p-3 border-2 border-emerald-200 bg-emerald-50 rounded-lg cursor-pointer">
                    <input
                      type="radio"
                      checked={businessData.businessType === schema}
                      onChange={() => {
                        setBusinessData({ ...businessData, businessType: schema })
                        setSelectedSchemas(new Set([schema, ...Array.from(selectedSchemas).filter(s => s !== businessData.businessType)]))
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{getSchemaLabel(schema)}</div>
                      <div className="text-sm text-gray-600">Rekomendowane dla Twojej branży</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Wspólne schematy */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Dodatkowe informacje</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {COMMON_SCHEMAS.map(schema => (
                  <label key={schema} className={`flex items-start space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedSchemas.has(schema) 
                      ? 'border-emerald-600 bg-emerald-50' 
                      : 'border-gray-200 bg-white hover:border-emerald-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedSchemas.has(schema)}
                      onChange={() => toggleSchema(schema)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{getSchemaLabel(schema)}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={nextStep}
              disabled={selectedSchemas.size === 0}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 font-medium disabled:opacity-50 flex items-center gap-2"
            >
              Dalej <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Step: Informacje o firmie */}
      {currentStep === 'business-info' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Podstawowe informacje
          </h2>
          <p className="text-gray-600 mb-6">
            Podaj dane o swojej firmie. Te informacje pomogą AI lepiej zrozumieć Twoją działalność.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nazwa firmy <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={businessData.name}
                onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="np. Warsztat Mechaniczny Nowak"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Używaj pełnej oficjalnej nazwy firmy
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opis działalności <span className="text-red-500">*</span>
              </label>
              <textarea
                value={businessData.description}
                onChange={(e) => setBusinessData({ ...businessData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="np. Profesjonalny serwis samochodowy oferujący naprawy mechaniczne, elektryczne i diagnostykę komputerową wszystkich marek"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Opisz czym się zajmujesz w 1-2 zdaniach. To pomaga AI w rekomendacjach.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ulica i numer
                </label>
                <input
                  type="text"
                  value={businessData.streetAddress}
                  onChange={(e) => setBusinessData({ ...businessData, streetAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="ul. Główna 15"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Miasto
                </label>
                <input
                  type="text"
                  value={businessData.addressLocality}
                  onChange={(e) => setBusinessData({ ...businessData, addressLocality: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Warszawa"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kod pocztowy
                </label>
                <input
                  type="text"
                  value={businessData.postalCode}
                  onChange={(e) => setBusinessData({ ...businessData, postalCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="00-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={businessData.telephone}
                  onChange={(e) => setBusinessData({ ...businessData, telephone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="+48 123 456 789"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={businessData.email}
                  onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="kontakt@firma.pl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Strona www
                </label>
                <input
                  type="url"
                  value={businessData.website}
                  onChange={(e) => setBusinessData({ ...businessData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://firma.pl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zakres cenowy
                </label>
                <select
                  value={businessData.priceRange}
                  onChange={(e) => setBusinessData({ ...businessData, priceRange: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Wybierz...</option>
                  <option value="$">$ - Tanie</option>
                  <option value="$$">$$ - Średnie</option>
                  <option value="$$$">$$$ - Drogie</option>
                  <option value="$$$$">$$$$ - Bardzo drogie</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Obszar działania
                </label>
                <input
                  type="text"
                  value={businessData.areaServed}
                  onChange={(e) => setBusinessData({ ...businessData, areaServed: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Warszawa, Kraków"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Miasta/regiony, gdzie świadczysz usługi (oddziel przecinkami)
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={prevStep}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Wstecz
            </button>
            <button
              onClick={nextStep}
              disabled={!businessData.name || !businessData.description}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 font-medium disabled:opacity-50 flex items-center gap-2"
            >
              Dalej <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Step: Godziny otwarcia */}
      {currentStep === 'hours' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Godziny otwarcia
          </h2>
          <p className="text-gray-600 mb-6">
            Podaj godziny pracy. AI użyje tych informacji gdy użytkownicy pytają "czy jest teraz otwarte".
          </p>

          <div className="space-y-3">
            {hoursData.map((day, idx) => (
              <div key={day.day} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-32 font-medium text-gray-700">{day.day}</div>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={day.closed}
                    onChange={(e) => {
                      const newHours = [...hoursData]
                      newHours[idx].closed = e.target.checked
                      setHoursData(newHours)
                    }}
                  />
                  <span className="text-sm text-gray-600">Nieczynne</span>
                </label>

                {!day.closed && (
                  <>
                    <input
                      type="time"
                      value={day.opens}
                      onChange={(e) => {
                        const newHours = [...hoursData]
                        newHours[idx].opens = e.target.value
                        setHoursData(newHours)
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="time"
                      value={day.closes}
                      onChange={(e) => {
                        const newHours = [...hoursData]
                        newHours[idx].closes = e.target.value
                        setHoursData(newHours)
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={prevStep}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Wstecz
            </button>
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 font-medium flex items-center gap-2"
            >
              Dalej <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Step: Kontakt */}
      {currentStep === 'contact' && selectedSchemas.has('ContactPoint') && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Dane kontaktowe
          </h2>
          <p className="text-gray-600 mb-6">
            Dodatkowe informacje kontaktowe, które AI może podać użytkownikom.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Typ kontaktu
              </label>
              <select
                value={contactData.contactType}
                onChange={(e) => setContactData({ ...contactData, contactType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="customer service">Obsługa klienta</option>
                <option value="technical support">Wsparcie techniczne</option>
                <option value="billing support">Rozliczenia</option>
                <option value="emergency">Awaryjny</option>
                <option value="sales">Sprzedaż</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon kontaktowy
              </label>
              <input
                type="tel"
                value={contactData.telephone}
                onChange={(e) => setContactData({ ...contactData, telephone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={businessData.telephone || "+48 123 456 789"}
              />
              <p className="text-xs text-gray-500 mt-1">
                Zostaw puste aby użyć głównego numeru
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email kontaktowy
              </label>
              <input
                type="email"
                value={contactData.email}
                onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={businessData.email || "kontakt@firma.pl"}
              />
              <p className="text-xs text-gray-500 mt-1">
                Zostaw puste aby użyć głównego emaila
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={prevStep}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Wstecz
            </button>
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 font-medium flex items-center gap-2"
            >
              Dalej <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Step: Opinie */}
      {currentStep === 'reviews' && (selectedSchemas.has('Review') || selectedSchemas.has('AggregateRating')) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Opinie klientów
          </h2>
          <p className="text-gray-600 mb-6">
            Dodaj prawdziwe opinie od klientów. To buduje zaufanie w AI.
          </p>

          {selectedSchemas.has('AggregateRating') && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Średnia ocena</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ocena
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={aggregateRating.ratingValue}
                    onChange={(e) => setAggregateRating({ ...aggregateRating, ratingValue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max ocena
                  </label>
                  <input
                    type="number"
                    value={aggregateRating.bestRating}
                    onChange={(e) => setAggregateRating({ ...aggregateRating, bestRating: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Liczba opinii
                  </label>
                  <input
                    type="number"
                    value={aggregateRating.reviewCount}
                    onChange={(e) => setAggregateRating({ ...aggregateRating, reviewCount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedSchemas.has('Review') && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Indywidualne opinie</h3>
              {reviewsData.map((review, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-medium text-gray-700">Opinia #{idx + 1}</span>
                    {reviewsData.length > 1 && (
                      <button
                        onClick={() => setReviewsData(reviewsData.filter((_, i) => i !== idx))}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      value={review.author}
                      onChange={(e) => {
                        const newReviews = [...reviewsData]
                        newReviews[idx].author = e.target.value
                        setReviewsData(newReviews)
                      }}
                      placeholder="Imię autora"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <select
                      value={review.rating}
                      onChange={(e) => {
                        const newReviews = [...reviewsData]
                        newReviews[idx].rating = e.target.value
                        setReviewsData(newReviews)
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                      <option value="4">⭐⭐⭐⭐ (4)</option>
                      <option value="3">⭐⭐⭐ (3)</option>
                      <option value="2">⭐⭐ (2)</option>
                      <option value="1">⭐ (1)</option>
                    </select>
                  </div>
                  <textarea
                    value={review.text}
                    onChange={(e) => {
                      const newReviews = [...reviewsData]
                      newReviews[idx].text = e.target.value
                      setReviewsData(newReviews)
                    }}
                    placeholder="Treść opinii..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              ))}
              <button
                onClick={() => setReviewsData([...reviewsData, { author: '', rating: '5', text: '', date: new Date().toISOString().split('T')[0] }])}
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Dodaj kolejną opinię
              </button>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <button
              onClick={prevStep}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Wstecz
            </button>
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 font-medium flex items-center gap-2"
            >
              Dalej <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Step: FAQ */}
      {currentStep === 'faq' && selectedSchemas.has('FAQPage') && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Najczęściej zadawane pytania
          </h2>
          <p className="text-gray-600 mb-6">
            Dodaj pytania i odpowiedzi. AI będzie mogło od razu udzielić odpowiedzi użytkownikom.
          </p>

          <div className="space-y-4">
            {faqData.map((faq, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-medium text-gray-700">Pytanie #{idx + 1}</span>
                  {faqData.length > 1 && (
                    <button
                      onClick={() => setFaqData(faqData.filter((_, i) => i !== idx))}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => {
                    const newFaq = [...faqData]
                    newFaq[idx].question = e.target.value
                    setFaqData(newFaq)
                  }}
                  placeholder="Pytanie, np. Jakie są godziny otwarcia?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-2"
                />
                <textarea
                  value={faq.answer}
                  onChange={(e) => {
                    const newFaq = [...faqData]
                    newFaq[idx].answer = e.target.value
                    setFaqData(newFaq)
                  }}
                  placeholder="Odpowiedź..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            ))}
            <button
              onClick={() => setFaqData([...faqData, { question: '', answer: '' }])}
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <Plus className="w-4 h-4" /> Dodaj kolejne pytanie
            </button>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={prevStep}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Wstecz
            </button>
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 font-medium flex items-center gap-2"
            >
              Dalej <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Step: Podsumowanie */}
      {currentStep === 'summary' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Podsumowanie
          </h2>
          <p className="text-gray-600 mb-6">
            Sprawdź wprowadzone dane przed zapisaniem.
          </p>

          <div className="space-y-4 mb-6">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <h3 className="font-semibold text-emerald-900 mb-2">
                ✅ Uzupełnisz {selectedSchemas.size} sekcji
              </h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedSchemas).map(schema => (
                  <span key={schema} className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-full">
                    {schema}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Firma</h3>
              <p className="text-gray-700">{businessData.name}</p>
              <p className="text-sm text-gray-600">{businessData.description}</p>
            </div>

            {businessData.streetAddress && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Adres</h3>
                <p className="text-gray-700">
                  {businessData.streetAddress}, {businessData.postalCode} {businessData.addressLocality}
                </p>
              </div>
            )}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Co dalej?</strong> Po zapisaniu, skopiuj kod do wklejenia na swojej stronie. 
                Możesz wrócić i edytować informacje w każdej chwili.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={prevStep}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Wstecz
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 font-medium disabled:opacity-50 flex items-center gap-2 shadow-lg"
            >
              {loading ? 'Zapisywanie...' : (
                <>
                  <Check className="w-5 h-5" /> Zapisz i zakończ
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
