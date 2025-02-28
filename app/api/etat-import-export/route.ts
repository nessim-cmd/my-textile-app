import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const imports = await prisma.declarationImport.findMany({
      where: { userId: user.id },
      include: { models: true },
      orderBy: { date_import: "desc" },
    });

    const exports = await prisma.declarationExport.findMany({
      where: { userId: user.id },
      include: { lines: true },
      orderBy: { createdAt: "desc" },
    });

    const clientModels = await prisma.clientModel.findMany({
      where: {
        client: { name: { in: [...new Set(imports.map((imp) => imp.client))] } },
      },
      include: {
        variants: true,
        client: true,
      },
    });

    console.log("Imports:", imports);
    console.log("Exports:", exports);
    console.log("ClientModels:", clientModels);

    // Build etatData based on unique modele-commande combinations from ClientModel
    const etatData = clientModels.flatMap((clientModel) => {
      // Match imports for this client and modele
      const importMatches = imports
        .filter((imp) => imp.client === clientModel.client.name)
        .flatMap((imp) =>
          imp.models
            .filter((model) => model.name === clientModel.name)
            .map((model) => ({
              id: `${imp.id}-${model.id}-${clientModel.id}-import`, // Add clientModel.id for uniqueness
              dateImport: imp.date_import,
              numDecImport: imp.num_dec,
              valeurImport: imp.valeur,
              clientImport: imp.client,
              modele: clientModel.name,
              commande: clientModel.commandes || "",
              designation: "",
              dateExport: null,
              numDecExport: "",
              clientExport: "",
              valeurExport: 0,
              quantityDelivered: 0,
              quantityTotal: clientModel.variants.reduce(
                (sum: number, v) => sum + (v.qte_variante || 0),
                0
              ) || 0,
            }))
        );

      // Match exports for this modele and commande
      const exportMatches = exports.flatMap((exp) =>
        exp.lines
          .filter((line) => line.modele === clientModel.name && line.commande === clientModel.commandes)
          .map((line) => ({
            id: `${exp.id}-${line.id}-export`,
            dateImport: importMatches.length > 0 ? importMatches[0].dateImport : null,
            numDecImport: importMatches.length > 0 ? importMatches[0].numDecImport : "",
            valeurImport: importMatches.length > 0 ? importMatches[0].valeurImport : 0,
            clientImport: importMatches.length > 0 ? importMatches[0].clientImport : "",
            modele: clientModel.name,
            commande: clientModel.commandes || "",
            designation: line.description || "",
            dateExport: exp.createdAt,
            numDecExport: exp.id,
            clientExport: exp.clientName || "",
            valeurExport: line.quantity * line.unitPrice,
            quantityDelivered: line.quantity || 0,
            quantityTotal: clientModel.variants.reduce(
              (sum: number, v) => sum + (v.qte_variante || 0),
              0
            ) || 0,
          }))
      );

      return [...importMatches, ...exportMatches];
    });

    console.log("EtatData:", etatData);
    return NextResponse.json(etatData, { status: 200 });
  } catch (error) {
    console.error("GET Error:", error);
    
  }
}