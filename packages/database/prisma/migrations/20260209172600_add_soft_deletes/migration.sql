ALTER TABLE "Application" ADD COLUMN     "deletedAt" TIMESTAMP(3);

ALTER TABLE "Candidate" ADD COLUMN     "deletedAt" TIMESTAMP(3);

ALTER TABLE "HiringStage" ADD COLUMN     "deletedAt" TIMESTAMP(3);

ALTER TABLE "Job" ADD COLUMN     "deletedAt" TIMESTAMP(3);

ALTER TABLE "Organization" ADD COLUMN     "deletedAt" TIMESTAMP(3);

ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3);
