/*
  Warnings:

  - You are about to drop the column `phone` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `adress` on the `Fournisseur` table. All the data in the column will be lost.
  - You are about to drop the column `reference` on the `InvoiceLine` table. All the data in the column will be lost.
  - You are about to drop the `_LivraisonLines` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `address` to the `Fournisseur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Fournisseur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gmailclient` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gmailemetteur` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneclient` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneemetteur` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `LivraisonLine` table without a default value. This is not possible if the table is not empty.
  - Made the column `livraisonId` on table `LivraisonLine` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('EN_COURS', 'EN_PAUSE', 'EN_ATTENTE', 'FINI');

-- DropForeignKey
ALTER TABLE "_LivraisonLines" DROP CONSTRAINT "_LivraisonLines_A_fkey";

-- DropForeignKey
ALTER TABLE "_LivraisonLines" DROP CONSTRAINT "_LivraisonLines_B_fkey";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "phone",
ADD COLUMN     "dateDebutSoumission" TEXT,
ADD COLUMN     "dateFinSoumission" TEXT,
ADD COLUMN     "fix" TEXT,
ADD COLUMN     "matriculeFiscale" TEXT,
ADD COLUMN     "phone1" TEXT,
ADD COLUMN     "phone2" TEXT,
ADD COLUMN     "soumission" TEXT,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "title";

-- AlterTable
ALTER TABLE "Fournisseur" DROP COLUMN "adress",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "gmailclient" TEXT NOT NULL,
ADD COLUMN     "gmailemetteur" TEXT NOT NULL,
ADD COLUMN     "phoneclient" TEXT NOT NULL,
ADD COLUMN     "phoneemetteur" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "InvoiceLine" DROP COLUMN "reference",
ADD COLUMN     "commande" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "modele" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "LivraisonLine" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isExcluded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "commande" DROP NOT NULL,
ALTER COLUMN "commande" DROP DEFAULT,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "description" DROP DEFAULT,
ALTER COLUMN "quantity" DROP NOT NULL,
ALTER COLUMN "quantity" DROP DEFAULT,
ALTER COLUMN "quantity" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "livraisonId" SET NOT NULL;

-- DropTable
DROP TABLE "_LivraisonLines";

-- CreateTable
CREATE TABLE "ClientModel" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "clientId" TEXT NOT NULL,
    "commandes" TEXT,
    "commandesWithVariants" JSONB,
    "lotto" TEXT,
    "ordine" TEXT,
    "puht" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Variant" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "clientModelId" TEXT,
    "qte_variante" INTEGER,
    "modelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LivraisonEntree" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "clientId" TEXT,
    "clientName" TEXT,
    "livraisonDate" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LivraisonEntree_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LivraisonEntreeLine" (
    "id" TEXT NOT NULL,
    "modele" TEXT NOT NULL,
    "commande" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantityReçu" DOUBLE PRECISION NOT NULL,
    "quantityTrouvee" DOUBLE PRECISION NOT NULL,
    "livraisonEntreeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LivraisonEntreeLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commande" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuerName" TEXT NOT NULL DEFAULT '',
    "issuerAddress" TEXT NOT NULL DEFAULT '',
    "clientName" TEXT NOT NULL DEFAULT '',
    "clientAddress" TEXT NOT NULL DEFAULT '',
    "commandeDate" TEXT NOT NULL DEFAULT '',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommandeLine" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "commandeId" TEXT,

    CONSTRAINT "CommandeLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeclarationImport" (
    "id" TEXT NOT NULL,
    "num_dec" TEXT NOT NULL,
    "date_import" TIMESTAMP(3) NOT NULL,
    "client" TEXT NOT NULL,
    "valeur" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeclarationImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Model" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "declarationImportId" TEXT NOT NULL,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Accessoire" (
    "id" TEXT NOT NULL,
    "reference_accessoire" TEXT NOT NULL,
    "quantity_reçu" DOUBLE PRECISION NOT NULL,
    "quantity_trouve" DOUBLE PRECISION NOT NULL,
    "quantity_manque" DOUBLE PRECISION NOT NULL,
    "modelId" TEXT NOT NULL,

    CONSTRAINT "Accessoire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuiviProduction" (
    "id" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "qte_total" INTEGER NOT NULL,
    "client" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuiviProduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuiviProductionLine" (
    "id" TEXT NOT NULL,
    "commande" TEXT NOT NULL,
    "qte_livree" INTEGER NOT NULL,
    "qte_reparation" INTEGER NOT NULL,
    "numero_livraison" TEXT NOT NULL,
    "date_export" TIMESTAMP(3) NOT NULL,
    "suiviId" TEXT,

    CONSTRAINT "SuiviProductionLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Planning" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'EN_COURS',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Planning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lotto" TEXT NOT NULL,
    "commande" TEXT NOT NULL,
    "ordine" TEXT NOT NULL,
    "faconner" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "date_import" TIMESTAMP(3) NOT NULL,
    "date_export" TIMESTAMP(3) NOT NULL,
    "date_entre_coupe" TIMESTAMP(3) NOT NULL,
    "date_sortie_coupe" TIMESTAMP(3) NOT NULL,
    "date_entre_chaine" TIMESTAMP(3) NOT NULL,
    "date_sortie_chaine" TIMESTAMP(3) NOT NULL,
    "planningId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeclarationExport" (
    "id" TEXT NOT NULL,
    "num_dec" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "exportDate" TEXT NOT NULL,
    "valeur" DOUBLE PRECISION NOT NULL,
    "dueDate" TEXT NOT NULL DEFAULT '',
    "vatActive" BOOLEAN NOT NULL DEFAULT false,
    "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "status" INTEGER NOT NULL DEFAULT 1,
    "poidsBrut" TEXT NOT NULL,
    "poidsNet" TEXT NOT NULL,
    "nbrColis" TEXT NOT NULL,
    "volume" TEXT NOT NULL,
    "modePaiment" INTEGER NOT NULL DEFAULT 1,
    "origineTessuto" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeclarationExport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportLine" (
    "id" TEXT NOT NULL,
    "commande" TEXT NOT NULL,
    "modele" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isExcluded" BOOLEAN NOT NULL DEFAULT false,
    "exportId" TEXT NOT NULL,

    CONSTRAINT "ExportLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientModel_clientId_name_commandes_key" ON "ClientModel"("clientId", "name", "commandes");

-- AddForeignKey
ALTER TABLE "ClientModel" ADD CONSTRAINT "ClientModel_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ModelPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_clientModelId_fkey" FOREIGN KEY ("clientModelId") REFERENCES "ClientModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LivraisonLine" ADD CONSTRAINT "LivraisonLine_livraisonId_fkey" FOREIGN KEY ("livraisonId") REFERENCES "Livraison"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LivraisonEntree" ADD CONSTRAINT "LivraisonEntree_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LivraisonEntree" ADD CONSTRAINT "LivraisonEntree_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LivraisonEntreeLine" ADD CONSTRAINT "LivraisonEntreeLine_livraisonEntreeId_fkey" FOREIGN KEY ("livraisonEntreeId") REFERENCES "LivraisonEntree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommandeLine" ADD CONSTRAINT "CommandeLine_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeclarationImport" ADD CONSTRAINT "DeclarationImport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_declarationImportId_fkey" FOREIGN KEY ("declarationImportId") REFERENCES "DeclarationImport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accessoire" ADD CONSTRAINT "Accessoire_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuiviProduction" ADD CONSTRAINT "SuiviProduction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuiviProductionLine" ADD CONSTRAINT "SuiviProductionLine_suiviId_fkey" FOREIGN KEY ("suiviId") REFERENCES "SuiviProduction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Planning" ADD CONSTRAINT "Planning_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelPlan" ADD CONSTRAINT "ModelPlan_planningId_fkey" FOREIGN KEY ("planningId") REFERENCES "Planning"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeclarationExport" ADD CONSTRAINT "DeclarationExport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportLine" ADD CONSTRAINT "ExportLine_exportId_fkey" FOREIGN KEY ("exportId") REFERENCES "DeclarationExport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
