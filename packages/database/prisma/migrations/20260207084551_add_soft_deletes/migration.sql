/*
  Warnings:

  - Added the required column `deleted` to the `Goal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deleted` to the `Milestone` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "deleted" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Milestone" ADD COLUMN     "deleted" BOOLEAN NOT NULL;
