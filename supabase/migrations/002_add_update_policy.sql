-- ElderGuideSurvey: Add UPDATE policy for anonymous upsert (negative feedback path)
-- Migration: 002_add_update_policy

-- Why USING (feedback_text IS NULL):
-- The UPSERT write-once semantics are intentional. The first write (rating only)
-- leaves feedback_text NULL. The second write (adding feedback text) is the only
-- permitted update. Once feedback_text is set, the row is effectively immutable
-- via the anon role — no further updates are possible. This is a feature, not a
-- bug, for a one-shot survey flow.
--
-- Why WITH CHECK (true):
-- Without this, PostgreSQL defaults to using the USING clause as the check
-- constraint, which would require the NEW feedback_text to also be NULL —
-- making it impossible to actually write feedback. WITH CHECK (true) allows
-- any new row value while still gating on the old row state.

CREATE POLICY "Allow anon feedback update"
  ON public.survey_responses
  FOR UPDATE
  TO anon
  USING (feedback_text IS NULL)
  WITH CHECK (true);
