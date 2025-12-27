# TODO - Funkcje do implementacji później

## 🔍 IndexNow - Automatyczna indeksacja w Bing/wyszukiwarkach AI

### Koncepcja
Automatyczne zgłaszanie stron klientów do IndexNow API (Bing, Yandex, wyszukiwarki AI jak ChatGPT/Copilot).

### Wymagania techniczne
1. **Generowanie klucza IndexNow**
   - Losowy UUID dla każdego projektu
   - Przechowywanie w tabeli `projects.indexnow_key`

2. **Plik weryfikacyjny dla klienta**
   - Przycisk "Pobierz plik IndexNow" w dashboardzie
   - Generuje plik: `{uuid}.txt` z zawartością = UUID
   - Klient wgrywa na główny katalog swojej strony

3. **Weryfikacja**
   - Przycisk "Sprawdź połączenie"
   - Robi GET: `https://domena-klienta.pl/{uuid}.txt`
   - Jeśli zwraca poprawny klucz → aktywuje IndexNow dla projektu

4. **Automatyczne wysyłanie (Cron)**
   - Raz dziennie o 2:00 w nocy
   - Zbiera wszystkie strony gdzie `updated_at > last_24h`
   - Grupuje po projekcie
   - Wysyła batch request do `https://api.indexnow.org/indexnow`

5. **Manualny przycisk**
   - "Wyślij do indeksacji teraz" w dashboard projektu
   - Dla pilnych zmian

### Struktura bazy danych

```sql
-- Dodać do tabeli projects
ALTER TABLE projects ADD COLUMN indexnow_key UUID;
ALTER TABLE projects ADD COLUMN indexnow_enabled BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN indexnow_last_verified_at TIMESTAMPTZ;

-- Nowa tabela dla logów
CREATE TABLE indexnow_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  urls TEXT[] NOT NULL,
  status TEXT NOT NULL, -- 'success', 'failed'
  response_code INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracking zmian
ALTER TABLE pages ADD COLUMN last_indexed_at TIMESTAMPTZ;
ALTER TABLE schemas ADD COLUMN last_indexed_at TIMESTAMPTZ;
```

### Endpoint API

**POST `/api/indexnow`**
```json
{
  "projectId": "abc123",
  "urls": ["/", "/oferta", "/kontakt"]
}
```

**Response:**
```json
{
  "success": true,
  "urlCount": 3,
  "status": 202
}
```

### UI w dashboardzie

```
┌─────────────────────────────────────────┐
│ 📡 Indeksacja w Bing (IndexNow)         │
├─────────────────────────────────────────┤
│ Status: ✅ Aktywne                      │
│ Ostatnia weryfikacja: 2025-12-27        │
│                                          │
│ [Pobierz plik weryfikacyjny]            │
│ [Sprawdź połączenie]                    │
│ [Wyślij do indeksacji teraz]            │
│                                          │
│ Automatyczne wysyłanie: Włączone        │
│ Ostatnie wysłanie: 2025-12-27 02:00     │
│ Wysłanych stron dzisiaj: 12             │
└─────────────────────────────────────────┘
```

### Limity
- IndexNow: 10,000 URL/dzień (jeden klucz może obsłużyć ~800 projektów po 12 stron/dzień)
- Batch request: do 10,000 URL w jednym POST

### Monetyzacja (płatna funkcja)
- Plan darmowy: Wyłączone
- Plan PRO: Automatyczne IndexNow (1x dzień)
- Plan PREMIUM: + Priorytetowa indeksacja (manualny przycisk bez limitów)

### Technologie
- Supabase Edge Functions (cron job)
- Next.js API Routes
- IndexNow API (bez wymaganej rejestracji/klucza API)

---

## 📄 Sitemap Generator (opcjonalnie)

### Koncepcja
Endpoint generujący sitemap.xml dla stron klienta.

**Rezygnujemy na rzecz:**
- Klient sam zarządza sitemap
- IndexNow wystarczy dla Bing/AI
- Google crawluje strony naturalnie

---

## 🔧 Plugin WordPress (przyszłość)

