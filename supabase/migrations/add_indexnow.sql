-- Add IndexNow support for automatic indexing in Bing/AI search engines
-- This enables automatic submission of updated pages to ChatGPT, Copilot, and other AI search engines

-- Add IndexNow columns to projects table
ALTER TABLE projects 
ADD COLUMN indexnow_key UUID DEFAULT gen_random_uuid(),
ADD COLUMN indexnow_enabled BOOLEAN DEFAULT false,
ADD COLUMN indexnow_verified_at TIMESTAMPTZ,
ADD COLUMN indexnow_last_submitted_at TIMESTAMPTZ;

-- Create table for tracking IndexNow submissions
CREATE TABLE indexnow_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  urls TEXT[] NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
  response_code INTEGER,
  error_message TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX idx_indexnow_submissions_project ON indexnow_submissions(project_id, created_at DESC);
CREATE INDEX idx_indexnow_submissions_status ON indexnow_submissions(status, created_at DESC);

-- Add tracking columns to pages and schemas for IndexNow
ALTER TABLE pages 
ADD COLUMN last_indexed_at TIMESTAMPTZ;

ALTER TABLE schemas 
ADD COLUMN last_indexed_at TIMESTAMPTZ;

-- RLS policies for indexnow_submissions
ALTER TABLE indexnow_submissions ENABLE ROW LEVEL SECURITY;

-- Users can view submissions for their own projects
CREATE POLICY "Users can view their own indexnow submissions"
  ON indexnow_submissions
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Users can insert submissions for their own projects
CREATE POLICY "Users can create indexnow submissions for their projects"
  ON indexnow_submissions
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Comment for documentation
COMMENT ON COLUMN projects.indexnow_key IS 'UUID key for IndexNow API verification';
COMMENT ON COLUMN projects.indexnow_enabled IS 'Whether IndexNow automatic submission is enabled';
COMMENT ON COLUMN projects.indexnow_verified_at IS 'When domain verification was last successful';
COMMENT ON TABLE indexnow_submissions IS 'Log of all IndexNow API submissions for tracking and debugging';
