-- Update UserRole enum to remove INTERVIEWER and align with schema.prisma
-- Existing enum in DB currently includes: SUPER_ADMIN, ORG_ADMIN, EMPLOYEE, ADMIN, HR, INTERVIEWER
-- Target enum (schema.prisma & contracts): SUPER_ADMIN, ORG_ADMIN, EMPLOYEE, ADMIN, HR
-- We remap any existing INTERVIEWER users to EMPLOYEE to keep the migration safe.

-- Step 1: Create new enum without INTERVIEWER
CREATE TYPE "UserRole_new" AS ENUM ('SUPER_ADMIN', 'ORG_ADMIN', 'EMPLOYEE', 'ADMIN', 'HR');

-- Step 2: Alter User.role column to use new enum type
ALTER TABLE "User"
ALTER COLUMN "role" TYPE "UserRole_new"
USING (
  CASE
    WHEN "role"::text = 'INTERVIEWER' THEN 'EMPLOYEE'::"UserRole_new"
    ELSE "role"::text::"UserRole_new"
  END
);

-- Step 3: Drop old enum
DROP TYPE "UserRole";

-- Step 4: Rename new enum to original name
ALTER TYPE "UserRole_new" RENAME TO "UserRole";


