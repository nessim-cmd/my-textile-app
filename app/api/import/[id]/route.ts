import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const declaration = await prisma.declarationImport.findUnique({
      where: { id },
      include: { 
        models: {
          include: { accessories: true }
        }
      }
    });
    return declaration 
      ? NextResponse.json(declaration)
      : NextResponse.json({ error: "Declaration not found" }, { status: 404 });
  } catch (error) {
    console.error("GET /api/import/[id] Error:", error);
    
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
        valeur: parseFloat(declarationData.valeur)
      }
    });

    const existingModels = await prisma.model.findMany({
      where: { declarationImportId: id },
      include: { accessories: true }
    });

    const modelsToDelete = existingModels.filter(em => 
      !declarationData.models.some((dm: any) => dm.id === em.id)
    );
    
    for (const model of modelsToDelete) {
      await prisma.model.delete({ where: { id: model.id } });
    }

    for (const model of declarationData.models) {
      if (existingModels.some(em => em.id === model.id)) {
        await prisma.model.update({
          where: { id: model.id },
          data: {
            name: model.name,
            accessories: {
              deleteMany: {},
              create: model.accessories.map((acc: any) => ({
                reference_accessoire: acc.reference_accessoire,
                quantity_reçu: acc.quantity_reçu,
                quantity_trouve: acc.quantity_trouve,
                quantity_manque: acc.quantity_manque
              }))
            }
          }
        });
      } else {
        const newModel = await prisma.model.create({
          data: {
            name: model.name,
            declarationImportId: id,
            accessories: {
              create: model.accessories.map((acc: any) => ({
                reference_accessoire: acc.reference_accessoire,
                quantity_reçu: acc.quantity_reçu,
                quantity_trouve: acc.quantity_trouve,
                quantity_manque: acc.quantity_manque
              }))
            }
          }
        });

        const client = await prisma.client.findFirst({ where: { name: declarationData.client } });
        if (client && model.name) {
          const clientModel = await prisma.clientModel.upsert({
            where: {
              clientId_name: {
                clientId: client.id,
                name: model.name,
              },
            },
            update: {
              updatedAt: new Date(),
            },
            create: {
              clientId: client.id,
              name: model.name,
              description: null,
              commandes: null,
              lotto: null,
              ordine: null,
              puht: null,
            },
            include: { variants: true }
          });

          const quantityTotal = clientModel.variants.reduce((sum, variant) => sum + (variant.qte_variante || 0), 0);
          await prisma.etatImportExport.upsert({
            where: { modelId: clientModel.id },
            update: {
              dateImport: new Date(declarationData.date_import),
              quantityTotal,
              updatedAt: new Date()
            },
            create: {
              modelId: clientModel.id,
              dateImport: new Date(declarationData.date_import),
              quantityTotal,
              quantityLivree: 0
            }
          });
        } else {
          console.error(`Client not found for name: ${declarationData.client} or model name missing: ${model.name}`);
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/import/[id] Error:", error);
   
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
   
  }
}