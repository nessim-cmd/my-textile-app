/*
  Warnings:

  - You are about to drop the column `modele` on the `LivraisonEntreeLine` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'COUPEUR', 'CHEF', 'USER');

-- DropForeignKey
ALTER TABLE "Commande" DROP CONSTRAINT "Commande_userId_fkey";

-- DropForeignKey
ALTER TABLE "DeclarationExport" DROP CONSTRAINT "DeclarationExport_userId_fkey";

-- DropForeignKey
ALTER TABLE "DeclarationImport" DROP CONSTRAINT "DeclarationImport_userId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_userId_fkey";

-- DropForeignKey
ALTER TABLE "Livraison" DROP CONSTRAINT "Livraison_userId_fkey";

-- DropForeignKey
ALTER TABLE "SuiviProduction" DROP CONSTRAINT "SuiviProduction_userId_fkey";

-- AlterTable
ALTER TABLE "Accessoire" ALTER COLUMN "reference_accessoire" DROP NOT NULL,
ALTER COLUMN "quantity_reçu" DROP NOT NULL,
ALTER COLUMN "quantity_trouve" DROP NOT NULL,
ALTER COLUMN "quantity_manque" DROP NOT NULL,
ALTER COLUMN "modelId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "name" SET DEFAULT '-',
ALTER COLUMN "address" SET DEFAULT '-',
ALTER COLUMN "dateDebutSoumission" SET DEFAULT '-',
ALTER COLUMN "dateFinSoumission" SET DEFAULT '-',
ALTER COLUMN "fix" SET DEFAULT '-',
ALTER COLUMN "matriculeFiscale" SET DEFAULT '-',
ALTER COLUMN "phone1" SET DEFAULT '-',
ALTER COLUMN "phone2" SET DEFAULT '-',
ALTER COLUMN "soumission" SET DEFAULT '-';

-- AlterTable
ALTER TABLE "ClientModel" ALTER COLUMN "commandes" SET DEFAULT '-',
ALTER COLUMN "commandesWithVariants" SET DEFAULT '0';

-- AlterTable
ALTER TABLE "Commande" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "DeclarationExport" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "DeclarationImport" ALTER COLUMN "num_dec" DROP NOT NULL,
ALTER COLUMN "client" DROP NOT NULL,
ALTER COLUMN "valeur" DROP NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Livraison" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "LivraisonEntreeLine" DROP COLUMN "modele";

-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "commande" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "livraisonEntreeId" TEXT,
ADD COLUMN     "quantityReçu" DOUBLE PRECISION,
ADD COLUMN     "quantityTrouvee" DOUBLE PRECISION,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "declarationImportId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SuiviProduction" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "Variant" ALTER COLUMN "qte_variante" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "FicheProduction" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "commande" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FicheProduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionEntry" (
    "id" TEXT NOT NULL,
    "ficheId" TEXT NOT NULL,
    "week" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "hour" TEXT NOT NULL,
    "quantityCreated" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FicheCoupe" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "commande" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FicheCoupe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoupeEntry" (
    "id" TEXT NOT NULL,
    "ficheCoupeId" TEXT NOT NULL,
    "week" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantityCreated" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoupeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ModelAccessoires" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ModelAccessoires_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "FicheCoupe_clientId_idx" ON "FicheCoupe"("clientId");

-- CreateIndex
CREATE INDEX "FicheCoupe_modelId_idx" ON "FicheCoupe"("modelId");

-- CreateIndex
CREATE INDEX "CoupeEntry_ficheCoupeId_idx" ON "CoupeEntry"("ficheCoupeId");

-- CreateIndex
CREATE INDEX "CoupeEntry_week_day_category_idx" ON "CoupeEntry"("week", "day", "category");

-- CreateIndex
CREATE INDEX "_ModelAccessoires_B_index" ON "_ModelAccessoires"("B");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Livraison" ADD CONSTRAINT "Livraison_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeclarationImport" ADD CONSTRAINT "DeclarationImport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_livraisonEntreeId_fkey" FOREIGN KEY ("livraisonEntreeId") REFERENCES "LivraisonEntree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuiviProduction" ADD CONSTRAINT "SuiviProduction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeclarationExport" ADD CONSTRAINT "DeclarationExport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FicheProduction" ADD CONSTRAINT "FicheProduction_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FicheProduction" ADD CONSTRAINT "FicheProduction_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ClientModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionEntry" ADD CONSTRAINT "ProductionEntry_ficheId_fkey" FOREIGN KEY ("ficheId") REFERENCES "FicheProduction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FicheCoupe" ADD CONSTRAINT "FicheCoupe_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FicheCoupe" ADD CONSTRAINT "FicheCoupe_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ClientModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoupeEntry" ADD CONSTRAINT "CoupeEntry_ficheCoupeId_fkey" FOREIGN KEY ("ficheCoupeId") REFERENCES "FicheCoupe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModelAccessoires" ADD CONSTRAINT "_ModelAccessoires_A_fkey" FOREIGN KEY ("A") REFERENCES "Accessoire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModelAccessoires" ADD CONSTRAINT "_ModelAccessoires_B_fkey" FOREIGN KEY ("B") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;
