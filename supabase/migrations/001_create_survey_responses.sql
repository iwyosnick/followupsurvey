-- ElderGuideSurvey: Create survey_responses table
-- Migration: 001_create_survey_responses

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  client_id text NOT NULL,
  loved_one text NOT NULL,
  facility text NOT NULL,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback_text text
);

-- 2. One response per client per facility (Critique C-2: dedup)
ALTER TABLE public.survey_responses
  ADD CONSTRAINT survey_responses_client_facility_unique
  UNIQUE (client_id, facility);

-- 3. Enable RLS
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- 4. Allow anonymous inserts only (public-facing form)
CREATE POLICY "Allow anonymous inserts"
  ON public.survey_responses
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 5. Block all reads for anon (private data)
-- No SELECT policy = implicit deny for anon role.

-- 6. Index for webhook queries (optional, useful for admin dashboards later)
CREATE INDEX IF NOT EXISTS idx_survey_responses_rating
  ON public.survey_responses (rating);

CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at
  ON public.survey_responses (created_at DESC);
