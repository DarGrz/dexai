'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { INDUSTRIES, PRICING, type Industry } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { 
  Wrench, Heart, Hotel, Car, Landmark, ShoppingCart, UtensilsCrossed, FileText,
  Home, GraduationCap, Scale, Dumbbell, Scissors, Palette, Monitor
} from 'lucide-react'

const INDUSTRY_CONFIG = {
  [INDUSTRIES.LOCAL_SERVICES]: {
    name: 'Lokalne usługi',
    description: 'Hydraulicy, elektrycy, instalatorzy, sprzątanie',
    icon: Wrench,
    recommendedSchemas: ['LocalBusiness', 'Service', 'AggregateRating', 'Review', 'FAQPage', 'ContactPoint'],
    benefits: 'Idealne dla lokalnych przedsiębiorców obsługujących klientów w swojej okolicy',
  },
  [INDUSTRIES.MEDICAL]: {
    name: 'Medycyna i zdrowie',
    description: 'Kliniki, gabinety, dentyści, lekarze',
    icon: Heart,
    recommendedSchemas: ['MedicalOrganization', 'Physician', 'Dentist', 'OpeningHoursSpecification', 'Review', 'AggregateRating', 'Service'],
    benefits: 'Optymalne dla praktyk medycznych i specjalistów zdrowia',
  },
  [INDUSTRIES.HOTEL]: {
    name: 'Hotele i noclegi',
    description: 'Hotele, pensjonaty, apartamenty, B&B',
    icon: Hotel,
    recommendedSchemas: ['Hotel', 'LodgingBusiness', 'AggregateRating', 'Review', 'Offer', 'FAQPage'],
    benefits: 'Najlepsze dla branży hotelarskiej i obiektów noclegowych',
  },
  [INDUSTRIES.AUTOMOTIVE]: {
    name: 'Motoryzacja',
    description: 'Warsztaty, komisy, wypożyczalnie, detailing',
    icon: Car,
    recommendedSchemas: ['AutoRepair', 'AutoDealer', 'Service', 'Product', 'AggregateRating', 'Review'],
    benefits: 'Stworzone dla warsztatów, komis i serwisów samochodowych',
  },
  [INDUSTRIES.FINANCE]: {
    name: 'Finanse i ubezpieczenia',
    description: 'Banki, doradcy, ubezpieczenia, księgowość',
    icon: Landmark,
    recommendedSchemas: ['FinancialService', 'BankOrCreditUnion', 'InsuranceAgency', 'Service', 'Review', 'FAQPage'],
    benefits: 'Dedykowane dla instytucji finansowych i doradców',
  },
  [INDUSTRIES.ECOMMERCE]: {
    name: 'E-commerce',
    description: 'Sklepy internetowe, marketplace',
    icon: ShoppingCart,
    recommendedSchemas: ['Product', 'Offer', 'AggregateRating', 'Review', 'BreadcrumbList', 'WebSite', 'SearchAction'],
    benefits: 'Zaprojektowane dla sklepów online i platform e-commerce',
  },
  [INDUSTRIES.RESTAURANT]: {
    name: 'Gastronomia',
    description: 'Restauracje, kawiarnie, catering, bary',
    icon: UtensilsCrossed,
    recommendedSchemas: ['Restaurant', 'Menu', 'MenuItem', 'OpeningHoursSpecification', 'Review', 'AggregateRating'],
    benefits: 'Dostosowane dla restauracji, kawiarni i usług cateringowych',
  },
  [INDUSTRIES.REAL_ESTATE]: {
    name: 'Nieruchomości',
    description: 'Agencje, pośrednicy, deweloperzy',
    icon: Home,
    recommendedSchemas: ['RealEstateAgent', 'Service', 'Offer', 'Review', 'ContactPoint', 'FAQPage'],
    benefits: 'Przygotowane dla agencji i pośredników nieruchomości',
  },
  [INDUSTRIES.EDUCATION]: {
    name: 'Edukacja',
    description: 'Szkoły, kursy, korepetycje, szkolenia',
    icon: GraduationCap,
    recommendedSchemas: ['EducationalOrganization', 'School', 'Course', 'Event', 'Review', 'FAQPage'],
    benefits: 'Idealne dla placówek edukacyjnych i platform szkoleniowych',
  },
  [INDUSTRIES.LEGAL]: {
    name: 'Prawo',
    description: 'Kancelarie, adwokaci, doradcy prawni',
    icon: Scale,
    recommendedSchemas: ['LawFirm', 'Attorney', 'Service', 'Review', 'FAQPage', 'ContactPoint'],
    benefits: 'Stworzone dla kancelarii prawnych i profesjonalistów',
  },
  [INDUSTRIES.FITNESS]: {
    name: 'Fitness i sport',
    description: 'Siłownie, kluby sportowe, trenerzy',
    icon: Dumbbell,
    recommendedSchemas: ['SportsActivityLocation', 'HealthAndBeautyBusiness', 'Service', 'Offer', 'Review', 'Event'],
    benefits: 'Najlepsze dla klubów fitness i obiektów sportowych',
  },
  [INDUSTRIES.BEAUTY]: {
    name: 'Uroda i pielęgnacja',
    description: 'Salony fryzjerskie, kosmetyczne, spa',
    icon: Scissors,
    recommendedSchemas: ['BeautySalon', 'HairSalon', 'DaySpa', 'Service', 'AggregateRating', 'Review', 'OpeningHoursSpecification'],
    benefits: 'Dedykowane dla salonów urody i centrów SPA',
  },
  [INDUSTRIES.ENTERTAINMENT]: {
    name: 'Rozrywka i kultura',
    description: 'Kina, teatry, eventy, atrakcje',
    icon: Palette,
    recommendedSchemas: ['Event', 'Organization', 'Review', 'Offer', 'FAQPage', 'VideoObject'],
    benefits: 'Przygotowane dla organizatorów wydarzeń i atrakcji',
  },
  [INDUSTRIES.TECHNOLOGY]: {
    name: 'IT i technologia',
    description: 'Usługi IT, software house, support',
    icon: Monitor,
    recommendedSchemas: ['Organization', 'Service', 'Product', 'SoftwareApplication', 'HowTo', 'FAQPage', 'Review'],
    benefits: 'Zaprojektowane dla firm IT i dostawców rozwiązań technologicznych',
  },
  [INDUSTRIES.OTHER]: {
    name: 'Inna branża',
    description: 'Nie widzisz swojej kategorii? Wybierz tę opcję',
    icon: FileText,
    recommendedSchemas: ['Organization', 'LocalBusiness', 'Service', 'FAQPage', 'Review', 'ContactPoint'],
    benefits: 'Uniwersalne rozwiązanie dla każdej branży',
  },
}

