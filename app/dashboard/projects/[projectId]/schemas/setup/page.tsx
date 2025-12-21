'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { INDUSTRIES, type Industry } from '@/lib/constants'
import { Wrench, Heart, Hotel, Car, Landmark, ShoppingCart, UtensilsCrossed, FileText } from 'lucide-react'

const INDUSTRY_CONFIG = {
  [INDUSTRIES.LOCAL_SERVICES]: {
    name: 'Lokalne usługi',
    description: 'Hydraulicy, elektrycy, fryzjerzy, pomoc drogowa',
    icon: Wrench,
    recommendedSchemas: ['LocalBusiness', 'OpeningHours', 'AggregateRating', 'Service'],
  },
  [INDUSTRIES.MEDICAL]: {
    name: 'Medycyna i zdrowie',
    description: 'Kliniki, gabinety lekarskie, dentyści',
    icon: Heart,
    recommendedSchemas: ['MedicalOrganization', 'Physician', 'OpeningHours', 'Review'],
  },
  [INDUSTRIES.HOTEL]: {
    name: 'Hotele i noclegi',
    description: 'Hotele, apartamenty, pensjonaty',
    icon: Hotel,
    recommendedSchemas: ['Hotel', 'LodgingBusiness', 'AggregateRating', 'Offer'],
  },
  [INDUSTRIES.AUTOMOTIVE]: {
    name: 'Motoryzacja',
    description: 'Warsztaty, komisy, wypożyczalnie',
    icon: Car,
    recommendedSchemas: ['AutoRepair', 'AutoDealer', 'Product', 'Service'],
  },
  [INDUSTRIES.FINANCE]: {
    name: 'Finanse',
    description: 'Banki, ubezpieczenia, doradztwo',
    icon: Landmark,
    recommendedSchemas: ['FinancialService', 'BankOrCreditUnion', 'Service'],
  },
  [INDUSTRIES.ECOMMERCE]: {
    name: 'E-commerce',
    description: 'Sklepy internetowe',
    icon: ShoppingCart,
    recommendedSchemas: ['Product', 'Offer', 'AggregateRating', 'BreadcrumbList'],
  },
  [INDUSTRIES.RESTAURANT]: {
    name: 'Gastronomia',
    description: 'Restauracje, catering',
    icon: UtensilsCrossed,
    recommendedSchemas: ['Restaurant', 'Menu', 'OpeningHours', 'Review'],
  },
  [INDUSTRIES.OTHER]: {
    name: 'Inne',
    description: 'Inna branża lub uniwersalne',
    icon: FileText,
    recommendedSchemas: ['Organization', 'LocalBusiness', 'FAQPage'],
  },
}

export default function SetupSchemasPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null)
  const router = useRouter()

  const handleContinue = () => {
    if (selectedIndustry) {
      router.push(`/dashboard/projects/${projectId}/schemas/create?industry=${selectedIndustry}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Wybierz branżę
        </h1>
        <p className="text-gray-600">
          Dopasujemy odpowiednie typy danych strukturalnych do Twojej działalności
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {Object.entries(INDUSTRY_CONFIG).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setSelectedIndustry(key as Industry)}
            className={`p-6 rounded-lg border-2 text-left transition-all ${
              selectedIndustry === key
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 flex items-center justify-center">
                <config.icon className="w-10 h-10 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {config.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {config.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {config.recommendedSchemas.map((schema: string) => (
                    <span
                      key={schema}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                    >
                      {schema}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedIndustry && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            📊 Co zostanie utworzone?
          </h3>
          <p className="text-sm text-blue-800 mb-3">
            Dla branży <strong>{INDUSTRY_CONFIG[selectedIndustry].name}</strong> przygotujemy:
          </p>
          <ul className="text-sm text-blue-800 space-y-1">
            {INDUSTRY_CONFIG[selectedIndustry].recommendedSchemas.map((schema: string) => (
              <li key={schema}>✓ {schema}</li>
            ))}
          </ul>
          <p className="text-xs text-blue-700 mt-3">
            Będziesz mógł je później dostosować lub dodać więcej typów
          </p>
        </div>
      )}

      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Wstecz
        </button>
        <button
          onClick={handleContinue}
          disabled={!selectedIndustry}
          className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Dalej →
        </button>
      </div>
    </div>
  )
}
