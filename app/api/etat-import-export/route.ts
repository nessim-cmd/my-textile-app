import prisma from "@/lib/db";
import { NextResponse } from "next/server";

interface EtatDeclarationData {
  imports: EtatDeclaration[];
  exports: EtatDeclaration[];
  models: ModelEntry[];
}

interface EtatDeclaration {
  id: string;
  dateImport: string | null;
  numDecImport: string; // Non-nullable per schema
  valeurImport: number; // Non-nullable per schema
  clientImport: string; // Non-nullable per schema
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

type CommandesWithVariantsDB = { value: string; variants: { name: string; qte_variante: number }[] }[] | null;

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

    const importClients = declarationImports.map(di => di.client).filter((c): c is string => c !== null);
    const exportClients = declarationExports.map(de => de.clientName).filter((c): c is string => c !== null);
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

    const models: ModelEntry[] = clientModels.map((model) => {
      let commandesWithVariants: { value: string; variants: { name: string; qte_variante: number }[] }[] = [];
      if (model.commandesWithVariants) {
        try {
          const parsed = model.commandesWithVariants as CommandesWithVariantsDB;
          if (Array.isArray(parsed)) {
            commandesWithVariants = parsed.map(item => ({
              value: item.value || "",
              variants: Array.isArray(item.variants) ? item.variants.map(v => ({
                name: v.name || "",
                qte_variante: typeof v.qte_variante === "number" ? v.qte_variante : 0,
              })) : [],
            }));
          }
        } catch (e) {
          console.error(`Error parsing commandesWithVariants for model ${model.id}:`, e);
        }
      }

      return {
        name: model.name || "",
        client: model.client?.name || "",
        commandes: model.commandes || "",
        commandesWithVariants,
      };
    });

    // Fixed imports mapping with defaults
    const imports: EtatDeclaration[] = declarationImports.flatMap((di) =>
      di.models.map((model) => {
        const totalQuantity = model.accessories.reduce(
          (sum, acc) => sum + (acc.quantity_reçu || 0),
          0
        );
        return {
          id: `${di.id}-${model.id}-import`,
          dateImport: di.date_import ? new Date(di.date_import).toISOString() : null,
          numDecImport: di.num_dec || "", // Default to empty string
          valeurImport: di.valeur || 0, // Default to 0
          clientImport: di.client || "", // Default to empty string
          modele: model.name || "Unnamed Model",
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
        modele: line.modele || "",
        commande: line.commande || "",
        designation: line.description || "",
        quantityTotal: 0,
        dateExport: de.exportDate ? new Date(de.exportDate).toISOString() : null,
        numDecExport: de.num_dec || "",
        clientExport: de.clientName || "",
        valeurExport: de.valeur || 0,
        quantityDelivered: line.isExcluded ? 0 : (line.quantity || 0),
        isExcluded: line.isExcluded || false,
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