ALTER TABLE "Job" ADD COLUMN     "expectedClosingDate" TIMESTAMP(3),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;
