-- Add daily affirmation opt-in to callers table
ALTER TABLE callers ADD COLUMN daily_affirmation_opt_in BOOLEAN NOT NULL DEFAULT FALSE;
