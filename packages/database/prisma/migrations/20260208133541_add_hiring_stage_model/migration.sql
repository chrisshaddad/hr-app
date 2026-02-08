CREATE TABLE "HiringStage" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HiringStage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "HiringStage_organizationId_idx" ON "HiringStage"("organizationId");

CREATE UNIQUE INDEX "HiringStage_organizationId_name_key" ON "HiringStage"("organizationId", "name");

ALTER TABLE "HiringStage" ADD CONSTRAINT "HiringStage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
