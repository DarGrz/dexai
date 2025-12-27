// Industry types for schema selection
export const INDUSTRIES = {
  MEDICAL: 'medical',
  HOTEL: 'hotel',
  AUTOMOTIVE: 'automotive',
  FINANCE: 'finance',
  LOCAL_SERVICES: 'local_services',
  ECOMMERCE: 'ecommerce',
  RESTAURANT: 'restaurant',
  REAL_ESTATE: 'real_estate',
  EDUCATION: 'education',
  LEGAL: 'legal',
  FITNESS: 'fitness',
  BEAUTY: 'beauty',
  ENTERTAINMENT: 'entertainment',
  TECHNOLOGY: 'technology',
  OTHER: 'other',
} as const

export type Industry = typeof INDUSTRIES[keyof typeof INDUSTRIES]

// Schema types - rozszerzona lista z schema.org
export const SCHEMA_TYPES = {
  // Podstawowe
  LOCAL_BUSINESS: 'LocalBusiness',
  ORGANIZATION: 'Organization',
  
  // Biznes specjalistyczny
  AUTO_REPAIR: 'AutoRepair',
  AUTO_DEALER: 'AutoDealer',
  RESTAURANT: 'Restaurant',
  HOTEL: 'Hotel',
  LODGING_BUSINESS: 'LodgingBusiness',
  MEDICAL_ORGANIZATION: 'MedicalOrganization',
  PHYSICIAN: 'Physician',
  DENTIST: 'Dentist',
  HOSPITAL: 'Hospital',
  PHARMACY: 'Pharmacy',
  FINANCIAL_SERVICE: 'FinancialService',
  BANK: 'BankOrCreditUnion',
  INSURANCE_AGENCY: 'InsuranceAgency',
  REAL_ESTATE_AGENT: 'RealEstateAgent',
  LAW_FIRM: 'LawFirm',
  ATTORNEY: 'Attorney',
  EDUCATION_ORGANIZATION: 'EducationalOrganization',
  SCHOOL: 'School',
  COLLEGE: 'CollegeOrUniversity',
  LIBRARY: 'Library',
  SPORTS_CLUB: 'SportsActivityLocation',
  HEALTH_CLUB: 'HealthAndBeautyBusiness',
  BEAUTY_SALON: 'BeautySalon',
  HAIR_SALON: 'HairSalon',
  SPA: 'DaySpa',
  STORE: 'Store',
  SHOPPING_CENTER: 'ShoppingCenter',
  
  // Produkty i usługi
  PRODUCT: 'Product',
  SERVICE: 'Service',
  OFFER: 'Offer',
  AGGREGATE_OFFER: 'AggregateOffer',
  
  // Oceny i opinie
  AGGREGATE_RATING: 'AggregateRating',
  REVIEW: 'Review',
  RATING: 'Rating',
  
  // Treści
  ARTICLE: 'Article',
  BLOG_POSTING: 'BlogPosting',
  NEWS_ARTICLE: 'NewsArticle',
  FAQ_PAGE: 'FAQPage',
  QUESTION: 'Question',
  HOW_TO: 'HowTo',
  RECIPE: 'Recipe',
  VIDEO_OBJECT: 'VideoObject',
  IMAGE_OBJECT: 'ImageObject',
  
  // Nawigacja i struktura
  BREADCRUMB: 'BreadcrumbList',
  WEB_PAGE: 'WebPage',
  WEB_SITE: 'WebSite',
  SITE_NAVIGATION_ELEMENT: 'SiteNavigationElement',
  
  // Dane kontaktowe i społecznościowe
  CONTACT_POINT: 'ContactPoint',
  POSTAL_ADDRESS: 'PostalAddress',
  
  // Wydarzenia
  EVENT: 'Event',
  BUSINESS_EVENT: 'BusinessEvent',
  COURSE: 'Course',
  
  // Menu i oferta
  MENU: 'Menu',
  MENU_ITEM: 'MenuItem',
  
  // Inne
  JOB_POSTING: 'JobPosting',
  SEARCH_ACTION: 'SearchAction',
  OPENING_HOURS: 'OpeningHoursSpecification',
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
