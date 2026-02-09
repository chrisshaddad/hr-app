-- Fix Candidate multi-tenant uniqueness and organization scoping
-- Previous migration created Candidate with a global unique constraint on email:
--   CREATE UNIQUE INDEX "Candidate_email_key" ON "Candidate"("email");
-- The current Prisma schema defines:
--   @@unique([organizationId, email])
--   @@index([organizationId])
-- This migration:
--   1) Ensures Candidate.organizationId exists
--   2) Backfills organizationId from JobApplication where possible
--   3) Makes organizationId NOT NULL when safe
--   4) Replaces global unique(email) with composite unique(organizationId, email)

-- 1. Ensure organizationId column exists on Candidate
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Candidate'
      AND column_name = 'organizationId'
  ) THEN
    ALTER TABLE "Candidate" ADD COLUMN "organizationId" TEXT;
  END IF;
END $$;

-- 2. Backfill organizationId from JobApplication where possible
-- If a candidate has applications, use the organizationId from one of them
UPDATE "Candidate" c
SET "organizationId" = ja."organizationId"
FROM "JobApplication" ja
WHERE ja."candidateId" = c.id
  AND c."organizationId" IS NULL;

-- 3. Make organizationId NOT NULL if all rows are populated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "Candidate"
    WHERE "organizationId" IS NULL
  ) THEN
    ALTER TABLE "Candidate"
    ALTER COLUMN "organizationId" SET NOT NULL;
  END IF;
END $$;

-- 4. Replace global unique(email) with composite unique(organizationId, email)

-- Drop old global unique constraint if it exists
DROP INDEX IF EXISTS "Candidate_email_key";

-- Create composite unique index for multi-tenant uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS "Candidate_organizationId_email_key"
ON "Candidate"("organizationId", "email");

-- Ensure we have an index on organizationId for tenant-scoped queries
CREATE INDEX IF NOT EXISTS "Candidate_organizationId_idx"
ON "Candidate"("organizationId");

-- Keep an index on email for potential lookups
CREATE INDEX IF NOT EXISTS "Candidate_email_idx"
ON "Candidate"("email");


