/*
  Warnings:

  - A unique constraint covering the columns `[workflowStageCandidateId,memberId]` on the table `CandidateStageEvaluation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CandidateStageEvaluation_workflowStageCandidateId_memberId_key" ON "CandidateStageEvaluation"("workflowStageCandidateId", "memberId");
