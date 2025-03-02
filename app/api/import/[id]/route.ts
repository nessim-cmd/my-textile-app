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
        updatedAt: model.createdAt.toISOString(),
        accessories: model.accessories.map(acc => ({
          ...acc,
        })),
      })),
    };

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
    
    await prisma.declarationImport.update({
      where: { id },
      data: {
        num_dec: declarationData.num_dec,
        date_import: new Date(declarationData.date_import),
        client: declarationData.client,
        valeur: declarationData.valeur,
      },
    });

    const existingModels = await prisma.model.findMany({
      where: { declarationImportId: id },
      include: { accessories: true },
    });

    const modelsToDelete = existingModels.filter(
      (model) => !declarationData.models.some((m: Model) => m.id === model.id)
    );

    if (modelsToDelete.length > 0) {
      await prisma.model.deleteMany({
        where: { id: { in: modelsToDelete.map(m => m.id) } },
      });
    }

    const clientName = declarationData.client;
    let client = await prisma.client.findFirst({
      where: { name: clientName },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          name: clientName,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    for (const model of declarationData.models) {
      const modelNameLower = model.name.toLowerCase();
      const existingClientModel = await prisma.clientModel.findFirst({
        where: {
          clientId: client.id,
          name: modelNameLower,
        },
      });

      if (!existingClientModel) {
        await prisma.clientModel.create({
          data: {
            name: modelNameLower,
            clientId: client.id,
            commandes: "",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }
    }

    for (const model of declarationData.models) {
      const existingModel = existingModels.find(m => m.id === model.id);
      if (existingModel) {
        await prisma.model.update({
          where: { id: model.id },
          data: {
            name: model.name,
          },
        });

        const existingAccessories = existingModel.accessories;
        const accessoriesToDelete = existingAccessories.filter(
          (acc) => !model.accessories.some((a: Accessoire) => a.id === acc.id)
        );

        if (accessoriesToDelete.length > 0) {
          await prisma.accessoire.deleteMany({
            where: { id: { in: accessoriesToDelete.map(a => a.id) } },
          });
        }

        for (const acc of model.accessories) {
          if (existingAccessories.some(a => a.id === acc.id)) {
            await prisma.accessoire.update({
              where: { id: acc.id },
              data: {
                reference_accessoire: acc.reference_accessoire,
                quantity_reçu: acc.quantity_reçu,
                quantity_trouve: acc.quantity_trouve,
                quantity_manque: acc.quantity_trouve - acc.quantity_reçu,
              },
            });
          } else {
            await prisma.accessoire.create({
              data: {
                id: acc.id,
                reference_accessoire: acc.reference_accessoire,
                quantity_reçu: acc.quantity_reçu,
                quantity_trouve: acc.quantity_trouve,
                quantity_manque: acc.quantity_trouve - acc.quantity_reçu,
                modelId: model.id,
              },
            });
          }
        }
      } else {
        await prisma.model.create({
          data: {
            id: model.id,
            name: model.name,
            declarationImportId: id,
            createdAt: new Date(),
            updatedAt: new Date(),
            accessories: {
              create: model.accessories.map((acc: Accessoire) => ({
                id: acc.id,
                reference_accessoire: acc.reference_accessoire,
                quantity_reçu: acc.quantity_reçu,
                quantity_trouve: acc.quantity_trouve,
                quantity_manque: acc.quantity_trouve - acc.quantity_reçu,
              })),
            },
          },
        });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
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
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/import/[id] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}