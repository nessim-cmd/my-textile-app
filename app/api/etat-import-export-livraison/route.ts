import prisma from "@/lib/db";
import {  NextResponse } from "next/server";

interface EtatLivraisonData {
  imports: ImportEntry[];
  exports: ExportEntry[];
  models: ModelEntry[];
}

interface ImportEntry {
  id: string;
  dateEntree: Date | null;
  numLivraisonEntree: string;
  clientEntree: string;
  modele: string;
  commande: string;
  description: string;
  quantityReçu: number;
}

interface ExportEntry {
  id: string;
  dateSortie: Date | null;
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

type CommandesWithVariantsDB = { value: string; variants: { name: string; qte_variante: number }[] }[] | null;

export async function GET() {
  try {
    console.log("Fetching all LivraisonEntree (imports)");
    const livraisonsEntree = await prisma.livraisonEntree.findMany({
      include: { lines: true, client: true },
      orderBy: { createdAt: "desc" },
    });

    console.log("Fetching all Livraison (exports)");
    const livraisons = await prisma.livraison.findMany({
      include: { lines: true },
      orderBy: { createdAt: "desc" },
    });

    console.log("Fetching all clients with associated LivraisonEntree");
    const clients = await prisma.client.findMany({
      where: {
        livraisonEntrees: { some: {} }, // Fetch clients with any LivraisonEntree
      },
    });

    console.log("Clients fetched:", clients.length);

    const clientModels = await prisma.clientModel.findMany({
      where: {
        clientId: { in: clients.map(client => client.id) },
      },
      include: {
        client: true,
      },
    });

    console.log("ClientModels fetched:", clientModels.length);

    const imports: ImportEntry[] = livraisonsEntree.flatMap((le) =>
      le.lines.map((line) => ({
        id: `${le.id}-${line.id}-entree`,
        dateEntree: le.livraisonDate ? new Date(le.livraisonDate) : null,
        numLivraisonEntree: le.id,
        clientEntree: le.client?.name || le.clientName || "",
        modele: line.modele,
        commande: line.commande || "",
        description: line.description || "",
        quantityReçu: line.quantityReçu || 0,
      }))
    );

    const exports: ExportEntry[] = livraisons.flatMap((liv) =>
      liv.lines.map((line) => ({
        id: `${liv.id}-${line.id}-sortie`,
        dateSortie: liv.livraisonDate ? new Date(liv.livraisonDate) : null,
        numLivraisonSortie: liv.id,
        clientSortie: liv.clientName || "",
        modele: line.modele,
        commande: line.commande || "",
        description: line.description || "",
        quantityDelivered: line.quantity || 0,
        isExcluded: line.isExcluded || false,
      }))
    );

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

    console.log("LivraisonsEntree processed:", livraisonsEntree.length);
    console.log("Livraisons processed:", livraisons.length);
    console.log("Imports processed:", imports.length);
    console.log("Exports processed:", exports.length);
    console.log("Models processed:", models.length);

    const responseData: EtatLivraisonData = { imports, exports, models };
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("GET /api/etat-import-export-livraison Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}