-- CreateTable
CREATE TABLE "Organization" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "taxId" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Site" (
    "id" SERIAL NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Site_isDeleted_idx" ON "Site"("isDeleted");

-- Keep existing data: every former company value except BOTH becomes a site
INSERT INTO "Site" ("code", "name", "updatedAt")
SELECT DISTINCT t."company"::text, initcap(lower(t."company"::text)), CURRENT_TIMESTAMP
FROM "Ticket" t
WHERE t."company"::text <> 'BOTH'
ORDER BY 1;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN "siteId" INTEGER;

UPDATE "Ticket" t
SET "siteId" = s."id"
FROM "Site" s
WHERE s."code" = t."company"::text;

-- DropIndex
DROP INDEX "Ticket_company_idx";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "company";

-- DropEnum
DROP TYPE "Company";

-- CreateIndex
CREATE INDEX "Ticket_siteId_idx" ON "Ticket"("siteId");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;
