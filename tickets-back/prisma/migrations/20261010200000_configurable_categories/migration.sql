-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Category_isDeleted_idx" ON "Category"("isDeleted");

-- Keep existing data: every former category value in use becomes a category
CREATE TEMP TABLE "_category_map" ("code" TEXT PRIMARY KEY, "name" TEXT NOT NULL);

INSERT INTO "_category_map" ("code", "name") VALUES
    ('INVENTORY', 'Inventario / existencias'),
    ('RECEIVING', 'Recepción'),
    ('RECHECK', 'Rechequeo'),
    ('PICKING', 'Picking'),
    ('CYCLE_COUNT', 'Conteo cíclico'),
    ('TRANSFERS', 'Traslados'),
    ('BILLING', 'Facturación'),
    ('REPORTS', 'Reportes'),
    ('SYSTEM', 'Sistema'),
    ('OTHER', 'Otro');

INSERT INTO "Category" ("name", "updatedAt")
SELECT m."name", CURRENT_TIMESTAMP
FROM "_category_map" m
WHERE EXISTS (SELECT 1 FROM "Ticket" t WHERE t."category"::text = m."code")
ORDER BY m."name";

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN "categoryId" INTEGER;

UPDATE "Ticket" t
SET "categoryId" = c."id"
FROM "_category_map" m
JOIN "Category" c ON c."name" = m."name"
WHERE m."code" = t."category"::text;

DROP TABLE "_category_map";

-- DropIndex
DROP INDEX "Ticket_category_idx";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "category";

-- DropEnum
DROP TYPE "TicketCategory";

-- CreateIndex
CREATE INDEX "Ticket_categoryId_idx" ON "Ticket"("categoryId");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
