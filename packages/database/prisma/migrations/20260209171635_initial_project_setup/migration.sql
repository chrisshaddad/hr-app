-- CreateEnum
CREATE TYPE "JobListingStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'INTERNSHIP');

-- CreateEnum
CREATE TYPE "CandidateSource" AS ENUM ('DIRECT_APPLICATION', 'REFERRAL', 'LINKEDIN', 'JOB_BOARD', 'RECRUITMENT_AGENCY', 'CAREER_FAIR', 'OTHER');

-- CreateTable
CREATE TABLE "JobListing" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "officeId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "JobListingStatus" NOT NULL DEFAULT 'DRAFT',
    "employmentType" "EmploymentType" NOT NULL,
    "openingsQuantity" INTEGER NOT NULL DEFAULT 1,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "closingDate" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "salaryMin" DECIMAL(12,2),
    "salaryMax" DECIMAL(12,2),
    "salaryCurrency" TEXT DEFAULT 'USD',
    "experienceYears" INTEGER,
    "educationLevel" TEXT,
    "skills" TEXT[],
    "benefits" TEXT[],
    "remoteOption" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "JobListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobListingMember" (
    "id" TEXT NOT NULL,
    "jobListingId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canEvaluate" BOOLEAN NOT NULL DEFAULT true,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobListingMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowStage" (
    "id" TEXT NOT NULL,
    "jobListingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "photoUrl" TEXT,
    "cvUrl" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "source" "CandidateSource" NOT NULL DEFAULT 'DIRECT_APPLICATION',
    "sourceDetails" TEXT,
    "coverLetter" TEXT,
    "linkedinUrl" TEXT,
    "portfolioUrl" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowStageCandidate" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobListingId" TEXT NOT NULL,
    "workflowStageId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "movedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "WorkflowStageCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardActivity" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "fromStageId" TEXT,
    "toStageId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "notes" TEXT,
    "activityType" TEXT NOT NULL DEFAULT 'MOVED',
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoardActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateStageEvaluation" (
    "id" TEXT NOT NULL,
    "workflowStageCandidateId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "rating" INTEGER,
    "feedback" TEXT,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "recommendation" TEXT,
    "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateStageEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagSetting" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TagSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailTemplateType" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailTemplateType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailTemplateSetting" (
    "id" TEXT NOT NULL,
    "workflowStageId" TEXT NOT NULL,
    "emailTemplateTypeId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplateSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CandidateTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CandidateTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "JobListing_organizationId_idx" ON "JobListing"("organizationId");

-- CreateIndex
CREATE INDEX "JobListing_departmentId_idx" ON "JobListing"("departmentId");

-- CreateIndex
CREATE INDEX "JobListing_status_idx" ON "JobListing"("status");

-- CreateIndex
CREATE INDEX "JobListing_createdById_idx" ON "JobListing"("createdById");

-- CreateIndex
CREATE INDEX "JobListing_closingDate_idx" ON "JobListing"("closingDate");

-- CreateIndex
CREATE INDEX "JobListingMember_jobListingId_idx" ON "JobListingMember"("jobListingId");

-- CreateIndex
CREATE INDEX "JobListingMember_memberId_idx" ON "JobListingMember"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "JobListingMember_jobListingId_memberId_key" ON "JobListingMember"("jobListingId", "memberId");

-- CreateIndex
CREATE INDEX "WorkflowStage_jobListingId_idx" ON "WorkflowStage"("jobListingId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowStage_jobListingId_rank_key" ON "WorkflowStage"("jobListingId", "rank");

-- CreateIndex
CREATE INDEX "Candidate_email_idx" ON "Candidate"("email");

-- CreateIndex
CREATE INDEX "Candidate_lastName_firstName_idx" ON "Candidate"("lastName", "firstName");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_email_phoneNumber_key" ON "Candidate"("email", "phoneNumber");

-- CreateIndex
CREATE INDEX "WorkflowStageCandidate_candidateId_idx" ON "WorkflowStageCandidate"("candidateId");

-- CreateIndex
CREATE INDEX "WorkflowStageCandidate_jobListingId_idx" ON "WorkflowStageCandidate"("jobListingId");

-- CreateIndex
CREATE INDEX "WorkflowStageCandidate_workflowStageId_idx" ON "WorkflowStageCandidate"("workflowStageId");

-- CreateIndex
CREATE INDEX "WorkflowStageCandidate_isActive_idx" ON "WorkflowStageCandidate"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowStageCandidate_candidateId_jobListingId_workflowSta_key" ON "WorkflowStageCandidate"("candidateId", "jobListingId", "workflowStageId", "isActive");

-- CreateIndex
CREATE INDEX "BoardActivity_candidateId_idx" ON "BoardActivity"("candidateId");

-- CreateIndex
CREATE INDEX "BoardActivity_fromStageId_idx" ON "BoardActivity"("fromStageId");

-- CreateIndex
CREATE INDEX "BoardActivity_toStageId_idx" ON "BoardActivity"("toStageId");

-- CreateIndex
CREATE INDEX "BoardActivity_memberId_idx" ON "BoardActivity"("memberId");

-- CreateIndex
CREATE INDEX "BoardActivity_occurredAt_idx" ON "BoardActivity"("occurredAt");

-- CreateIndex
CREATE INDEX "CandidateStageEvaluation_workflowStageCandidateId_idx" ON "CandidateStageEvaluation"("workflowStageCandidateId");

-- CreateIndex
CREATE INDEX "CandidateStageEvaluation_memberId_idx" ON "CandidateStageEvaluation"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "TagSetting_name_key" ON "TagSetting"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplateType_title_key" ON "EmailTemplateType"("title");

-- CreateIndex
CREATE INDEX "EmailTemplateSetting_workflowStageId_idx" ON "EmailTemplateSetting"("workflowStageId");

-- CreateIndex
CREATE INDEX "EmailTemplateSetting_emailTemplateTypeId_idx" ON "EmailTemplateSetting"("emailTemplateTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplateSetting_workflowStageId_emailTemplateTypeId_key" ON "EmailTemplateSetting"("workflowStageId", "emailTemplateTypeId");

-- CreateIndex
CREATE INDEX "_CandidateTags_B_index" ON "_CandidateTags"("B");

-- AddForeignKey
ALTER TABLE "JobListing" ADD CONSTRAINT "JobListing_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobListing" ADD CONSTRAINT "JobListing_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobListing" ADD CONSTRAINT "JobListing_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobListingMember" ADD CONSTRAINT "JobListingMember_jobListingId_fkey" FOREIGN KEY ("jobListingId") REFERENCES "JobListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobListingMember" ADD CONSTRAINT "JobListingMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowStage" ADD CONSTRAINT "WorkflowStage_jobListingId_fkey" FOREIGN KEY ("jobListingId") REFERENCES "JobListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowStageCandidate" ADD CONSTRAINT "WorkflowStageCandidate_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowStageCandidate" ADD CONSTRAINT "WorkflowStageCandidate_jobListingId_fkey" FOREIGN KEY ("jobListingId") REFERENCES "JobListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowStageCandidate" ADD CONSTRAINT "WorkflowStageCandidate_workflowStageId_fkey" FOREIGN KEY ("workflowStageId") REFERENCES "WorkflowStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardActivity" ADD CONSTRAINT "BoardActivity_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardActivity" ADD CONSTRAINT "BoardActivity_fromStageId_fkey" FOREIGN KEY ("fromStageId") REFERENCES "WorkflowStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardActivity" ADD CONSTRAINT "BoardActivity_toStageId_fkey" FOREIGN KEY ("toStageId") REFERENCES "WorkflowStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardActivity" ADD CONSTRAINT "BoardActivity_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateStageEvaluation" ADD CONSTRAINT "CandidateStageEvaluation_workflowStageCandidateId_fkey" FOREIGN KEY ("workflowStageCandidateId") REFERENCES "WorkflowStageCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateStageEvaluation" ADD CONSTRAINT "CandidateStageEvaluation_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailTemplateSetting" ADD CONSTRAINT "EmailTemplateSetting_workflowStageId_fkey" FOREIGN KEY ("workflowStageId") REFERENCES "WorkflowStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailTemplateSetting" ADD CONSTRAINT "EmailTemplateSetting_emailTemplateTypeId_fkey" FOREIGN KEY ("emailTemplateTypeId") REFERENCES "EmailTemplateType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CandidateTags" ADD CONSTRAINT "_CandidateTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CandidateTags" ADD CONSTRAINT "_CandidateTags_B_fkey" FOREIGN KEY ("B") REFERENCES "TagSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
