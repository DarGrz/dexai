// Polish user-friendly labels for schema types
export const SCHEMA_TYPE_LABELS: Record<string, string> = {
  // Main types
  'LocalBusiness': 'Informacje o firmie',
  'Organization': 'Organizacja',
  'Product': 'Oferta',
  'Service': 'Szczegóły oferowanych usług',
  
  // Business types
  'AutoRepair': 'Warsztat samochodowy',
  'AutoDealer': 'Komis samochodowy',
  'Restaurant': 'Restauracja',
  'Hotel': 'Hotel',
  'LodgingBusiness': 'Obiekt noclegowy',
  'MedicalOrganization': 'Organizacja medyczna',
  'Physician': 'Lekarz',
  'Dentist': 'Dentysta',
  'Hospital': 'Szpital',
  'Pharmacy': 'Apteka',
  'FinancialService': 'Usługi finansowe',
  'BankOrCreditUnion': 'Bank',
  'InsuranceAgency': 'Ubezpieczenia',
  'RealEstateAgent': 'Agent nieruchomości',
  'LawFirm': 'Kancelaria prawna',
  'Attorney': 'Adwokat',
  'EducationalOrganization': 'Organizacja edukacyjna',
  'School': 'Szkoła',
  'CollegeOrUniversity': 'Uczelnia',
  'Library': 'Biblioteka',
  'SportsActivityLocation': 'Obiekt sportowy',
  'HealthAndBeautyBusiness': 'Salon urody',
  'BeautySalon': 'Salon kosmetyczny',
  'HairSalon': 'Salon fryzjerski',
  'DaySpa': 'Salon SPA',
  
  // Content types
  'Article': 'Artykuł',
  'BlogPosting': 'Wpis na blogu',
  'NewsArticle': 'Artykuł informacyjny',
  
  // Pages
  'FAQPage': 'Najczęściej zadawane pytania',
  'ContactPage': 'Dane kontaktowe',
  'AboutPage': 'O nas',
  'WebPage': 'Strona internetowa',
  
  // Events & Education
  'Event': 'Wydarzenie',
  'Course': 'Kurs szkoleniowy',
  
  // Media
  'VideoObject': 'Materiał wideo',
  'ImageObject': 'Zdjęcie',
  
  // Food
  'Recipe': 'Przepis kulinarny',
  'MenuItem': 'Pozycja w menu',
  'Menu': 'Menu',
  
  // Reviews & Ratings
  'Review': 'Indywidualne opinie klientów',
  'AggregateRating': 'Średnia ocena z wszystkich opinii',
  'Rating': 'Ocena',
  
  // Offers
  'Offer': 'Oferta handlowa',
  
  // Navigation
  'BreadcrumbList': 'Ścieżka nawigacji',
  'WebSite': 'Strona internetowa',
  'SearchAction': 'Wyszukiwarka',
  
  // Additional
  'ContactPoint': 'Dane kontaktowe',
  'OpeningHoursSpecification': 'Godziny otwarcia',
  'PostalAddress': 'Adres pocztowy',
  'Person': 'Osoba',
  'HowTo': 'Instrukcja krok po kroku',
}

// Get Polish label for schema type, fallback to technical name
export function getSchemaLabel(schemaType: string): string {
  return SCHEMA_TYPE_LABELS[schemaType] || schemaType
}

// Schema types options for form selection
export const SCHEMA_TYPES_OPTIONS = [
  { value: 'LocalBusiness', label: 'Informacje o firmie', description: 'Podstawowe dane firmy, adres, kontakt' },
  { value: 'Product', label: 'Produkt', description: 'Pojedynczy produkt w sklepie' },
  { value: 'Service', label: 'Usługa', description: 'Szczegóły oferowanych usług' },
  { value: 'Article', label: 'Artykuł', description: 'Artykuł informacyjny, poradnik' },
  { value: 'BlogPosting', label: 'Wpis na blogu', description: 'Post blogowy, aktualność' },
  { value: 'FAQPage', label: 'FAQ', description: 'Najczęściej zadawane pytania' },
  { value: 'ContactPage', label: 'Kontakt', description: 'Strona kontaktowa' },
  { value: 'AboutPage', label: 'O nas', description: 'Informacje o firmie' },
  { value: 'Event', label: 'Wydarzenie', description: 'Wydarzenie, szkolenie, webinar' },
  { value: 'Course', label: 'Kurs', description: 'Kurs szkoleniowy, edukacyjny' },
  { value: 'Recipe', label: 'Przepis', description: 'Przepis kulinarny' },
  { value: 'HowTo', label: 'Instrukcja', description: 'Przewodnik krok po kroku (jak zrobić)' },
  { value: 'VideoObject', label: 'Wideo', description: 'Film, materiał wideo' },
  { value: 'Review', label: 'Opinia', description: 'Pojedyncza opinia klienta' },
  { value: 'AggregateRating', label: 'Ocena', description: 'Średnia ocena z opinii' },
  { value: 'BreadcrumbList', label: 'Breadcrumbs', description: 'Ścieżka nawigacji' },
  { value: 'WebPage', label: 'Strona WWW', description: 'Ogólna strona internetowa' },
]

