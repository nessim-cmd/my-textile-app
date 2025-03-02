import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Define interfaces for the response
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
  isExcluded: boolean; // Added field for checkbox state
}

interface ModelEntry {
  name: string;
  client: string;
  commandes: string;
  commandesWithVariants: { value: string; variants: { name: string; qte_variante: number }[] }[];
}

// Type for the expected structure of commandesWithVariants in the database
type CommandesWithVariantsDB = { value: string; variants: { name: string; qte_variante: number }[] }[] | null;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      console.log("No email provided in query parameters");
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    console.log(`Fetching user with email: ${email}`);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`User not found for email: ${email}`);
      return NextResponse.json({ imports: [], exports: [], models: [] }, { status: 200 });
    }

    // Fetch LivraisonEntree (Imports)
    const livraisonsEntree = await prisma.livraisonEntree.findMany({
      where: { userId: user.id },
      include: { lines: true, client: true },
      orderBy: { createdAt: "desc" },
    });

    // Fetch Livraison (Exports)
    const livraisons = await prisma.livraison.findMany({
      where: { userId: user.id },
      include: { lines: true },
      orderBy: { createdAt: "desc" },
    });

    // Fetch ClientModel entries
    const clients = await prisma.client.findMany({
      where: {
        livraisonEntrees: {
          some: {
            userId: user.id,
          },
        },
      },
    });

    console.log("Clients associated with user:", clients);

    const clientModels = await prisma.clientModel.findMany({
      where: {
        clientId: { in: clients.map(client => client.id) },
      },
      include: {
        client: true,
      },
    });

    console.log("ClientModels fetched:", clientModels);

    // Build imports array from LivraisonEntree
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

    // Build exports array from Livraison
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

    // Build models array from ClientModel
    const models: ModelEntry[] = clientModels.map((model) => {
      // Safely handle commandesWithVariants JSON field
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

    console.log("LivraisonsEntree:", livraisonsEntree);
    console.log("Livraisons:", livraisons);
    console.log("Imports:", imports);
    console.log("Exports:", exports);
    console.log("Models:", models);

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