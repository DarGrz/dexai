# Dokumentacja koncepcyjna: Dexio.pl - AI Search Optimizer

**Data utworzenia:** 21 grudnia 2025  
**Status:** Faza koncepcyjna  
**Typ produktu:** SaaS
**Domena:** dexio.pl

---

## 1. OPIS PRODUKTU

### 1.1 Idea w dwóch zdaniach

Usługa w chmurze, która optymalizuje widoczność firm w wyszukiwarkach AI (ChatGPT, Gemini, Perplexity, Bing AI).

Klient wkleja jeden skrypt na stronę (jak Cookiebot), a wszystkie dane strukturalne zarządza z panelu – bez ingerencji w kod strony.

### 1.2 Główna wartość

**Nie sprzedajemy "schema markup" – sprzedajemy widoczność w AI Search.**

Produkt pozwala firmom pojawiać się w wynikach wyszukiwarek AI z:
- Pełną kartą informacyjną (AI Cards)
- Opiniami i gwiazdkami pod linkiem
- Opisem usług, godzinami, lokalizacją
- FAQ i cenami
- Większą wiarygodnością w oczach AI

---

## 2. GŁÓWNY PUNKT SPRZEDAŻOWY

### 2.1 AI Search Optimization – nie klasyczne SEO

**Dlaczego to działa:**

1. **AI Search czyta dane strukturalne 10× częściej niż Google**
   - ChatGPT, Gemini, Perplexity nie skanują całej strony
   - Wybierają tylko metadane i dane strukturalne
   - Brak tych danych = AI nie wie, czym jest firma

2. **Opinie widoczne pod linkiem (Review Snippets)**
   - Gwiazdki, oceny, opinie
   - Wyświetlane bez wchodzenia na stronę
   - Dramatycznie zwiększa klikalność

3. **AI generuje odpowiedzi na podstawie danych strukturalnych**
   - Przy pytaniu "Najlepsza pomoc drogowa Warszawa"
   - AI wybiera firmy z najbogatszymi danymi:
     * Opis usług
     * Obszary działania
     * Dane kontaktowe
     * Godziny otwarcia
     * Opinie
     * FAQ

4. **AI bardziej ufa danym strukturalnym niż tekstowi**
   - Ustrukturyzowane dane w określonym formacie
   - Łatwe do walidacji
   - Traktowane jako źródło zaufane

5. **10× więcej informacji niż w Google Business Profile**
   - Ceny, FAQ, cennik usług, zdjęcia
   - Kategorie, pełne menu usług
   - Dla AI to kluczowe dane

### 2.2 Komunikat sprzedażowy

**Wersja krótka:**
"SEO dla Google było dawniej – teraz liczy się SEO dla AI. My to robimy za pomocą jednego skryptu."

**Wersja długa:**
"Narzędzie, które umieszcza Twoją firmę wyżej w wynikach wyszukiwarek AI, bo wstrzykuje najlepsze możliwe dane strukturalne na stronę za pomocą jednego skryptu."

---

## 3. DLA KOGO

### 3.1 Segmenty docelowe

1. **Małe firmy bez programisty**
   - Chcą mieć lokalne SEO ogarnięte
   - Potrzebują prostego rozwiązania

2. **Agencje SEO i freelancerzy**
   - Zarządzają kilkunastoma i więcej stronami klientów
   - Potrzebują skalowalnego narzędzia

3. **Software houses i twórcy stron**
   - Dodają schema klientom w pakiecie
   - Bez ręcznego klepania JSON-LD

4. **Właściciele wielu domen**
   - Jedna platforma do zarządzania całą siecią stron
   - Centralne zarządzanie danymi

---

## 4. MODEL BIZNESOWY I CENY

### 4.1 Abonament miesięczny (SaaS)

**Plan Podstawowy**
- 1 domena w cenie podstawowej
- Nielimitowane schematy
- Wszystkie typy (LocalBusiness, FAQ, Review, Product, Service, etc.)
- Pełen dostęp do panelu
- Wybór branży i automatyczne sugestie
- Logi wdrożeń
- Walidacja danych
- **Limit: 5 edycji/zapisów schema miesięcznie** (odnawia się każdego miesiąca)

**Cennik:**
- **Cena promocyjna: 49 zł/miesiąc brutto**
- **Cena regularna: 99 zł/miesiąc brutto**
- **Każda dodatkowa domena: +25% do ceny podstawowej**
  - Promocja: 49 zł + 12,25 zł = 61,25 zł (2 domeny)
  - Regularna: 99 zł + 24,75 zł = 123,75 zł (2 domeny)

