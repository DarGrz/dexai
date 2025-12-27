# Migracja bazy danych - Dodanie tabeli Pages

## Błąd
```
Could not find the table 'public.pages' in the schema cache
```

## Rozwiązanie

### Krok 1: Otwórz Supabase Dashboard
1. Przejdź do https://supabase.com/dashboard
2. Wybierz swój projekt
3. W menu bocznym kliknij **SQL Editor**

### Krok 2: Wykonaj migrację
1. Kliknij **New query**
2. Skopiuj całą zawartość pliku `supabase/migrations/add_pages_table.sql`
3. Wklej do edytora SQL
4. Kliknij **Run** (lub Ctrl+Enter)

### Krok 3: Zweryfikuj
Po wykonaniu migracji sprawdź w **Table Editor**, czy:
- ✅ Tabela `pages` została utworzona
- ✅ Tabela `schemas` ma kolumnę `page_id` zamiast `project_id`
- ✅ Istniejące schematy zostały zmigrowane do strony głównej "/"

### Co robi ta migracja?

1. **Tworzy tabelę `pages`** - dla zarządzania podstronami
2. **Dodaje `page_id` do `schemas`** - każdy schemat należy teraz do konkretnej podstrony
3. **Migruje dane** - istniejące schematy są przenoszone do domyślnej strony głównej "/"
4. **Usuwa `project_id` z `schemas`** - po migracji danych
5. **Aktualizuje RLS policies** - dla nowej struktury

### Plik do wykonania
`supabase/migrations/add_pages_table.sql`

---

### Alternatywa: Ręczne wykonanie przez terminal

Jeśli masz dostęp do połączenia PostgreSQL:

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres" < supabase/migrations/add_pages_table.sql
```