### Koncepcja
Plugin WP który automatycznie:
- Tworzy endpoint `/{uuid}.txt` zwracający klucz
- Integruje się z DexAI
- Eliminuje potrzebę ręcznego wgrywania pliku

### Wymagania
- Znajomość PHP/WordPress
- Publikacja w WordPress Plugin Directory
- Instrukcja instalacji w dashboardzie

---

## 📧 Email Notifications - System powiadomień mailowych

### Koncepcja
Automatyczne maile dla użytkowników z informacjami o subskrypcji, przypomnieniami i notyfikacjami.

### Rodzaje maili

**1. Welcome Email**
- Wysyłka: Po pierwszym zalogowaniu
- Zawartość: Przewodnik quick start, link do dokumentacji, CTA "Utwórz pierwszy projekt"

**2. Trial Ending (dla planów z trial)**
- Wysyłka: 3 dni przed końcem trial
- Zawartość: Przypomnienie o końcu okresu próbnego, link do płatności, podsumowanie użycia

**3. Payment Notifications**
- Wysyłka: Po udanym/nieudanym payment
- Zawartość:
  - ✅ Sukces: Potwierdzenie płatności, faktura, następna data
  - ❌ Błąd: Instrukcje aktualizacji metody płatności, retry info

**4. Subscription Changes**
- Wysyłka: Po upgrade/downgrade/cancel
- Zawartość: Potwierdzenie zmian, nowe limity, data wejścia w życie

**5. Monthly Summary (engagement email)**
- Wysyłka: Pierwszy dzień miesiąca
- Zawartość:
  - Statystyki: ile razy schemas wyświetlone (z API analytics)
  - Nowe features/updates
  - Tips & tricks dla lepszego SEO

**6. Inactive User Re-engagement**
- Wysyłka: 14 dni bez logowania
- Zawartość: "Tęsknimy za Tobą", nowe features, oferta pomocy

**7. Invoice/Receipt Emails**
- Wysyłka: Co miesiąc po płatności
- Zawartość: Faktura VAT (integracja z Stripe Tax/InFakt)

### Struktura bazy danych

```sql
-- Tabela email templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- 'welcome', 'trial_ending', etc.
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT NOT NULL,
  variables JSONB, -- {firstName}, {projectCount}, etc.
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log wysłanych maili
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  template_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  status TEXT NOT NULL, -- 'sent', 'failed', 'bounced', 'opened', 'clicked'
  provider_message_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ
);

-- User preferences
ALTER TABLE profiles ADD COLUMN email_preferences JSONB DEFAULT '{
  "marketing": true,
  "product_updates": true,
  "monthly_summary": true,
  "billing": true
}';
```

### Technologie

**Email Provider (wybierz jeden):**

1. **Resend.com** (polecane dla Next.js)
   - 100 maili/dzień FREE
   - 3,000/miesiąc = $20
   - React Email support
   - Prosty API

2. **SendGrid**
   - 100 maili/dzień FREE
   - 50,000/miesiąc = $19.95
   - Dobre analytics

3. **Postmark**
   - 100 maili/miesiąc FREE (tylko trial)
   - 10,000/miesiąc = $15
   - Najlepsze delivery rates

