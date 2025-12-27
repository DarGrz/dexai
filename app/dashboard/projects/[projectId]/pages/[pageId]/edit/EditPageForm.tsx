'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2, Save, Eye, EyeOff } from 'lucide-react'

interface EditPageFormProps {
  projectId: string
  domain: string
  page: any
  businessProfile: any
}

export default function EditPageForm({ projectId, domain, page, businessProfile }: EditPageFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [enabled, setEnabled] = useState(page.enabled)

  // Universal fields based on schema type
  const [formData, setFormData] = useState({
    name: page.json?.name || businessProfile?.business_name || '',
    description: page.json?.description || businessProfile?.description || '',
    url: page.json?.url || `https://${domain}${page.url_pattern}` || '',
    image: page.json?.image || businessProfile?.logo_url || '',
    // For Product
    price: page.json?.offers?.price || '',
    priceCurrency: page.json?.offers?.priceCurrency || 'PLN',
    availability: page.json?.offers?.availability || 'https://schema.org/InStock',
    // For LocalBusiness/Service
    telephone: page.json?.telephone || businessProfile?.phone || '',
    email: page.json?.email || businessProfile?.email || '',
    address: {
      streetAddress: page.json?.address?.streetAddress || businessProfile?.street_address || '',
      addressLocality: page.json?.address?.addressLocality || businessProfile?.address_locality || '',
      postalCode: page.json?.address?.postalCode || businessProfile?.postal_code || '',
      addressCountry: page.json?.address?.addressCountry || businessProfile?.address_country || 'PL',
    },
    // For Article/BlogPosting
    author: page.json?.author?.name || businessProfile?.business_name || '',
    datePublished: page.json?.datePublished || new Date().toISOString().split('T')[0],
    // For Event
    startDate: page.json?.startDate || '',
    endDate: page.json?.endDate || '',
    location: page.json?.location?.name || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      // Generate schema JSON based on type
      let schemaJson: any = {
        '@context': 'https://schema.org',
        '@type': page.type,
        name: formData.name,
        description: formData.description,
        url: formData.url,
      }

      if (formData.image) {
        schemaJson.image = formData.image
      }

      // Type-specific fields
      switch (page.type) {
        case 'Product':
          schemaJson.offers = {
            '@type': 'Offer',
            price: formData.price,
            priceCurrency: formData.priceCurrency,
            availability: formData.availability,
          }
          break

        case 'LocalBusiness':
        case 'Service':
          if (formData.telephone) schemaJson.telephone = formData.telephone
          if (formData.email) schemaJson.email = formData.email
          if (formData.address.streetAddress) {
            schemaJson.address = {
              '@type': 'PostalAddress',
              streetAddress: formData.address.streetAddress,
              addressLocality: formData.address.addressLocality,
              postalCode: formData.address.postalCode,
              addressCountry: formData.address.addressCountry,
            }
          }
          break

        case 'Article':
        case 'BlogPosting':
          schemaJson.author = {
            '@type': 'Person',
            name: formData.author,
          }
          schemaJson.datePublished = formData.datePublished
          break

        case 'Event':
          schemaJson.startDate = formData.startDate
          schemaJson.endDate = formData.endDate
          if (formData.location) {
            schemaJson.location = {
              '@type': 'Place',
              name: formData.location,
            }
          }
          break
      }

      const { error: updateError } = await supabase
        .from('schemas')
        .update({
          json: schemaJson,
          enabled: enabled,
        })
        .eq('id', page.id)

      if (updateError) throw updateError

      router.push(`/dashboard/projects/${projectId}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas zapisywania')
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Czy na pewno chcesz usunąć tę podstronę?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('schemas')
        .delete()
        .eq('id', page.id)

      if (error) throw error

      router.push(`/dashboard/projects/${projectId}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas usuwania')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edytuj podstronę
          </h1>
          <p className="text-gray-600 font-mono text-sm">
            {domain}{page.url_pattern}
          </p>
          <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded">
            {page.type}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setEnabled(!enabled)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
            enabled
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {enabled ? 'Aktywny' : 'Wyłączony'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Fields (Universal) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Podstawowe informacje</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nazwa <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="np. Laptop Dell XPS 13"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opis
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Krótki opis..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              placeholder={`https://${domain}${page.url_pattern}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zdjęcie (URL)
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>
      </div>

      {/* Product-specific fields */}
      {page.type === 'Product' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informacje o produkcie</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cena</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="999.99"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Waluta</label>
              <select
                value={formData.priceCurrency}
                onChange={(e) => setFormData({ ...formData, priceCurrency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="PLN">PLN</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dostępność</label>
              <select
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="https://schema.org/InStock">Dostępny</option>
                <option value="https://schema.org/OutOfStock">Niedostępny</option>
                <option value="https://schema.org/PreOrder">Pre-order</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* LocalBusiness/Service fields */}
      {(page.type === 'LocalBusiness' || page.type === 'Service') && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kontakt i lokalizacja</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ulica</label>
              <input
                type="text"
                value={formData.address.streetAddress}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, streetAddress: e.target.value }})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Miasto</label>
              <input
                type="text"
                value={formData.address.addressLocality}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, addressLocality: e.target.value }})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kod pocztowy</label>
              <input
                type="text"
                value={formData.address.postalCode}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, postalCode: e.target.value }})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Article/BlogPosting fields */}
      {(page.type === 'Article' || page.type === 'BlogPosting') && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informacje o artykule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data publikacji</label>
              <input
                type="date"
                value={formData.datePublished}
                onChange={(e) => setFormData({ ...formData, datePublished: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Event fields */}
      {page.type === 'Event' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informacje o wydarzeniu</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data rozpoczęcia</label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data zakończenia</label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Lokalizacja</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Nazwa miejsca"
              />
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Usuń podstronę
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-md hover:from-emerald-700 hover:to-teal-700 font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </button>
        </div>
      </div>
    </form>
  )
}
