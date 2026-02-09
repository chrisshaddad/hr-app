/*
  Warnings:

  - Added the required column `jobListingId` to the `BoardActivity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BoardActivity" ADD COLUMN     "jobListingId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "BoardActivity_jobListingId_idx" ON "BoardActivity"("jobListingId");

-- AddForeignKey
ALTER TABLE "BoardActivity" ADD CONSTRAINT "BoardActivity_jobListingId_fkey" FOREIGN KEY ("jobListingId") REFERENCES "JobListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
