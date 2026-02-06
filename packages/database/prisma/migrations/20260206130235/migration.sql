-- CreateEnum
CREATE TYPE "ReviewType" AS ENUM ('MANAGER', 'PEER', 'SELF', 'ONE_ON_ONE');

-- CreateEnum
CREATE TYPE "ReviewCycle" AS ENUM ('WEEKLY', 'BI_WEEKLY', 'MONTHLY', 'SEMI_ANNUAL', 'BI_ANNUAL');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ACKNOWLEDGED');

-- CreateEnum
CREATE TYPE "MeetingRecurrence" AS ENUM ('NONE', 'WEEKLY', 'BI_WEEKLY', 'MONTHLY', 'BI_ANNUAL');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "managerId" TEXT;

-- CreateTable
CREATE TABLE "PerformanceReview" (
    "id" TEXT NOT NULL,
    "reviewType" "ReviewType" NOT NULL,
    "reviewCycle" "ReviewCycle",
    "status" "ReviewStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "revieweeId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "overallRating" SMALLINT,
    "strengths" TEXT,
    "areasForImprovement" TEXT,
    "achievements" TEXT,
    "notes" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "duration" INTEGER,
    "location" TEXT,
    "recurrence" "MeetingRecurrence" DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PerformanceReview_revieweeId_idx" ON "PerformanceReview"("revieweeId");

-- CreateIndex
CREATE INDEX "PerformanceReview_reviewerId_idx" ON "PerformanceReview"("reviewerId");

-- CreateIndex
CREATE INDEX "PerformanceReview_organizationId_idx" ON "PerformanceReview"("organizationId");

-- CreateIndex
CREATE INDEX "PerformanceReview_status_idx" ON "PerformanceReview"("status");

-- CreateIndex
CREATE INDEX "PerformanceReview_reviewType_idx" ON "PerformanceReview"("reviewType");

-- CreateIndex
CREATE INDEX "PerformanceReview_scheduledAt_idx" ON "PerformanceReview"("scheduledAt");

-- CreateIndex
CREATE INDEX "Goal_ownerId_idx" ON "Goal"("ownerId");

-- CreateIndex
CREATE INDEX "Goal_targetDate_idx" ON "Goal"("targetDate");

-- CreateIndex
CREATE INDEX "Goal_isCompleted_idx" ON "Goal"("isCompleted");

-- CreateIndex
CREATE INDEX "User_managerId_idx" ON "User"("managerId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceReview" ADD CONSTRAINT "PerformanceReview_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceReview" ADD CONSTRAINT "PerformanceReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceReview" ADD CONSTRAINT "PerformanceReview_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
