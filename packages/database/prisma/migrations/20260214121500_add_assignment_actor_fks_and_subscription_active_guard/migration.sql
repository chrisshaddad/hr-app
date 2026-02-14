-- CreateIndex
CREATE INDEX "UserWorkSchedule_assignedBy_idx" ON "UserWorkSchedule"("assignedBy");

-- CreateIndex
CREATE INDEX "UserOrgRole_assignedBy_idx" ON "UserOrgRole"("assignedBy");

-- AddForeignKey
ALTER TABLE "UserWorkSchedule" ADD CONSTRAINT "UserWorkSchedule_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOrgRole" ADD CONSTRAINT "UserOrgRole_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Ensure at most one current subscription per organization.
-- Uses a partial unique index so historical/inactive rows can coexist.
CREATE UNIQUE INDEX "Subscription_one_current_per_org_key"
ON "Subscription"("organizationId")
WHERE "status" IN ('ACTIVE', 'TRIALING', 'PAST_DUE');
