-- Update JobStatus enum to lowercase and remove CANCELLED
-- Step 1: Create new enum with lowercase values
CREATE TYPE "JobStatus_new" AS ENUM ('draft', 'published', 'closed');

-- Step 2: Add a temporary text column
ALTER TABLE "Job" ADD COLUMN "status_temp" TEXT;

-- Step 3: Convert existing data to lowercase text
UPDATE "Job" SET "status_temp" = LOWER("status"::text) WHERE "status"::text IN ('DRAFT', 'PUBLISHED', 'CLOSED');

-- Step 4: Drop the old status column
ALTER TABLE "Job" DROP COLUMN "status";

-- Step 5: Create new status column with new enum type
ALTER TABLE "Job" ADD COLUMN "status" "JobStatus_new" NOT NULL DEFAULT 'draft';

-- Step 6: Convert text values to new enum
UPDATE "Job" SET "status" = "status_temp"::"JobStatus_new";

-- Step 7: Drop temporary column
ALTER TABLE "Job" DROP COLUMN "status_temp";

-- Step 8: Drop the old enum
DROP TYPE "JobStatus";

-- Step 9: Rename the new enum to the original name
ALTER TYPE "JobStatus_new" RENAME TO "JobStatus";

