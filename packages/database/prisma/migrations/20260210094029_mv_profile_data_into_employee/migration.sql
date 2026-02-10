/*
  Warnings:

  - You are about to drop the `EmployeeAddress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserProfile` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `EmployeePersonalInfo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EmployeeAddress" DROP CONSTRAINT "EmployeeAddress_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "UserProfile" DROP CONSTRAINT "UserProfile_userId_fkey";

-- AlterTable
ALTER TABLE "EmployeePersonalInfo" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT,
ADD COLUMN     "emergencyContactRelation" TEXT,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "profilePictureUrl" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "street1" TEXT,
ADD COLUMN     "street2" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "EmployeeAddress";

-- DropTable
DROP TABLE "UserProfile";
