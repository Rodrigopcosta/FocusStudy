-- CreateEnum
CREATE TYPE "public"."plan_type" AS ENUM ('free', 'pro_monthly', 'pro_annual', 'premium');

-- CreateEnum
CREATE TYPE "public"."subscription_status" AS ENUM ('none', 'pending', 'authorized', 'active', 'paused', 'cancelled', 'rejected');

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" UUID NOT NULL,
    "plan_type" "public"."plan_type" NOT NULL DEFAULT 'free',
    "subscription_id" TEXT,
    "subscription_status" "public"."subscription_status" NOT NULL DEFAULT 'none',
    "subscription_updated_at" TIMESTAMP(3),
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "device_id" TEXT,
    "cpf_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "profiles_plan_type_idx" ON "public"."profiles"("plan_type");

-- CreateIndex
CREATE INDEX "profiles_subscription_id_idx" ON "public"."profiles"("subscription_id");

-- AddForeignKey
ALTER TABLE "public"."profiles"
  ADD CONSTRAINT "profiles_id_fkey"
  FOREIGN KEY ("id") REFERENCES "auth"."users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
