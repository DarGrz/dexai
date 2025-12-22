'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface BillingFormData {
  firstName: string
  lastName: string
  companyName?: string
  taxId?: string
  addressLine1: string
  addressLine2?: string
  city: string
  postalCode: string
  country: string
  phone?: string
}

export function CheckoutForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isCompany, setIsCompany] = useState(false)
  const [formData, setFormData] = useState<BillingFormData>({
    firstName: '',
    lastName: '',
    companyName: '',
    taxId: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    country: 'PL',
    phone: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billingDetails: formData,
          isCompany,
        }),
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        const data = await response.json()
        alert(`Błąd: ${data.error}`)
        setIsLoading(false)
      }
    } catch (error) {
      alert('Wystąpił błąd. Spróbuj ponownie.')
      setIsLoading(false)
    }
  }

  const updateField = (field: keyof BillingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Typ klienta */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isCompany}
            onChange={(e) => setIsCompany(e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded"
          />
          <span className="font-medium text-gray-900">Faktura na firmę</span>
        </label>
      </div>

      {/* Dane osobowe */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Imię <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nazwisko <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Dane firmowe - jeśli firma */}
      {isCompany && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nazwa firmy <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required={isCompany}
              value={formData.companyName}
              onChange={(e) => updateField('companyName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NIP <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required={isCompany}
              value={formData.taxId}
              onChange={(e) => updateField('taxId', e.target.value)}
              placeholder="1234567890"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </>
      )}

      {/* Adres */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ulica i numer <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.addressLine1}
          onChange={(e) => updateField('addressLine1', e.target.value)}
          placeholder="ul. Przykładowa 123"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dodatkowe info (nr lokalu, piętro)
        </label>
        <input
          type="text"
          value={formData.addressLine2}
          onChange={(e) => updateField('addressLine2', e.target.value)}
          placeholder="Lokal 5"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kod pocztowy <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.postalCode}
            onChange={(e) => updateField('postalCode', e.target.value)}
            placeholder="00-000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Miasto <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.city}
            onChange={(e) => updateField('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Kraj <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={formData.country}
          onChange={(e) => updateField('country', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="PL">Polska</option>
          <option value="DE">Niemcy</option>
          <option value="CZ">Czechy</option>
          <option value="SK">Słowacja</option>
          <option value="US">USA</option>
          <option value="GB">Wielka Brytania</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Telefon
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => updateField('phone', e.target.value)}
          placeholder="+48 123 456 789"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Przycisk submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Przekierowywanie do płatności...' : 'Przejdź do płatności'}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Po kliknięciu zostaniesz przekierowany do bezpiecznej strony płatności Stripe
      </p>
    </form>
  )
}
