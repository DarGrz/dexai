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

_Ostatnia aktualizacja: 27 grudnia 2025_
