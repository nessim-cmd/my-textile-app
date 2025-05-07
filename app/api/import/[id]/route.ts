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
          !acc.reference_accessoire?.trim() ||
          !acc.description?.trim() ||
          acc.quantity_reçu === null ||
          acc.quantity_reçu === undefined ||
          isNaN(Number(acc.quantity_reçu)) ||
          acc.quantity_trouve === null ||
          acc.quantity_trouve === undefined ||
          isNaN(Number(acc.quantity_trouve)) ||
          acc.quantity_sortie === null ||
          acc.quantity_sortie === undefined ||
          isNaN(Number(acc.quantity_sortie))
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

    // Check for duplicate reference_accessoire within the same model
    for (const model of validModels) {
      for (const acc of model.accessories) {
        if (!acc.id || acc.id.startsWith('temp-')) {
          const existingAccessory = await prisma.accessoire.findFirst({
            where: {
              reference_accessoire: acc.reference_accessoire,
              modelId: model.id,
            },
          });
          if (existingAccessory) {
            console.error(
              "PUT /api/import/[id] - Duplicate reference_accessoire found:",
              acc.reference_accessoire,
              "for model:",
              model.name
            );
            return NextResponse.json(
              {
                error: `Duplicate reference_accessoire '${acc.reference_accessoire}' for model '${model.name}'`,
                details: "Each accessory must have a unique reference_accessoire within a model",
              },
              { status: 400 }
            );
          }
        }
      }
    }

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
        }
      }
    } catch (error) {
      console.error("PUT /api/import/[id] - ClientModel operation failed:", error);
      return NextResponse.json(
        { error: "Failed to sync client models", details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }

    // Log current database state
    console.log("PUT /api/import/[id] - Checking current accessories for declaration:", id);
    const existingAccessories = await prisma.accessoire.findMany({
      where: { model: { declarationImportId: id } },
    });
    console.log("PUT /api/import/[id] - Existing accessories:", JSON.stringify(existingAccessories, null, 2));

    // Update DeclarationImport and handle accessories
    let updatedDeclaration;
    try {
      updatedDeclaration = await prisma.$transaction(async (tx) => {
        // Step 1: Update declaration fields
        console.log("PUT /api/import/[id] - Updating declaration:", id);
        const declaration = await tx.declarationImport.update({
          where: { id },
          data: {
            num_dec,
            date_import: new Date(date_import),
            client,
            valeur: Number(valeur),
            updatedAt: new Date(),
          },
        });

        // Step 2: Update or create models
        console.log("PUT /api/import/[id] - Processing models");
        const modelRecords = [];
        for (const model of validModels) {
          let modelRecord;
          if (model.id && !model.id.startsWith('temp-')) {
            // Update existing model
            modelRecord = await tx.model.update({
              where: { id: model.id },
              data: {
                name: model.name || "",
                commande: model.commande || "",
                description: model.description || "",
                quantityReçu: Math.floor(Number(model.quantityReçu)) || 0,
                quantityTrouvee: Math.floor(Number(model.quantityTrouvee)) || 0,
                updatedAt: new Date(),
              },
            });
          } else {
            // Create new model
            modelRecord = await tx.model.create({
              data: {
                name: model.name || "",
                commande: model.commande || "",
                description: model.description || "",
                quantityReçu: Math.floor(Number(model.quantityReçu)) || 0,
                quantityTrouvee: Math.floor(Number(model.quantityTrouvee)) || 0,
                declarationImportId: id,
                createdAt: new Date(model.createdAt || new Date()),
                updatedAt: new Date(),
              },
            });
          }
          modelRecords.push({ inputModel: model, dbModel: modelRecord });
        }

        console.log("PUT /api/import/[id] - Processed models:", JSON.stringify(modelRecords.map(r => r.dbModel.name), null, 2));

        // Step 3: Delete existing accessories for updated models
        console.log("PUT /api/import/[id] - Deleting existing accessories for models");
        for (const { dbModel } of modelRecords) {
          await tx.accessoire.deleteMany({
            where: { modelId: dbModel.id },
          });
        }

        // Step 4: Create accessories for each model
        console.log("PUT /api/import/[id] - Creating accessories");
        for (const { inputModel, dbModel } of modelRecords) {
          for (const acc of inputModel.accessories) {
            console.log("Creating accessory for model:", dbModel.name, "Accessory:", acc.reference_accessoire);
            try {
              await tx.accessoire.create({
                data: {
                  id: acc.id && !acc.id.startsWith('temp-') ? acc.id : undefined,
                  reference_accessoire: acc.reference_accessoire || "",
                  description: acc.description || "",
                  quantity_reçu: Math.floor(Number(acc.quantity_reçu)) || 0,
                  quantity_trouve: Math.floor(Number(acc.quantity_trouve)) || 0,
                  quantity_sortie: Math.floor(Number(acc.quantity_sortie)) || 0,
                  quantity_manque: Math.floor(Number(acc.quantity_trouve)) - Math.floor(Number(acc.quantity_reçu)),
                  modelId: dbModel.id,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              });
            } catch (accError) {
              console.error("Failed to create accessory:", acc.reference_accessoire, "Error:", accError);
              throw new Error(`Failed to create accessory '${acc.reference_accessoire}' for model '${dbModel.name}': ${accError instanceof Error ? accError.message : String(accError)}`);
            }
          }
        }

        // Step 5: Fetch updated declaration
        console.log("PUT /api/import/[id] - Fetching updated declaration");
        const result = await tx.declarationImport.findUnique({
          where: { id },
          include: { models: { include: { accessories: true } } },
        });

        if (!result) {
          throw new Error("Failed to fetch updated declaration");
        }

        return result;
      });
    } catch (error) {
      console.error("PUT /api/import/[id] - Prisma transaction failed:", error || "Unknown error");
      return NextResponse.json(
        { 
          error: "Failed to update declaration", 
          details: error instanceof Error ? error.message : String(error || "Unknown error")
        },
        { status: 500 }
      );
    }

    // Log final database state
    console.log("PUT /api/import/[id] - Checking final accessories for declaration:", id);
    const finalAccessories = await prisma.accessoire.findMany({
      where: { model: { declarationImportId: id } },
    });
    console.log("PUT /api/import/[id] - Final accessories:", JSON.stringify(finalAccessories, null, 2));

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
    console.error("PUT /api/import/[id] - Unexpected error:", error || "Unknown error");
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : String(error || "Unknown error")
      },
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