export default function SetupSchemasPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null)
  const [schemaCount, setSchemaCount] = useState(0)
  const [hasBusinessProfile, setHasBusinessProfile] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      
      // Check schema count
      const { data: schemas } = await supabase
        .from('schemas')
        .select('id')
        .eq('project_id', projectId)
      
      setSchemaCount(schemas?.length || 0)

      // Check if business profile exists
      const { data: profile } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('project_id', projectId)
        .single()
      
      setHasBusinessProfile(!!profile)
    }
    fetchData()
  }, [projectId])

  const handleContinue = () => {
    if (selectedIndustry) {
      // Check if user needs to create business profile first
      if (!hasBusinessProfile) {
        router.push(`/dashboard/projects/${projectId}/business-profile`)
      } else if (schemaCount >= PRICING.MAX_SCHEMAS_PER_PROJECT) {
        alert(`Osiągnięto limit ${PRICING.MAX_SCHEMAS_PER_PROJECT} sekcji na domenę. Usuń niepotrzebne sekcje aby dodać nowe.`)
      } else {
        router.push(`/dashboard/projects/${projectId}/schemas/wizard?industry=${selectedIndustry}`)
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Kreator profilu firmy
            </h1>
            <p className="text-gray-600">
              Wybierz swoją branżę, a dopasujemy odpowiednie informacje do Twojej działalności
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Sekcje:</div>
            <div className="text-2xl font-bold text-emerald-600">
              {schemaCount}/{PRICING.MAX_SCHEMAS_PER_PROJECT}
            </div>
          </div>
        </div>
        
        {!hasBusinessProfile && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 text-xl">💡</div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Najpierw uzupełnij profil firmy</h3>
                <p className="text-sm text-blue-800">
                  Wprowadź podstawowe dane swojej firmy raz, a będą one automatycznie wykorzystywane przy tworzeniu informacji dla różnych podstron.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {schemaCount >= PRICING.MAX_SCHEMAS_PER_PROJECT && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="text-red-600 text-xl">⚠️</div>
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Osiągnięto limit sekcji</h3>
                <p className="text-sm text-red-800">
                  Masz już {PRICING.MAX_SCHEMAS_PER_PROJECT} sekcji. Usuń niepotrzebne aby dodać nowe.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {Object.entries(INDUSTRY_CONFIG).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setSelectedIndustry(key as Industry)}
            className={`p-6 rounded-lg border-2 text-left transition-all ${
              selectedIndustry === key
                ? 'border-emerald-600 bg-emerald-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-start space-x-3 mb-4">
              <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                selectedIndustry === key ? 'bg-emerald-600' : 'bg-gray-100'
              }`}>
                <config.icon className={`w-6 h-6 ${
                  selectedIndustry === key ? 'text-white' : 'text-emerald-600'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {config.name}
                </h3>
                <p className="text-xs text-gray-600">
                  {config.description}
                </p>
              </div>
            </div>
            <div className={`text-xs leading-relaxed ${
              selectedIndustry === key ? 'text-emerald-700' : 'text-gray-600'
            }`}>
              💡 {config.benefits}
            </div>
          </button>
        ))}
      </div>

      {selectedIndustry && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-6 mb-6 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">✨</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-emerald-900 text-lg mb-2">
                Idealne dopasowanie dla: {INDUSTRY_CONFIG[selectedIndustry].name}
              </h3>
              <p className="text-sm text-emerald-800 mb-4">
                {INDUSTRY_CONFIG[selectedIndustry].benefits}
              </p>
            </div>
          </div>
          
          <div className="bg-white/60 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
              <span>📊</span>
              <span>Sekcje, które skonfigurujemy ({INDUSTRY_CONFIG[selectedIndustry].recommendedSchemas.length})</span>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {INDUSTRY_CONFIG[selectedIndustry].recommendedSchemas.map((schema: string) => (
                <div key={schema} className="flex items-center gap-2 text-sm text-emerald-800">
                  <span className="text-emerald-600">✓</span>
                  <span>{schema}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-800">
              <strong>💡 Wskazówka:</strong> Możesz później edytować każdą sekcję, dodać więcej informacji lub wyłączyć te, których nie potrzebujesz
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 font-medium"
        >
          ← Wstecz
        </button>
        <button
          onClick={handleContinue}
          disabled={!selectedIndustry}
          className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg disabled:shadow-none transition-all"
        >
          Przejdź dalej →
        </button>
      </div>
    </div>
  )
}