**Przykłady:**
- 1 domena: 49 zł (promocja) / 99 zł (regularna)
- 2 domeny: 61,25 zł (promocja) / 123,75 zł (regularna)
- 3 domeny: 73,50 zł (promocja) / 148,50 zł (regularna)
- 5 domen: 98 zł (promocja) / 198 zł (regularna)
- 10 domen: 159,25 zł (promocja) / 321,75 zł (regularna)

### 4.2 Limit edycji schema

**5 zapisów/edycji miesięcznie na domenę**

Każda zmiana danych w panelu (edycja lub dodanie nowego typu schema) liczy się jako 1 edycja.
Limit odnawia się pierwszego dnia każdego miesiąca.

**Dlaczego wprowadzamy ten limit?**

1. **Ochrona pozycjonowania strony**
   - Zbyt częste zmiany danych strukturalnych mogą negatywnie wpłynąć na pozycjonowanie w wyszukiwarkach
   - Google i AI Search potrzebują czasu na ponowne przeindeksowanie i walidację danych
   - Częste modyfikacje mogą być interpretowane jako brak stabilności/wiarygodności
   - Rekomendacja Google: zmiany schema nie częściej niż raz na tydzień

2. **Stabilność techniczna**
   - Ochrona przed przeciążeniem bazy danych
   - Zapewnienie wysokiej wydajności API dla wszystkich użytkowników
   - Optymalizacja cache i CDN

3. **Best practices**
   - 5 edycji miesięcznie to więcej niż wystarczająco dla typowych potrzeb
   - Pozwala na korekty, aktualizacje sezonowe i zmiany strategiczne
   - Większość firm zmienia dane strukturalne 1-2 razy w miesiącu

**Co liczy się jako edycja?**
- ✅ Zapisanie zmian w istniejącym schema (np. zmiana telefonu, godzin)
- ✅ Dodanie nowego typu schema (np. dodanie Reviews)
- ✅ Włączenie/wyłączenie typu schema checkboxem
- ❌ Podgląd danych (bez zapisywania)
- ❌ Przeglądanie logów
- ❌ Sprawdzanie walidacji

**Licznik edycji w panelu:**
- Użytkownik widzi: "Pozostało edycji w tym miesiącu: 3/5"
- Powiadomienie przy ostatniej edycji
- Po wyczerpaniu limitu: opcja odczekania do nowego miesiąca lub kontakt z supportem

### 4.3 Dodatkowo

- Płatne wdrożenia jednorazowe (setup assistance)
- Indywidualne pakiety dla agencji SEO (powyżej 20 domen)
- Dedykowane rozwiązania dla dużych klientów
- Zwiększenie limitu edycji na życzenie (dla szczególnych przypadków)

---

## 5. ZAKRES MVP (Minimum Viable Product)

### 5.1 Panel www

**Podstawowe funkcje:**

1. **Rejestracja i logowanie (Supabase Auth)**
   - Email + hasło (Supabase Auth)
   - Magic Link (email bez hasła)
   - OAuth (Google opcjonalnie)
   - Reset hasła
   - Email verification

2. **Zarządzanie projektami**
   - Dodawanie domen
   - Generowanie unikalnego `projectId`
   - Lista projektów

3. **Kreator danych strukturalnych**
   - Wybór branży/rodzaju działalności
   - Formularz z polami (nazwa firmy, adres, telefon, URL, logo, NIP)
   - Podgląd wygenerowanego JSON-LD
   - Walidacja wymaganych pól

4. **Checkboxy włączania/wyłączania typów**
   ```
   [✓] LocalBusiness
   [✓] OpeningHours
   [✓] AggregateRating
   [ ] Reviews
   [✓] FAQPage
   [ ] Services
   [ ] PriceList
   [✓] Breadcrumb
   ```

5. **Snippet do wklejenia**
   - Jedna linijka kodu:
   ```html
   <script src="https://cdn.dexio.pl/embed.js" 
           data-project="abc123" defer></script>
   ```

6. **Lista schem przypisanych do domeny**
   - Przegląd aktywnych typów
   - Edycja danych
   - Historia zmian
   - Licznik edycji: "Pozostało: 3/5 w tym miesiącu"
   - Ostrzeżenie przy przekroczeniu limitu

### 5.2 Backend API

**Endpoint główny:**
```
GET https://api.dexio.pl/schema?projectId=abc123&url=https://example.com/kontakt
```

**Funkcjonalność:**
- Pobiera wszystkie schematy dla `projectId`
- Filtruje tylko te z `enabled = true`
- Zwraca tablicę JSON-LD
- Cache dla wydajności (Cloudflare/Redis)

### 5.3 Embed.js (skrypt kliencki)

**Zadania:**
1. Pobiera `data-project` ze snippetu
2. Wywołuje API `/schema`
3. Tworzy element `<script type="application/ld+json">`
4. Wstrzykuje do `<head>` dokumentu

