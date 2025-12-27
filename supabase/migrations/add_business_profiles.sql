-- Create business_profiles table
CREATE TABLE IF NOT EXISTS public.business_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES public.projects(project_id) ON DELETE CASCADE,
  
  -- Basic business information
  business_name TEXT NOT NULL,
  legal_name TEXT,
  description TEXT,
  
  -- Contact information
  phone TEXT,
  email TEXT,
  website TEXT,
  
  -- Address
  street_address TEXT,
  address_locality TEXT, -- city
  address_region TEXT, -- state/province
  postal_code TEXT,
  address_country TEXT DEFAULT 'PL',
  
  -- Geolocation
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Opening hours (stored as JSON)
  -- Format: {"monday": {"open": "09:00", "close": "17:00"}, ...}
  opening_hours JSONB,
  
  -- Brand assets
  logo_url TEXT,
  image_urls TEXT[], -- array of additional images
  
  -- Social media (stored as JSON)
  -- Format: {"facebook": "url", "instagram": "url", ...}
  social_media JSONB,
  
  -- Business details
  vat_number TEXT,
  founded_date DATE,
  price_range TEXT, -- $, $$, $$$, $$$$
  
  -- Additional structured data
  payment_accepted TEXT[], -- array of payment methods
  currencies_accepted TEXT[], -- array of currency codes
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(project_id) -- One business profile per project
);

-- Add business_profile_id to projects table (optional, for easier joins)
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS business_profile_id UUID REFERENCES public.business_profiles(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON public.business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_project_id ON public.business_profiles(project_id);

-- Enable Row Level Security
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_profiles
CREATE POLICY "Users can view their own business profiles"
  ON public.business_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own business profiles"
  ON public.business_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business profiles"
  ON public.business_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business profiles"
  ON public.business_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_business_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on business_profiles
CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_business_profile_updated_at();

-- Add max_schemas_per_project to user_profiles (limit 50 schemas per project)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS max_schemas_per_project INTEGER DEFAULT 50;

-- Update existing users
UPDATE public.user_profiles
SET max_schemas_per_project = 50
WHERE max_schemas_per_project IS NULL;
