-- CreateTable
CREATE TABLE "private"."MagicLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MagicLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MagicLink_token_key" ON "private"."MagicLink"("token");

-- CreateIndex
CREATE INDEX "MagicLink_token_idx" ON "private"."MagicLink"("token");

-- CreateIndex
CREATE INDEX "MagicLink_userId_idx" ON "private"."MagicLink"("userId");

-- AddForeignKey
ALTER TABLE "private"."MagicLink" ADD CONSTRAINT "MagicLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
