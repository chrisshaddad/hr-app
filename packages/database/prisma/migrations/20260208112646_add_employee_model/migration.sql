-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'ON_BOARDING', 'OFF_BOARDING', 'ON_LEAVE', 'PROBATION');

-- CreateTable
CREATE TABLE "EmployeePersonalInfo" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,

    CONSTRAINT "EmployeePersonalInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeAddress" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "primaryAddress" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postCode" TEXT,

    CONSTRAINT "EmployeeAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "branchId" TEXT,
    "departmentId" TEXT,
    "lineManagerId" TEXT,
    "userId" TEXT,
    "jobTitle" TEXT NOT NULL,
    "joinDate" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL,
    "status" "EmployeeStatus" NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeePersonalInfo_employeeId_key" ON "EmployeePersonalInfo"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeAddress_employeeId_key" ON "EmployeeAddress"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");

-- AddForeignKey
ALTER TABLE "EmployeePersonalInfo" ADD CONSTRAINT "EmployeePersonalInfo_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeAddress" ADD CONSTRAINT "EmployeeAddress_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_lineManagerId_fkey" FOREIGN KEY ("lineManagerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