**Email Templates:**
- **React Email** - komponenty React do maili (https://react.email)
- Preview w dev mode
- TypeScript support

### API Endpoint

**POST `/api/emails/send`**
```typescript
{
  userId: string;
  template: 'welcome' | 'trial_ending' | 'payment_success';
  variables: Record<string, any>;
}
```

### UI w dashboardzie (Admin)

```
┌──────────────────────────────────────┐
│ 📧 Email Preferences                 │
├──────────────────────────────────────┤
│ ☑ Marketing emails                   │
│ ☑ Product updates                    │
│ ☑ Monthly summary                    │
│ ☑ Billing notifications              │
│                                       │
│ [Zapisz ustawienia]                  │
└──────────────────────────────────────┘
```

### Implementacja (fazy)

**Faza 1 (MVP):**
- Welcome email (Resend)
- Payment success/failed (Stripe webhooks)

**Faza 2:**
- Trial ending
- Monthly summary
- Invoice emails

**Faza 3:**
- Re-engagement campaigns
- A/B testing templates
- Advanced analytics (open rates, click rates)

### Compliance (RODO/GDPR)
- ✅ Unsubscribe link w każdym mailu
- ✅ Email preferences w settings
- ✅ Clear consent przy rejestracji
- ✅ Data retention policy (usuń logi po 90 dni)

### Koszty (przy Resend)
- 0-3000 maili/m: $20
- 10,000 użytkowników × 2 maile/m = 20,000 maili
- Koszt: ~$40-60/miesiąc

---

## 💬 Live Chat Support

### Koncepcja
Widget live chat dla klientów DexAI + możliwie chat dla klientów klientów (white-label).

### Opcje implementacji

**1. Tawk.to (FREE, najprostsze)**
- ✅ Darmowy forever
- ✅ Widget gotowy
- ✅ Mobile apps
- ✅ Email notifications
- ❌ Branding (logo Tawk)
- ❌ Ograniczone customization

**2. Crisp (freemium)**
- ✅ FREE do 2 operatorów
- ✅ Ładny UI
- ✅ Chatbots
- ✅ Knowledge base
- 💰 $25/m per operator

**3. Intercom (premium)**
- ✅ Najlepszy UX
- ✅ Automation & bots
- ✅ Product tours
- 💰 $74/m (DROGO)

**4. Custom (własny chat)**
- ✅ Pełna kontrola
- ✅ White-label ready
- ❌ Dużo pracy (WebSockets, real-time DB)
- Stack: Supabase Realtime + React

### Rekomendacja (dla startu)

**Tawk.to dla MVP:**
```html
<!-- Dodać do layout.tsx -->
<script type="text/javascript">
var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/{PROPERTY_ID}/default';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();
</script>
```

**Pozycjonowanie:**
- Dashboard: Prawy dolny róg (standard)
- Landing page: Prawy dolny róg
- FAQ: "Potrzebujesz pomocy?" floating button

### Workflow

1. **Użytkownik klika chat widget**
2. **Bot greeting:** "Cześć! 👋 W czym mogę pomóc?"
3. **Quick replies:**
   - "Problemy z integracją"
   - "Pytanie o cennik"
   - "Zgłoś błąd"
   - "Inne"
4. **Agent odpowiada** (lub automated responses dla FAQ)

### Integracja z systemem

```sql
-- Link konwersacji do użytkownika
ALTER TABLE profiles ADD COLUMN tawk_visitor_id TEXT;
```

**Przekazywanie danych do Tawk:**
```javascript
Tawk_API.setAttributes({
  'name': user.name,
  'email': user.email,
  'plan': user.subscription.plan,
  'userId': user.id
}, function(error){});
```

### KPIs do monitorowania
- Average response time
- Customer satisfaction (CSAT)
- Chat volume (ile chats/dzień)
- Top questions → buduj FAQ/dokumentację

### Przyszłość (własny chat)
- Gdy będziesz mieć >500 użytkowników
- Gdy chcesz white-label dla klientów klientów
- Stack: Supabase Realtime + Presence + React
- Koszt dev: ~40-80h pracy

---

## 🔔 In-App Notifications (Toast/Bell Icon)

### Koncepcja
Powiadomienia wewnątrz aplikacji (nie email).

**Przykłady:**
- "✅ Twoja subskrypcja została odnowiona"
- "⚠️ Problem z płatnością - zaktualizuj kartę"
- "🎉 Nowa funkcja: IndexNow teraz dostępne!"
- "📊 Twoje schematy wyświetlone 1,234 razy w tym miesiącu"

### UI Component
- Bell icon w navbar (z badge count)
- Dropdown lista powiadomień
- Toast notifications dla ważnych

### DB Schema
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL, -- 'info', 'success', 'warning', 'error'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT, -- Link do akcji
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
```

### Stack
- Supabase Realtime subscriptions
- React Context/Zustand dla state
- Sonner lub react-hot-toast dla toasts

---

_Ostatnia aktualizacja: 27 grudnia 2025_
