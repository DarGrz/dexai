-- Create pages table to manage different URLs/subpages within a project
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id TEXT NOT NULL REFERENCES public.projects(project_id) ON DELETE CASCADE,
  
  -- Page details
  name TEXT NOT NULL, -- e.g., "Strona główna", "O nas", "Kontakt"
  url_path TEXT NOT NULL, -- e.g., "/", "/about", "/contact"
  description TEXT, -- Optional description
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(project_id, url_path) -- Each URL path must be unique within a project
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pages_project_id ON public.pages(project_id);
CREATE INDEX IF NOT EXISTS idx_pages_url_path ON public.pages(project_id, url_path);

-- Enable Row Level Security
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pages
DROP POLICY IF EXISTS "Users can view pages of own projects" ON public.pages;
CREATE POLICY "Users can view pages of own projects"
  ON public.pages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.project_id = pages.project_id
      AND projects.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert pages to own projects" ON public.pages;
CREATE POLICY "Users can insert pages to own projects"
  ON public.pages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.project_id = pages.project_id
      AND projects.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update pages of own projects" ON public.pages;
CREATE POLICY "Users can update pages of own projects"
  ON public.pages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.project_id = pages.project_id
      AND projects.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete pages of own projects" ON public.pages;
CREATE POLICY "Users can delete pages of own projects"
  ON public.pages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.project_id = pages.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Trigger to auto-update updated_at on pages
DROP TRIGGER IF EXISTS update_pages_updated_at ON public.pages;
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing schemas to use pages
-- Step 1: Remove old RLS policies that depend on project_id
DROP POLICY IF EXISTS "Users can view schemas of own projects" ON public.schemas;
DROP POLICY IF EXISTS "Users can insert schemas to own projects" ON public.schemas;
DROP POLICY IF EXISTS "Users can update schemas of own projects" ON public.schemas;
DROP POLICY IF EXISTS "Users can delete schemas of own projects" ON public.schemas;

-- Step 2: Add page_id column to schemas (nullable for migration)
ALTER TABLE public.schemas
ADD COLUMN IF NOT EXISTS page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE;

-- Step 3: Create default home page for each existing project
INSERT INTO public.pages (project_id, name, url_path)
SELECT DISTINCT 
  project_id,
  'Strona główna',
  '/'
FROM public.schemas
WHERE NOT EXISTS (
  SELECT 1 FROM public.pages 
  WHERE pages.project_id = schemas.project_id 
  AND pages.url_path = '/'
);

-- Step 4: Migrate existing schemas to the home page
UPDATE public.schemas
SET page_id = (
  SELECT id FROM public.pages
  WHERE pages.project_id = schemas.project_id
  AND pages.url_path = '/'
)
WHERE page_id IS NULL;

-- Step 5: Make page_id NOT NULL after migration
ALTER TABLE public.schemas
ALTER COLUMN page_id SET NOT NULL;

-- Step 6: Update index before dropping project_id
DROP INDEX IF EXISTS idx_schemas_project_id;
CREATE INDEX IF NOT EXISTS idx_schemas_page_id ON public.schemas(page_id);

-- Step 7: Drop old project_id column from schemas
ALTER TABLE public.schemas
DROP COLUMN IF EXISTS project_id;

-- Step 7: Drop old project_id column from schemas
ALTER TABLE public.schemas
DROP COLUMN IF EXISTS project_id;

-- Step 8: Update schema_edits to reference page instead of project
-- Add page_id column
ALTER TABLE public.schema_edits
ADD COLUMN IF NOT EXISTS page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE;

-- Update existing records
UPDATE public.schema_edits
SET page_id = (
  SELECT s.page_id 
  FROM public.schemas s 
  WHERE s.id = schema_edits.schema_id
)
WHERE page_id IS NULL AND schema_id IS NOT NULL;

-- Step 9: Create new RLS policies for schemas to use pages
CREATE POLICY "Users can view schemas of own projects"
  ON public.schemas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      JOIN public.projects ON projects.project_id = pages.project_id
      WHERE pages.id = schemas.page_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert schemas to own projects"
  ON public.schemas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pages
      JOIN public.projects ON projects.project_id = pages.project_id
      WHERE pages.id = schemas.page_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update schemas of own projects"
  ON public.schemas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      JOIN public.projects ON projects.project_id = pages.project_id
      WHERE pages.id = schemas.page_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete schemas of own projects"
  ON public.schemas FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      JOIN public.projects ON projects.project_id = pages.project_id
      WHERE pages.id = schemas.page_id
      AND projects.user_id = auth.uid()
    )
  );
