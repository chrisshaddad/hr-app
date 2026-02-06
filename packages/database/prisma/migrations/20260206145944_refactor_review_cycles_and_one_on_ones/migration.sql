/*
  Warnings:

  - You are about to drop the column `achievements` on the `PerformanceReview` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `PerformanceReview` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `PerformanceReview` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `PerformanceReview` table. All the data in the column will be lost.
  - You are about to drop the column `overallRating` on the `PerformanceReview` table. All the data in the column will be lost.
  - You are about to drop the column `recurrence` on the `PerformanceReview` table. All the data in the column will be lost.
  - You are about to drop the column `reviewCycle` on the `PerformanceReview` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledAt` on the `PerformanceReview` table. All the data in the column will be lost.
  - You are about to drop the column `strengths` on the `PerformanceReview` table. All the data in the column will be lost.
  - Added the required column `reviewCycleId` to the `PerformanceReview` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OneOnOneStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELED');

-- DropIndex
DROP INDEX "PerformanceReview_scheduledAt_idx";

-- AlterTable
ALTER TABLE "PerformanceReview" DROP COLUMN "achievements",
DROP COLUMN "duration",
DROP COLUMN "location",
DROP COLUMN "notes",
DROP COLUMN "overallRating",
DROP COLUMN "recurrence",
DROP COLUMN "reviewCycle",
DROP COLUMN "scheduledAt",
DROP COLUMN "strengths",
ADD COLUMN     "reviewCycleId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "MeetingRecurrence";

-- DropEnum
DROP TYPE "ReviewCycle";

-- CreateTable
CREATE TABLE "ReviewCycle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OneOnOne" (
    "id" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "attendeeId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" "OneOnOneStatus" NOT NULL,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OneOnOne_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReviewCycle_organizationId_idx" ON "ReviewCycle"("organizationId");

-- CreateIndex
CREATE INDEX "ReviewCycle_startDate_idx" ON "ReviewCycle"("startDate");

-- CreateIndex
CREATE INDEX "ReviewCycle_endDate_idx" ON "ReviewCycle"("endDate");

-- CreateIndex
CREATE INDEX "OneOnOne_organizerId_idx" ON "OneOnOne"("organizerId");

-- CreateIndex
CREATE INDEX "OneOnOne_attendeeId_idx" ON "OneOnOne"("attendeeId");

-- CreateIndex
CREATE INDEX "OneOnOne_scheduledAt_idx" ON "OneOnOne"("scheduledAt");

-- CreateIndex
CREATE INDEX "PerformanceReview_reviewCycleId_idx" ON "PerformanceReview"("reviewCycleId");

-- AddForeignKey
ALTER TABLE "ReviewCycle" ADD CONSTRAINT "ReviewCycle_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OneOnOne" ADD CONSTRAINT "OneOnOne_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OneOnOne" ADD CONSTRAINT "OneOnOne_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceReview" ADD CONSTRAINT "PerformanceReview_reviewCycleId_fkey" FOREIGN KEY ("reviewCycleId") REFERENCES "ReviewCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
