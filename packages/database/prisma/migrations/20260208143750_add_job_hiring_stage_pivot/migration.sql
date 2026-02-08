CREATE TABLE "JobHiringStage" (
    "jobId" TEXT NOT NULL,
    "hiringStageId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "JobHiringStage_pkey" PRIMARY KEY ("jobId","hiringStageId")
);

CREATE INDEX "JobHiringStage_jobId_idx" ON "JobHiringStage"("jobId");

CREATE INDEX "JobHiringStage_hiringStageId_idx" ON "JobHiringStage"("hiringStageId");

ALTER TABLE "JobHiringStage" ADD CONSTRAINT "JobHiringStage_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "JobHiringStage" ADD CONSTRAINT "JobHiringStage_hiringStageId_fkey" FOREIGN KEY ("hiringStageId") REFERENCES "HiringStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
