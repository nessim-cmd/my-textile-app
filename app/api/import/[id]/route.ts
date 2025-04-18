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
    let declarationData;
    try {
      declarationData = await request.json();
    } catch (error) {
      console.error("PUT /api/import/[id] - Invalid JSON input:", error);
      return NextResponse.json(
        { error: "Invalid JSON input", details: error instanceof Error ? error.message : String(error) },
        { status: 400 }
      );
    }

    console.log("PUT /api/import/[id] - Received data:", JSON.stringify(declarationData, null, 2));

    const { num_dec, date_import, client, valeur, models } = declarationData;

    // Validate required fields
    if (!num_dec || !date_import || !client || valeur === undefined || isNaN(valeur)) {
      console.error("PUT /api/import/[id] - Missing or invalid required fields:", { num_dec, date_import, client, valeur });
      return NextResponse.json(
        { error: "num_dec, date_import, client, and valid valeur are required" },
        { status: 400 }
      );
    }

    // Validate models array
    if (!Array.isArray(models)) {
      console.error("PUT /api/import/[id] - Models is not an array:", models);
      return NextResponse.json(
        { error: "Models must be an array" },
        { status: 400 }
      );
    }

    // Validate each model and its accessories
    for (const model of models) {
      if (!model.name || typeof model.name !== "string") {
        console.warn("PUT /api/import/[id] - Skipping model with invalid name:", model);
        continue;
      }
      if (!Array.isArray(model.accessories)) {
        console.error("PUT /api/import/[id] - Accessories is not an array for model:", model.name);
        return NextResponse.json(
          { error: `Accessories must be an array for model ${model.name}` },
          { status: 400 }
        );
      }
      for (const acc of model.accessories) {
        if (
          acc.reference_accessoire === null ||
          acc.reference_accessoire === undefined ||
          acc.reference_accessoire.trim() === "" ||
          acc.description === null ||
          acc.description === undefined ||
          acc.description.trim() === "" ||
          acc.quantity_reçu === null ||
          acc.quantity_reçu === undefined ||
          isNaN(acc.quantity_reçu) ||
          acc.quantity_trouve === null ||
          acc.quantity_trouve === undefined ||
          isNaN(acc.quantity_trouve) ||
          acc.quantity_sortie === null ||
          acc.quantity_sortie === undefined ||
          isNaN(acc.quantity_sortie)
        ) {
          console.error("PUT /api/import/[id] - Invalid accessory data for model:", model.name, JSON.stringify(acc, null, 2));
          return NextResponse.json(
            { error: `Invalid accessory data for model ${model.name}: reference_accessoire and description must be non-empty strings, quantities must be valid numbers` },
            { status: 400 }
          );
        }
      }
    }

    // Filter out invalid models and accessories
    const validModels = models
      .filter((model: Model) => model.name && typeof model.name === "string")
      .map((model: Model) => ({
        ...model,
        accessories: model.accessories.filter(
          (acc: Accessoire) =>
            acc.reference_accessoire?.trim() &&
            acc.description?.trim() &&
            !isNaN(Number(acc.quantity_reçu)) &&
            !isNaN(Number(acc.quantity_trouve)) &&
            !isNaN(Number(acc.quantity_sortie))
        ),
      }));

    console.log("PUT /api/import/[id] - Valid models after filtering:", JSON.stringify(validModels, null, 2));

    // Resolve or create client
    let clientRecord;
    try {
      clientRecord = await prisma.client.findFirst({ where: { name: client } });
      if (!clientRecord) {
        clientRecord = await prisma.client.create({
          data: {
            name: client,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        console.log("PUT /api/import/[id] - Created new client:", clientRecord.name);
      } else {
        console.log("PUT /api/import/[id] - Found existing client:", clientRecord.name);
      }
    } catch (error) {
      console.error("PUT /api/import/[id] - Client operation failed:", error);
      return NextResponse.json(
        { error: "Failed to resolve client", details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }

    // Sync ClientModel entries
    try {
      for (const model of validModels) {
        if (!model.name) {
          console.warn("PUT /api/import/[id] - Skipping model with no name");
          continue;
        }
        const modelNameLower = model.name.toLowerCase();
        let clientModel = await prisma.clientModel.findFirst({
          where: {
            clientId: clientRecord.id,
            name: modelNameLower,
          },
        });
        if (!clientModel) {
          clientModel = await prisma.clientModel.create({
            data: {
              name: modelNameLower,
              clientId: clientRecord.id,
              commandes: model.commande || "",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
          console.log("PUT /api/import/[id] - Created new client model:", modelNameLower);
        } else {
          console.log("PUT /api/import/[id] - Found existing client model:", modelNameLower);
        }
      }
    } catch (error) {
      console.error("PUT /api/import/[id] - ClientModel operation failed:", error);
      return NextResponse.json(
        { error: "Failed to sync client models", details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }

    // Update DeclarationImport and replace models/accessories
    let updatedDeclaration;
    try {
      updatedDeclaration = await prisma.declarationImport.update({
        where: { id },
        data: {
          num_dec,
          date_import: new Date(date_import),
          client,
          valeur: Number(valeur),
          updatedAt: new Date(),
          models: {
            deleteMany: {},
            create: validModels.map((model: Model) => {
              console.log("PUT /api/import/[id] - Creating model:", model.name, "Accessories:", model.accessories);
              return {
                id: model.id && !model.id.startsWith('temp-') ? model.id : undefined,
                name: model.name || "",
                commande: model.commande || "",
                description: model.description || "",
                quantityReçu: Number(model.quantityReçu) || 0,
                quantityTrouvee: Number(model.quantityTrouvee) || 0,
                createdAt: new Date(model.createdAt || new Date()),
                updatedAt: new Date(),
                accessories: {
                  create: model.accessories.map((acc: Accessoire) => {
                    console.log("PUT /api/import/[id] - Creating accessory:", acc.reference_accessoire);
                    return {
                      id: acc.id && !acc.id.startsWith('temp-') ? acc.id : undefined,
                      reference_accessoire: acc.reference_accessoire,
                      description: acc.description,
                      quantity_reçu: Number(acc.quantity_reçu) || 0,
                      quantity_trouve: Number(acc.quantity_trouve) || 0,
                      quantity_sortie: Number(acc.quantity_sortie) || 0,
                      quantity_manque: (Number(acc.quantity_trouve) || 0) - (Number(acc.quantity_reçu) || 0),
                    };
                  }),
                },
              };
            }),
          },
        },
        include: { models: { include: { accessories: true } } },
      });
    } catch (error) {
      console.error("PUT /api/import/[id] - Prisma update failed:", error);
      return NextResponse.json(
        { error: "Failed to update declaration", details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }

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
    console.error("PUT /api/import/[id] - Unexpected error:", error);
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