**Przykładowy kod:**
```javascript
document.addEventListener("DOMContentLoaded", function () {
  const scriptTag = document.querySelector('[data-project]');
  const projectId = scriptTag.getAttribute('data-project');
  const currentUrl = window.location.href;
  
  fetch(`https://api.dexio.pl/schema?projectId=${projectId}&url=${currentUrl}`)
    .then(r => r.json())
    .then(data => {
      if (!data?.length) return;
      
      const el = document.createElement("script");
      el.type = "application/ld+json";
      el.textContent = JSON.stringify(data);
      document.head.appendChild(el);
    });
});
```

---

## 6. JAK TO DZIAŁA – KROK PO KROKU

### 6.1 Przepływ użytkownika

1. **Klient zakłada konto**
   - Rejestracja w panelu
   - Dodaje domenę `example.com`

2. **System generuje projektId**
   - Unikalny identyfikator: `abc123`
   - Generuje snippet do wklejenia

3. **Wypełnienie danych w panelu**
   - Wybór branży (np. "Lokalne usługi")
   - Formularz: nazwa, adres, telefon, godziny, opinie
   - System zapisuje JSON w bazie

4. **Wklejenie snippetu na stronę**
   - Klient wkleja w `<head>` lub przed `</body>`
   - Jeden raz, działa globalnie

5. **Automatyczne wstrzykiwanie danych**
   - Użytkownik wchodzi na stronę
   - `embed.js` wywołuje API
   - Otrzymuje JSON-LD
   - Wstrzykuje do dokumentu
   - Google i AI widzą dane strukturalne

### 6.2 Schemat techniczny

```
Strona klienta
    ↓
<script data-project="abc123">
    ↓
embed.js ładuje się
    ↓
GET /api/schema?projectId=abc123&url=...
    ↓
Backend: pobiera z bazy WHERE enabled=true
    ↓
Zwraca JSON-LD
    ↓
embed.js wstrzykuje <script type="application/ld+json">
    ↓
