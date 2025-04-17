import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Accessoire, Model } from "@/type";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const declaration = await prisma.declarationImport.findUnique({
      where: { id },
      include: { models: { include: { accessories: true } } },
    });

    if (!declaration) {
      return NextResponse.json({ error: "Declaration not found" }, { status: 404 });
    }

    const transformedDeclaration = {
      ...declaration,
      createdAt: declaration.createdAt.toISOString(),
      updatedAt: declaration.updatedAt.toISOString(),
      date_import: declaration.date_import.toISOString(),
      models: declaration.models.map(model => ({
        ...model,
        createdAt: model.createdAt.toISOString(),
        updatedAt: model.updatedAt.toISOString(),
        accessories: model.accessories.map(acc => ({
          ...acc,
          quantity_reçu: acc.quantity_reçu || 0,
          quantity_trouve: acc.quantity_trouve || 0,
          quantity_sortie: acc.quantity_sortie || 0,
          quantity_manque: acc.quantity_manque || 0,
        })),
      })),
    };

    console.log("GET /api/import/[id] - Declaration fetched:", transformedDeclaration.id);
    return NextResponse.json(transformedDeclaration, { status: 200 });
  } catch (error) {
    console.error("GET /api/import/[id] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const declarationData = await request.json();
    const { num_dec, date_import, client, valeur, models } = declarationData;

    console.log("PUT /api/import/[id] - Received data:", JSON.stringify(declarationData, null, 2));

    // Validate required fields
    if (!num_dec || !date_import || !client || valeur === undefined) {
      return NextResponse.json(
        { error: "num_dec, date_import, client, and valeur are required" },
        { status: 400 }
      );
    }

    // Resolve or create client
    let clientRecord = await prisma.client.findFirst({ where: { name: client } });
    if (!clientRecord) {
      clientRecord = await prisma.client.create({
        data: {
          name: client,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log("PUT /api/import/[id] - Created new client:", clientRecord.name);
    }

    // Sync ClientModel entries
    for (const model of models) {
      if (!model.name) continue;
      const modelNameLower = model.name.toLowerCase();
      const existingClientModel = await prisma.clientModel.findFirst({
        where: {
          clientId: clientRecord.id,
          name: modelNameLower,
        },
      });
      if (!existingClientModel) {
        await prisma.clientModel.create({
          data: {
            name: modelNameLower,
            clientId: clientRecord.id,
            commandes: model.commande || "",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        console.log("PUT /api/import/[id] - Created new client model:", modelNameLower);
      }
    }

    // Update DeclarationImport and replace models/accessories
    const updatedDeclaration = await prisma.declarationImport.update({
      where: { id },
      data: {
        num_dec,
        date_import: new Date(date_import),
        client,
        valeur,
        updatedAt: new Date(),
        models: {
          deleteMany: {}, // Delete all existing models
          create: models.map((model: Model) => ({
            id: model.id && !model.id.startsWith('temp-') ? model.id : undefined,
            name: model.name,
            commande: model.commande || "",
            description: model.description || "",
            quantityReçu: model.quantityReçu || 0,
            quantityTrouvee: model.quantityTrouvee || 0,
            createdAt: new Date(model.createdAt || new Date()),
            updatedAt: new Date(),
            accessories: {
              create: model.accessories.map((acc: Accessoire) => ({
                id: acc.id && !acc.id.startsWith('temp-') ? acc.id : undefined,
                reference_accessoire: acc.reference_accessoire || "",
                description: acc.description || "",
                quantity_reçu: acc.quantity_reçu || 0,
                quantity_trouve: acc.quantity_trouve || 0,
                quantity_sortie: acc.quantity_sortie || 0,
                quantity_manque: (acc.quantity_trouve || 0) - (acc.quantity_reçu || 0),
              })),
            },
          })),
        },
      },
      include: { models: { include: { accessories: true } } },
    });

    const transformedDeclaration = {
      ...updatedDeclaration,
      createdAt: updatedDeclaration.createdAt.toISOString(),
      updatedAt: updatedDeclaration.updatedAt.toISOString(),
      date_import: updatedDeclaration.date_import.toISOString(),
      models: updatedDeclaration.models.map(model => ({
        ...model,
        createdAt: model.createdAt.toISOString(),
        updatedAt: model.updatedAt.toISOString(),
        accessories: model.accessories.map(acc => ({
          ...acc,
          quantity_reçu: acc.quantity_reçu || 0,
          quantity_trouve: acc.quantity_trouve || 0,
          quantity_sortie: acc.quantity_sortie || 0,
          quantity_manque: acc.quantity_manque || 0,
        })),
      })),
    };

    console.log("PUT /api/import/[id] - Returning updated declaration:", JSON.stringify(transformedDeclaration, null, 2));
    return NextResponse.json(transformedDeclaration, { status: 200 });
  } catch (error) {
    console.error("PUT /api/import/[id] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.declarationImport.delete({ where: { id } });
    console.log("DELETE /api/import/[id] - Declaration deleted:", id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/import/[id] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}