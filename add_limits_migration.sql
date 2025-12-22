-- Dodaj kolumny max_domains i max_edits_per_month do user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS max_domains INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_edits_per_month INTEGER DEFAULT 5;

-- Ustaw wartości dla istniejących użytkowników
UPDATE public.user_profiles 
SET max_domains = 1, max_edits_per_month = 5
WHERE max_domains IS NULL OR max_edits_per_month IS NULL;
