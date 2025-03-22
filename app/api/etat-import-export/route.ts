/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

interface EtatData {
  imports: ImportEntry[];
  exports: ExportEntry[];
  models: ModelEntry[];
}

interface ImportEntry {
  id: string;
  dateEntree: string | null;
  numLivraisonEntree: string;
  clientEntree: string;
  modele: string;
  commande: string;
  description: string;
  quantityReçu: number;
}

interface ExportEntry {
  id: string;
  dateSortie: string | null;
  numLivraisonSortie: string;
  clientSortie: string;
  modele: string;
  commande: string;
  description: string;
  quantityDelivered: number;
  isExcluded: boolean;
}

interface ModelEntry {
  name: string;
  client: string;
  commandes: string;
  commandesWithVariants: { value: string; variants: { name: string; qte_variante: number }[] }[];
}

export async function GET() {
  try {
    const declarationImports = await prisma.declarationImport.findMany({
      include: {
        models: {
          include: { accessories: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const declarationExports = await prisma.declarationExport.findMany({
      include: { lines: true },
      orderBy: { createdAt: "desc" },
    });

    const importClients = declarationImports.map(di => di.client).filter((c): c is string => c !== null);
    const exportClients = declarationExports.map(de => de.clientName).filter((c): c is string => c !== null);
    const allClients = [...new Set([...importClients, ...exportClients])];

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
          const parsed = model.commandesWithVariants as any;
          if (Array.isArray(parsed)) {
            commandesWithVariants = parsed.map(item => ({
              value: item.value || "",
              variants: Array.isArray(item.variants) ? item.variants.map((v: { name: any; qte_variante: any; }) => ({
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

    const imports: ImportEntry[] = declarationImports.flatMap((di) =>
      di.models.map((model) => {
        const totalQuantity = model.accessories.reduce(
          (sum, acc) => sum + (acc.quantity_reçu || 0),
          0
        );
        return {
          id: `${di.id}-${model.id}-import`,
          dateEntree: di.date_import ? new Date(di.date_import).toISOString() : null,
          numLivraisonEntree: di.num_dec || "",
          clientEntree: di.client || "",
          modele: model.name || "Unnamed Model",
          commande: model.commande || "",
          description: model.description || "",
          quantityReçu: totalQuantity,
        };
      })
    );

    const exports: ExportEntry[] = declarationExports.flatMap((de) =>
      de.lines.map((line) => ({
        id: `${de.id}-${line.id}-export`,
        dateSortie: de.exportDate ? new Date(de.exportDate).toISOString() : null,
        numLivraisonSortie: de.num_dec || "",
        clientSortie: de.clientName || "",
        modele: line.modele || "",
        commande: line.commande || "",
        description: line.description || "",
        quantityDelivered: line.isExcluded ? 0 : (line.quantity || 0),
        isExcluded: line.isExcluded || false,
      }))
    );

    const responseData: EtatData = { imports, exports, models };
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("GET /api/etat-import-export Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}