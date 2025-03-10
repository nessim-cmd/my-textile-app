import prisma from "@/lib/db";
import {  NextResponse } from "next/server";

interface EtatDeclarationData {
  imports: EtatDeclaration[];
  exports: EtatDeclaration[];
  models: ModelEntry[];
}

interface EtatDeclaration {
  id: string;
  dateImport: string | null;
  numDecImport: string;
  valeurImport: number;
  clientImport: string;
  modele: string;
  commande: string;
  designation: string;
  dateExport: string | null;
  numDecExport: string;
  clientExport: string;
  valeurExport: number;
  quantityDelivered: number;
  quantityTotal: number;
  isExcluded?: boolean;
}

interface ModelEntry {
  name: string;
  client: string;
  commandes: string;
  commandesWithVariants: { value: string; variants: { name: string; qte_variante: number }[] }[];
}

export async function GET() {
  try {
    console.log("Fetching all declaration imports");
    const declarationImports = await prisma.declarationImport.findMany({
      include: {
        models: {
          include: { accessories: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("Fetching all declaration exports");
    const declarationExports = await prisma.declarationExport.findMany({
      include: { lines: true },
      orderBy: { createdAt: "desc" },
    });

    const importClients = [...new Set(declarationImports.map(di => di.client))];
    const exportClients = [...new Set(declarationExports.map(de => de.clientName))];
    const allClients = [...new Set([...importClients, ...exportClients])];

    console.log("Fetching client models for clients:", allClients);
    const clientModels = await prisma.clientModel.findMany({
      where: {
        client: {
          name: { in: allClients },
        },
      },
      include: {
        client: true,
      },
    });

    const models: ModelEntry[] = clientModels.map(cm => ({
      name: cm.name || "Unnamed Model",
      client: cm.client.name || "Unknown Client",
      commandes: cm.commandes || "",
      commandesWithVariants: cm.commandesWithVariants
        ? (cm.commandesWithVariants as { value: string; variants: { name: string; qte_variante: number }[] }[])
        : [],
    }));

    const imports: EtatDeclaration[] = declarationImports.flatMap((di) =>
      di.models.map((model) => {
        const totalQuantity = model.accessories.reduce(
          (sum, acc) => sum + (acc.quantity_reçu || 0),
          0
        );
        return {
          id: `${di.id}-${model.id}-import`,
          dateImport: di.date_import ? new Date(di.date_import).toISOString() : null,
          numDecImport: di.num_dec,
          valeurImport: di.valeur,
          clientImport: di.client,
          modele: model.name,
          commande: "",
          designation: "",
          quantityTotal: totalQuantity,
          dateExport: null,
          numDecExport: "",
          clientExport: "",
          valeurExport: 0,
          quantityDelivered: 0,
        };
      })
    );

    const exports: EtatDeclaration[] = declarationExports.flatMap((de) =>
      de.lines.map((line) => ({
        id: `${de.id}-${line.id}-export`,
        dateImport: null,
        numDecImport: "",
        valeurImport: 0,
        clientImport: "",
        modele: line.modele,
        commande: line.commande,
        designation: line.description,
        quantityTotal: 0,
        dateExport: de.exportDate ? new Date(de.exportDate).toISOString() : null,
        numDecExport: de.num_dec,
        clientExport: de.clientName,
        valeurExport: de.valeur,
        quantityDelivered: line.isExcluded ? 0 : line.quantity,
        isExcluded: line.isExcluded,
      }))
    );

    console.log("DeclarationImports fetched:", declarationImports.length);
    console.log("DeclarationExports fetched:", declarationExports.length);
    console.log("Imports processed:", imports.length);
    console.log("Exports processed:", exports.length);
    console.log("Models processed:", models.length);

    const responseData: EtatDeclarationData = { imports, exports, models };
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("GET /api/etat-import-export Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}