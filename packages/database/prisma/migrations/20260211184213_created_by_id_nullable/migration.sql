-- DropForeignKey
ALTER TABLE "Organization" DROP CONSTRAINT "Organization_createdById_fkey";

-- AlterTable
ALTER TABLE "Organization" ALTER COLUMN "createdById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
