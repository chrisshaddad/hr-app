-- Add interviewId column to Communication table
-- This column links communications to specific interviews (optional)

-- Step 1: Add interviewId column (nullable)
ALTER TABLE "Communication" ADD COLUMN "interviewId" TEXT;

-- Step 2: Add foreign key constraint for interviewId
ALTER TABLE "Communication"
ADD CONSTRAINT "Communication_interviewId_fkey"
FOREIGN KEY ("interviewId") REFERENCES "Interview"(id) ON DELETE SET NULL;

-- Step 3: Add index for performance
CREATE INDEX IF NOT EXISTS "Communication_interviewId_idx" ON "Communication"("interviewId");

