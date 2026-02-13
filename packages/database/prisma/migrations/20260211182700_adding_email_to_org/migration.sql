/*
  Warnings:

  - A unique constraint covering the columns `[contactEmail]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contactEmail` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "contactEmail" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_contactEmail_key" ON "Organization"("contactEmail");
