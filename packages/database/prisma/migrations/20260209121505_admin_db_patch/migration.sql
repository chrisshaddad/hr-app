/*
  Warnings:

  - You are about to drop the `Documents` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[organizationId,title]` on the table `JobTitle` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organizationId` to the `JobTitle` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Documents" DROP CONSTRAINT "Documents_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Documents" DROP CONSTRAINT "Documents_userId_fkey";

-- DropIndex
DROP INDEX "JobTitle_title_key";

-- AlterTable
ALTER TABLE "Attendance" ALTER COLUMN "scheduledHours" SET DEFAULT 0,
ALTER COLUMN "loggedHours" SET DEFAULT 0,
ALTER COLUMN "paidHours" SET DEFAULT 0,
ALTER COLUMN "deficitHours" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "JobTitle" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Documents";

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Document_userId_idx" ON "Document"("userId");

-- CreateIndex
CREATE INDEX "Document_organizationId_idx" ON "Document"("organizationId");

-- CreateIndex
CREATE INDEX "Document_documentType_idx" ON "Document"("documentType");

-- CreateIndex
CREATE INDEX "Attendance_userId_date_status_idx" ON "Attendance"("userId", "date", "status");

-- CreateIndex
CREATE INDEX "Department_organizationId_idx" ON "Department"("organizationId");

-- CreateIndex
CREATE INDEX "JobTitle_organizationId_idx" ON "JobTitle"("organizationId");

-- CreateIndex
CREATE INDEX "JobTitle_title_organizationId_idx" ON "JobTitle"("title", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "JobTitle_organizationId_title_key" ON "JobTitle"("organizationId", "title");

-- AddForeignKey
ALTER TABLE "JobTitle" ADD CONSTRAINT "JobTitle_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
