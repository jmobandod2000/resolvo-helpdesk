-- AlterEnum
ALTER TYPE "TicketChannel" ADD VALUE 'PORTAL';

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "portalEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "portalMessage" TEXT;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "publicToken" TEXT,
ADD COLUMN     "requesterEmail" TEXT;

-- AlterTable
ALTER TABLE "TicketEvent" ADD COLUMN     "authorName" TEXT,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_publicToken_key" ON "Ticket"("publicToken");

