-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Attendance_deletedAt_idx" ON "Attendance"("deletedAt");

-- CreateIndex
CREATE INDEX "Contract_deletedAt_idx" ON "Contract"("deletedAt");

-- CreateIndex
CREATE INDEX "Document_deletedAt_idx" ON "Document"("deletedAt");
