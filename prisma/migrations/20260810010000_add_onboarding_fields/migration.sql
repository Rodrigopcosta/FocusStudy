-- Add onboarding configuration fields to profiles
ALTER TABLE "public"."profiles"
  ADD COLUMN "study_days" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "hours_per_day" INTEGER NOT NULL DEFAULT 2,
  ADD COLUMN "subject_levels" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN "show_tutorial" BOOLEAN NOT NULL DEFAULT true;
