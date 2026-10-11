-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "portalEmailEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "requesterLanguage" TEXT;

-- CreateTable
CREATE TABLE "PortalAccess" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortalAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PortalAccess_tokenHash_key" ON "PortalAccess"("tokenHash");

-- CreateIndex
CREATE INDEX "PortalAccess_email_idx" ON "PortalAccess"("email");

