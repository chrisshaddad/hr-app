/*
  Warnings:

  - You are about to drop the column `employeeId` on the `EmployeePersonalInfo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[personalInfoId]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `personalInfoId` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EmployeePersonalInfo" DROP CONSTRAINT "EmployeePersonalInfo_employeeId_fkey";

-- DropIndex
DROP INDEX "EmployeePersonalInfo_employeeId_key";

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "personalInfoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "EmployeePersonalInfo" DROP COLUMN "employeeId";

-- CreateIndex
CREATE UNIQUE INDEX "Employee_personalInfoId_key" ON "Employee"("personalInfoId");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_personalInfoId_fkey" FOREIGN KEY ("personalInfoId") REFERENCES "EmployeePersonalInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
