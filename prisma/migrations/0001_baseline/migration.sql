-- Baseline: estado atual do banco (profiles criada pelo Supabase)
CREATE TABLE IF NOT EXISTS "profiles" (
    "id" UUID NOT NULL,
    "plan_type" TEXT NOT NULL DEFAULT 'free',
    "subscription_id" TEXT,
    "subscription_status" TEXT NOT NULL DEFAULT 'pending',
    "subscription_updated_at" TIMESTAMP(3),
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "stripe_customer_id" TEXT,
    "study_days" TEXT[],
    "hours_per_day" INTEGER,
    "subject_levels" JSONB,
    "show_tutorial" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);
