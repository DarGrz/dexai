// Industry types for schema selection
export const INDUSTRIES = {
  MEDICAL: 'medical',
  HOTEL: 'hotel',
  AUTOMOTIVE: 'automotive',
  FINANCE: 'finance',
  LOCAL_SERVICES: 'local_services',
  ECOMMERCE: 'ecommerce',
  RESTAURANT: 'restaurant',
  OTHER: 'other',
} as const

export type Industry = typeof INDUSTRIES[keyof typeof INDUSTRIES]

// Schema types
export const SCHEMA_TYPES = {
  LOCAL_BUSINESS: 'LocalBusiness',
  ORGANIZATION: 'Organization',
  OPENING_HOURS: 'OpeningHours',
  AGGREGATE_RATING: 'AggregateRating',
  REVIEW: 'Review',
  FAQ_PAGE: 'FAQPage',
  SERVICE: 'Service',
  PRODUCT: 'Product',
  BREADCRUMB: 'BreadcrumbList',
  ARTICLE: 'Article',
  PRICE_LIST: 'PriceList',
} as const

export type SchemaType = typeof SCHEMA_TYPES[keyof typeof SCHEMA_TYPES]

// Subscription statuses
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const

export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS[keyof typeof SUBSCRIPTION_STATUS]

// Edit actions
export const EDIT_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  TOGGLE: 'toggle',
  DELETE: 'delete',
} as const

export type EditAction = typeof EDIT_ACTIONS[keyof typeof EDIT_ACTIONS]

// Pricing
export const PRICING = {
  PROMO_PRICE: 49,
  REGULAR_PRICE: 99,
  ADDITIONAL_DOMAIN_MULTIPLIER: 0.25,
  EDIT_LIMIT_PER_MONTH: 5,
} as const