Google/AI crawluje i indeksuje dane
```

---

## 7. BAZA DANYCH – MODEL

### 7.1 Tabela: `projects`

| Kolumna | Typ | Opis |
|---------|-----|------|
| id | UUID | ID projektu |
| user_id | UUID | Właściciel |
| domain | VARCHAR | example.com |
| project_id | VARCHAR | abc123 (unikalny) |
| created_at | TIMESTAMP | Data utworzenia |

### 7.1b Tabela: `users` (Supabase Auth + custom fields)

| Kolumna | Typ | Opis |
|---------|-----|------|
| id | UUID | ID użytkownika (Supabase auth.users) |
| email | VARCHAR | Email (z Supabase Auth) |
| is_promo | BOOLEAN | Czy ma cenę promocyjną |
| domain_count | INTEGER | Liczba aktywnych domen |
| subscription_status | VARCHAR | active/cancelled/expired |
| stripe_customer_id | VARCHAR | ID klienta w Stripe |
| created_at | TIMESTAMP | Data rejestracji |

**Uwaga:** Podstawowe dane auth (email, hasło, verification) zarządzane przez Supabase `auth.users`.  
Tabela `users` przechowuje tylko dodatkowe dane biznesowe.

### 7.2 Tabela: `schemas`

| Kolumna | Typ | Opis |
|---------|-----|------|
| id | UUID | ID schematu |
| project_id | VARCHAR | Relacja do projektu |
| type | VARCHAR | LocalBusiness, FAQ, Review |
| enabled | BOOLEAN | Checkbox włącz/wyłącz |
| url_pattern | VARCHAR | `/kontakt`, `*`, `/uslugi/*` |
| json | JSONB | Dane strukturalne |
| created_at | TIMESTAMP | Data utworzenia |
| updated_at | TIMESTAMP | Ostatnia edycja |
| edit_count | INTEGER | Liczba edycji (do trackingu) |

### 7.3 Tabela: `schema_edits` (tracking limitów)

| Kolumna | Typ | Opis |
|---------|-----|------|
| id | UUID | ID edycji |
| user_id | UUID | Użytkownik |
| project_id | VARCHAR | Projekt/domena |
| schema_id | UUID | Edytowane schema |
| action | VARCHAR | create/update/toggle |
| month | VARCHAR | YYYY-MM (np. 2025-12) |
| created_at | TIMESTAMP | Timestamp edycji |

**Logika sprawdzania limitu:**
```sql
SELECT COUNT(*) FROM schema_edits 
WHERE user_id = ? 
AND project_id = ? 
AND month = ?
-- Jeśli wynik >= 5 → blokada zapisów
```

### 7.4 Przykładowe rekordy

```json
{
  "id": "uuid-1",
  "project_id": "abc123",
  "type": "LocalBusiness",
  "enabled": true,
  "url_pattern": "*",
  "json": {
    "@type": "LocalBusiness",
    "name": "Firma XYZ",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "ul. Testowa 12",
      "addressLocality": "Warszawa",
      "postalCode": "00-001",
      "addressCountry": "PL"
    },
    "telephone": "+48 123 456 789",
    "openingHours": "Mo-Fr 09:00-17:00"
  }
}
```

---

## 8. ROADMAP

### 8.1 Etap 1: MVP na własne potrzeby

- Panel z logowaniem
- Dodawanie domen i generowanie `projectId`
- Tabela `schemas` w bazie
- Tabela `schema_edits` do trackingu limitów
- API `GET /schema`
- `embed.js` w wersji podstawowej
- Cache (Cloudflare lub Redis)
- System limitu 5 edycji/miesiąc z licznikiem w UI

**Czas realizacji:** 2-4 tygodnie  
**Cel:** Testowanie na własnych domenach (Wizaro, WebWipers, itd.)

### 8.2 Etap 2: Produkt płatny

- Integracja z płatnościami (Stripe/PayU/Przelewy24)
- System liczenia domen i dopłat (+25%)
- Cena promocyjna vs regularna
- Link do Google Rich Results Test
- Logi ostatnich wywołań
- Proste statystyki (ile razy załadowano schema)

**Czas realizacji:** 3-5 tygodni  
**Cel:** Pierwsi płacący klienci w cenie promocyjnej 49 zł

### 8.3 Etap 3: Funkcje rozszerzone

- Auto-wypełnianie danych z OpenGraph
- Rozszerzenie typów: Product, Service, Review, Event, BreadcrumbList
- Audyt: analiza braków w schema
- Eksport danych JSON-LD
- Historia zmian (versioning)
- API dla developerów

**Czas realizacji:** 6-8 tygodni  
**Cel:** Stabilny produkt z pełną funkcjonalnością

### 8.4 Etap 4: AI Features

- Automatyczne generowanie FAQ z treści strony (AI)
- Sugestie ulepszeń danych strukturalnych
- A/B testing różnych wersji schema
- Monitoring pozycji w AI Search
- Integracje z platformami (WordPress plugin, Shopify app)

---

## 9. PLATFORMY, KTÓRE WYKORZYSTUJĄ DANE STRUKTURALNE

### 9.1 Wyszukiwarki AI

Te systemy pobierają dane ze schema:

- **ChatGPT Search** (OpenAI)
- **Gemini Search** (Google AI)
- **Perplexity AI**
- **Bing AI Search** (Microsoft)
- **DuckDuckGo AI Answers**
- **Qwant AI**
- **Brave AI Search**
- **Kagi AI**
- **Apple Intelligence** (Safari Spotlight)

### 9.2 AI Cards przy linkach

Opinie i dane widoczne pod linkiem w:

- ChatGPT Link Cards
- Gemini Web Cards
- Perplexity Source Cards
- Microsoft Copilot Context Cards
- Safari AI Snippets
- Bing Rich Cards

**Wyświetlają:**
- Gwiazdki i recenzje
- Opis firmy
- Kategorie
- Dane kontaktowe
- FAQ
- Obszar działania
- Ceny

### 9.3 Asystenci głosowi

- Siri AI (Apple Intelligence)
- Gemini Assistant
- Microsoft Copilot Voice
- Alexa AI

### 9.4 Platformy e-commerce

- Google Shopping AI
- Meta Advantage AI
- Amazon AI Search
- Bing Shopping AI

### 9.5 Systemy map

- Google Maps AI
- Apple Maps AI
- Bing Places AI

### 9.6 Social media

- Facebook/Meta AI
- Instagram AI Search
- TikTok Search AI
- LinkedIn Content AI

---

## 10. OBSŁUGIWANE CMS-Y I PLATFORMY

### 10.1 Popularne systemy

**Najważniejsze (priorytet):**
- **WordPress** – 43% rynku, największy potencjał
- **Shopify** – e-commerce
- **Wix** – małe firmy
- **Webflow** – profesjonalne strony
- **Shoper** – polski e-commerce
- **IdoSell** (IAI Shop) – polski e-commerce

**Pozostałe:**
- Squarespace
- Weebly
- Joomla
- Drupal
- TYPO3
- Ghost CMS
- Magento/Adobe Commerce

### 10.2 Frameworki i buildery

- HTML (czysty kod)
- Next.js
- Nuxt
- React
- Angular
- Vue
- Laravel Blade
- Django Templates
- Hugo
- Jekyll
- Astro

### 10.3 Komunikat marketingowy

**"Działa z każdym CMS-em i każdą stroną internetową.**  
**Wystarczy wkleić jeden skrypt."**

---

## 11. WYBÓR BRANŻY I TYPY SCHEMA

### 11.1 System wyboru branży w panelu

**Krok 1:** Użytkownik wybiera branżę z listy:

1. **Medyczna / Zdrowie**
   - Kliniki, lekarze, dentyści, fizjoterapeuci

2. **Hotele i noclegi**
   - Hotele, apartamenty, pensjonaty

3. **Motoryzacja**
   - Warsztaty, komisy, wypożyczalnie, pomoc drogowa

4. **Banki i finanse**
   - Banki, doradcy finansowi, ubezpieczenia

5. **Lokalne usługi**
   - Hydraulicy, elektrycy, sprzątanie, fryzjerzy, pomoc drogowa

6. **E-commerce**
   - Sklepy internetowe, marketplace

7. **Gastronomia**
   - Restauracje, catering, food trucki

8. **Inne / Uniwersalne**
   - Dowolny typ działalności

### 11.2 Automatyczne sugestie schema według branży

**Medyczna / Zdrowie:**
- LocalBusiness
- MedicalOrganization
- Physician
- MedicalClinic
- Review
- AggregateRating
- FAQ

**Hotele i noclegi:**
- LocalBusiness
- Hotel / LodgingBusiness
- HotelRoom
- Offer
- AggregateRating
- Review

**Motoryzacja:**
- LocalBusiness
- AutoRepair / AutoDealer
- Product
- Offer
- Review
- Service

**Banki i finanse:**
- LocalBusiness
- BankOrCreditUnion
- FinancialProduct
- MortgageLoan
- Service

**Lokalne usługi:**
- LocalBusiness
- Service
- PriceList
- AreasServed
- FAQ
- Review
- OpeningHours

**E-commerce:**
- Organization
- Product
- Offer
- AggregateOffer
- Review
- AggregateRating
- Breadcrumb

**Gastronomia:**
- Restaurant
- LocalBusiness
- Menu
- OpeningHours
- Review
- AggregateRating

### 11.3 Dane z Schema.org

**Statystyki vocabularium Schema.org:**
- **827 typów** (Types)
- **1528 właściwości** (Properties)
- **14 typów danych** (Datatypes)
- **94 enumeracje** (Enumerations)
- **522 elementy enumeracji**

**Najważniejsze kategorie:**
- Creative works (Book, Movie, Recipe, Article)
- Embedded objects (Audio, Image, Video)
- Events
- Organizations & People
- Places & Businesses
- Products & Offers
- Reviews & Ratings

---

## 12. CO JEŚLI STRONA MA JUŻ SCHEMA?

### 12.1 Rozwiązanie techniczne

**Skrypt wykrywa istniejące schema:**
1. Sprawdza wszystkie `<script type="application/ld+json">`
2. Rozpoznaje typy (LocalBusiness, FAQ, etc.)
3. Pobiera zawartość
4. Porównuje z danymi z panelu

### 12.2 Tryby działania

**Tryb A: Override (nadpisanie)**
- Wszystkie kluczowe schematy nadpisywane przez panel
- Dla klientów z przestarzałym/błędnym schema

**Tryb B: Augment (uzupełnienie)**
- Dodawanie tylko brakujących typów
- Reviews, FAQ, Services, PriceList
- Zachowanie istniejącego schema

### 12.3 Komunikat dla klienta

**"Jeśli masz już schema – super.**  
**Nasz system go rozszerzy i poprawi, żeby wyszukiwarki AI wyświetlały Twoją firmę z większą ilością informacji."**

**Argumenty:**
- Większość stron ma schema z 2018-2020 (stare standardy)
- AI wymaga bogatszych danych niż Google
- Klasyczne schema: 5-10 pól
- Nasze schema: 80-150 pól
- Realna różnica w wynikach AI Search

---

## 13. STRATEGIA MARKETINGOWA

### 13.1 Jak NIE wspominać o "schema"

**Schema to mechanizm, nie produkt.**

**Zamiast "schema markup" używaj:**
- AI Visibility Layer
- AI Search Boost Module
- AI Rich Data Engine
- AI Business Profile Enhancer
- HyperData Injection
- AI Web Meta Engine

### 13.2 Komunikaty marketingowe

**Główny:**
"Wprowadzimy dla Ciebie warstwę danych z opisem usług, opiniami, kategoriami, godzinami i zakresem działalności, które są odczytywane przez wyszukiwarki AI takie jak ChatGPT, Gemini czy Perplexity. Dzięki temu Twoja firma pojawia się z pełną kartą informacyjną pod linkiem."

**Krótki:**
"Zoptymalizuj swoją stronę pod wyszukiwarki AI – jeden skrypt, pełna widoczność."

**FAQ-style:**
- "Czy musicie zmieniać coś na mojej stronie?"
- "Tylko jedna linijka kodu – resztą zajmujemy się my."

### 13.3 Elementy landing page

**Hero section:**
- Nagłówek: "Twoja firma widoczna w ChatGPT, Gemini i innych wyszukiwarkach AI"
- Podnagłówek: "Jeden skrypt. Pełna karta firmowa. Więcej klientów."
- CTA: "Zacznij teraz - 49 zł/msc" / "Zarejestruj się"
- Podkreślenie: "Cena promocyjna: 49 zł zamiast 99 zł"

**Sekcja: Jak to działa**
1. Wklejasz jeden skrypt na stronę
2. Wypełniasz dane w panelu
3. AI wyświetla Twoją firmę z pełnymi informacjami

**Sekcja: Dlaczego to działa**
- Opinie pod linkiem
- Pełny opis firmy
- Godziny, lokalizacja, usługi
- Większa klikalność
- Wyższy trust

**Sekcja: Dla kogo**
- Małe i średnie firmy
- Agencje SEO
- Twórcy stron
- E-commerce

**Sekcja: Pricing**
- Jeden prosty plan: 49 zł/msc (promocja) lub 99 zł/msc (regularna)
- Przejrzyste ceny brutto w PLN
- Każda dodatkowa domena +25%
- Kalkulator ceny (slider: ile domen?)
- Płatność miesięczna z możliwością anulowania w każdym momencie

**Sekcja: Kompatybilność**
- Grid z logotypami CMS-ów
- "Działa z każdą platformą"

**FAQ:**
- Czy to bezpieczne dla SEO?
- Czy Google to akceptuje?
- Co jeśli mam już schema?
- Jak szybko zobaczę efekty?
- Dlaczego tylko 5 edycji miesięcznie?
  - "To ochrona Twojego pozycjonowania – zbyt częste zmiany danych strukturalnych mogą zaszkodzić SEO. 5 edycji to więcej niż wystarczająco dla typowych potrzeb biznesowych."

---

## 14. INTEGRACJA Z ISTNIEJĄCYMI PROJEKTAMI

### 14.1 Wizaro i sieć stron usuwania opinii

**Zastosowanie:**
- Zarządzanie schema na dziesiątkach domen
- Jedno narzędzie do wszystkich stron
- Spójne dane we wszystkich lokalizacjach

**Korzyści:**
- Lepsze pozycjonowanie w AI Search dla usług ORM
- Opinie i gwiazdki widoczne przy wszystkich domenach
- Centralne zarządzanie danymi firmowymi

### 14.2 Sprzedaż jako dodatek do usług SEO

**Pakiety:**
- Podstawowy SEO + AI Search Optimization
- Usuwanie opinii + AI Visibility Boost
- Reputacja online + AI Rich Data

**Argumenty sprzedażowe:**
- "Klasyczne SEO to za mało – AI Search to przyszłość"
- "Twoi konkurenci już tam są – czas dołączyć"

### 14.3 Bonus dla abonentów

**Z-polecenia.pl i inne projekty:**
- Schema optimizer jako bonus w pakiecie premium
- Dodatkowa wartość dla klientów
- Różnicowanie od konkurencji

---

## 15. FUNKCJE ZAAWANSOWANE (PRZYSZŁOŚĆ)

### 15.1 Checkboxy per URL

**Możliwość włączania schema dla konkretnych ścieżek:**

```
/kontakt → LocalBusiness, OpeningHours
/uslugi/* → Service, PriceList
/opinie → Review, AggregateRating
* (globalnie) → Breadcrumb, Organization
```

### 15.2 Wykrywanie duplikatów

- Automatyczne sprawdzanie istniejącego schema
- Sugestie wyłączenia duplikatów
- Podświetlenie konfliktów

### 15.3 Tryby predefiniowane

**One-click presets:**
- Basic SEO (minimum)
- AI Boost (full optimization)
- E-commerce Pack
- Local Business Pack
- Review Focus

### 15.4 AI-powered suggestions

- Generowanie FAQ z treści strony
- Automatyczne wykrywanie usług
- Sugestie obszarów działania
- Proponowane kategorie

### 15.5 Analytics

- Ile razy schema zostało załadowane
- Które typy są aktywne
- Monitoring błędów
- Statystyki użycia API

### 15.6 Integracje

- Plugin WordPress (one-click setup)
- Shopify App
- Wix App
- API dla developerów
- Zapier / Make.com

---

## 16. TECHNOLOGIE (PROPOZYCJA STACKU)

### 16.1 Frontend (Panel)

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui lub Radix UI
- **State:** React Context / Zustand
- **Forms:** React Hook Form + Zod

### 16.2 Backend

- **API:** Next.js API Routes (App Router)
- **Database:** PostgreSQL (Supabase)
- **ORM:** Supabase Client (JavaScript SDK)
- **Auth:** Supabase Auth (wbudowane)
- **Cache:** Redis (Upstash) / Cloudflare KV
- **CDN:** Cloudflare (dla embed.js)

### 16.3 Autentykacja

- **Auth:** Supabase Auth (natywna integracja)
- **Metody logowania:**
  - Email + password
  - Magic Link (passwordless)
  - OAuth: Google (opcjonalnie: Facebook, GitHub)
- **Session management:** Supabase (JWT tokens)
- **Row Level Security (RLS):** Supabase PostgreSQL policies
- **Email verification:** Wbudowane w Supabase
- **Reset hasła:** Wbudowane w Supabase

### 16.4 Płatności

- **Gateway:** Stripe (międzynarodowe) / PayU (PL)
- **Subscriptions:** Stripe Billing

### 16.5 Hosting

- **Frontend + API:** Vercel (Next.js App Router)
- **Database + Auth:** Supabase (PostgreSQL + Auth + Storage)
- **CDN:** Cloudflare (embed.js, statyczne assety)
- **Cache:** Upstash Redis / Cloudflare KV
- **Monitoring:** Sentry (errors) + PostHog (analytics)
- **Emails:** Supabase (transactional) / Resend (marketing)

### 16.6 Embed.js

- **Vanilla JavaScript** (bez zależności)
- **Minifikacja:** Terser
- **Rozmiar:** < 5KB
- **Lazy load:** async/defer

### 16.7 Architektura Supabase

**Wykorzystywane funkcje Supabase:**

1. **Authentication (Supabase Auth)**
   - Email/password
   - Magic Links
   - OAuth providers
   - JWT session management
   - Email templates (custom)

2. **Database (PostgreSQL)**
   - Tabele: users, projects, schemas, schema_edits
   - Row Level Security (RLS) policies:
     ```sql
     -- Przykład: user może edytować tylko swoje projekty
     CREATE POLICY "Users can update own projects"
     ON projects FOR UPDATE
     USING (auth.uid() = user_id);
     ```

3. **Realtime (opcjonalnie)**
   - Powiadomienia o zbliżającym się limicie edycji
   - Live updates w panelu

4. **Edge Functions (opcjonalnie)**
   - Alternatywa dla Next.js API Routes
   - Endpoint GET /schema może być Supabase Edge Function

5. **Storage (przyszłość)**
   - Upload logo firmy
   - Zdjęcia produktów
   - Pliki JSON-LD do pobrania

**Bezpieczeństwo:**
- RLS policies na wszystkich tabelach
- API keys (anon/service) w environment variables
- HTTPS only
- Rate limiting na API endpoints

---

## 17. METRYKI SUKCESU

### 17.1 Faza MVP

- [ ] 10 pierwszych użytkowników (własne projekty)
- [ ] Schema działające na 20+ domenach
- [ ] Stabilność API 99.9%
- [ ] Czas ładowania < 100ms

### 17.2 Faza Beta

- [ ] 50 płacących klientów
- [ ] MRR: 3,000 PLN (średnio 60 zł/klient)
- [ ] NPS > 40
- [ ] Churn < 5%
- [ ] Średnia liczba domen na klienta: 1.5

### 17.3 Faza Growth

- [ ] 500 płacących klientów
- [ ] MRR: 35,000 PLN
- [ ] Średnia liczba domen na klienta: 2.5
- [ ] 20+ klientów z 5+ domenami
- [ ] Plugin WordPress > 1000 instalacji

### 17.4 KPI długoterminowe

- Customer Lifetime Value (LTV)
- Customer Acquisition Cost (CAC)
- LTV/CAC ratio > 3:1
- Monthly Recurring Revenue (MRR)
- Annual Recurring Revenue (ARR)

---

## 18. RYZYKA I MITYGACJE

### 18.1 Techniczne

**Ryzyko:** Google/AI zmienia sposób crawlowania
**Mitygacja:** Monitoring zmian, szybkie update'y

**Ryzyko:** Wolne API, duże obciążenie
**Mitygacja:** Aggressive caching, CDN, rate limiting

**Ryzyko:** Błędy w generowanym JSON-LD
**Mitygacja:** Walidacja, testy automatyczne, podgląd

### 18.2 Biznesowe

**Ryzyko:** Konkurencja (podobne narzędzia)
**Mitygacja:** Szybkie wejście na rynek, unikalna propozycja (AI focus)

**Ryzyko:** Niski popyt / trudna edukacja rynku
**Mitygacja:** Content marketing, case studies, darmowy trial

**Ryzyko:** Użytkownicy niezadowoleni z limitu 5 edycji
**Mitygacja:** Jasne uzasadnienie (SEO + performance), elastyczność w szczególnych przypadkach, komunikacja w FAQ

**Ryzyko:** Wysokie koszty pozyskania klienta
**Mitygacja:** SEO, partnerships z agencjami, affiliate program

### 18.3 Prawne

**Ryzyko:** RODO, dane osobowe
**Mitygacja:** Compliance, polityka prywatności, zgody użytkowników

**Ryzyko:** Odpowiedzialność za błędne dane
**Mitygacja:** Terms of Service, disclaimer, best effort approach

---

## 19. NASTĘPNE KROKI

### 19.1 Prototyp (Tydzień 1-2)

- [ ] Mockupy UI/UX (Figma)
- [ ] Architektura techniczna
- [ ] Setup projektu Next.js 14+ (App Router)
- [ ] Setup Supabase (database + auth)
- [ ] Konfiguracja Supabase Auth (email + magic link)
- [ ] Podstawowy model bazy danych (tabele: projects, schemas, schema_edits)
- [ ] Row Level Security policies w Supabase

### 19.2 MVP (Tydzień 3-6)

- [ ] Panel: rejestracja, login, dashboard (Supabase Auth)
- [ ] Protected routes (middleware z Supabase session)
- [ ] Email verification flow
- [ ] Dodawanie projektów/domen
- [ ] Kreator dla 3 typów: LocalBusiness, FAQ, Review
- [ ] API endpoint GET /schema (Edge Functions lub Next.js API)
- [ ] embed.js v1.0
- [ ] Deploy i pierwsze testy (Vercel + Supabase)

### 19.3 Beta (Tydzień 7-10)

- [ ] Płatności (Stripe)
- [ ] Limity planów
- [ ] Więcej typów schema (10+)
- [ ] Wybór branży
- [ ] Checkboxy enable/disable
- [ ] Pierwsi beta testerzy

### 19.4 Launch (Tydzień 11-12)

- [ ] Landing page
- [ ] Content marketing (blog, SEO)
- [ ] Kampanie reklamowe (Google Ads, Meta)
- [ ] Onboarding email sequence
- [ ] Dokumentacja i pomoc
- [ ] Publiczny launch

---

## 20. PODSUMOWANIE

### 20.1 Kluczowe założenia

1. **Nie sprzedajemy schema – sprzedajemy widoczność w AI**
2. **Jeden skrypt – zero ingerencji w kod strony**
3. **Panel do zarządzania wszystkim**
4. **Jeden prosty plan: 49 zł promocja, 99 zł regularna + 25% za każdą domenę**
5. **MVP w 6 tygodni, Beta w 10**
6. **Domena: dexio.pl**

### 20.2 Unikalna wartość

- Pierwszy produkt w PL stricte pod AI Search
- Prostota wdrożenia (jak Cookiebot)
- Brak konkurencji bezpośredniej
- Rynek w fazie edukacji (wczesny wejście = przewaga)

### 20.3 Potencjał

- Globalny rynek SEO/AI optimization: multimiliardy dolarów
- Polski rynek: tysiące małych firm, agencji SEO
- Możliwość ekspansji międzynarodowej
- Potencjał na akwizycję/exit

### 20.4 Filozofia produktu

**"Make AI see your business clearly."**

Użytkownik nie musi wiedzieć jak to działa technicznie – musi tylko zobaczyć efekt: jego firma jest lepiej widoczna w ChatGPT, Gemini, Perplexity i innych AI.

---

## ZAŁĄCZNIKI

### A. Przykładowy JSON-LD (LocalBusiness)

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Pomoc Drogowa Warszawa 24/7",
  "image": "https://example.com/logo.png",
  "telephone": "+48 123 456 789",
  "email": "kontakt@example.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "ul. Marszałkowska 12",
    "addressLocality": "Warszawa",
    "postalCode": "00-001",
    "addressCountry": "PL"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "52.2297",
    "longitude": "21.0122"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "00:00",
      "closes": "23:59"
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127"
  },
  "priceRange": "$$",
  "areaServed": [
    {
      "@type": "City",
      "name": "Warszawa"
    },
    {
      "@type": "City",
      "name": "Kraków"
    }
  ]
}
```

### B. Przykładowy snippet dla klienta

```html
<!-- Wklej ten kod w sekcji <head> swojej strony -->
<script src="https://cdn.dexio.pl/embed.js" 
        data-project="abc123" 
        defer></script>
<!-- Dexio.pl - AI Search Optimizer -->
```

### C. Linki referencyjne

- Schema.org dokumentacja: https://schema.org/docs/schemas.html
- Google Rich Results Test: https://search.google.com/test/rich-results
- Schema.org validator: https://validator.schema.org/

---

**Koniec dokumentacji koncepcyjnej**  
**Wersja:** 1.0  
**Data:** 21 grudnia 2025
