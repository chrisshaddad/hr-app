/*
  Warnings:

  - Made the column `createdById` on table `Organization` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Organization" DROP CONSTRAINT "Organization_createdById_fkey";

-- AlterTable
ALTER TABLE "Organization" ALTER COLUMN "createdById" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
