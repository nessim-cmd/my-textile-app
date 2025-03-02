// app/api/planning/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/db";

// Define interfaces for type safety
interface ModelVariant {
  name: string;
  qte_variante: number;
}

interface ModelPlan {
  id: string;
  name: string;
  lotto: string;
  commande: string;
  ordine: string;
  faconner: string;
  designation: string;
  date_import: Date;
  date_export: Date;
  date_entre_coupe: Date;
  date_sortie_coupe: Date;
  date_entre_chaine: Date;
  date_sortie_chaine: Date;
  planningId: string;
  variantes: ModelVariant[];
}

interface PlanningData {
  name: string;
  status: string;
  models: ModelPlan[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const planning = await prisma.planning.findUnique({
      where: { id: params.id },
      include: { 
        models: {
          include: {
            variantes: true,
          },
        },
      },
    });
    
    return planning 
      ? NextResponse.json(planning)
      : NextResponse.json({ error: "Planning not found" }, { status: 404 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch planning" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const planningData: PlanningData = await request.json();
    
    await prisma.planning.update({
      where: { id: params.id },
      data: {
        name: planningData.name,
        
      },
    });

    // Handle models and variantes updates
    const existingModels = await prisma.modelPlan.findMany({
      where: { planningId: params.id },
    });

    // Delete removed models
    const modelsToDelete = existingModels.filter(em => 
      !planningData.models.some((m: ModelPlan) => m.id === em.id)
    );
    
    if (modelsToDelete.length > 0) {
      await prisma.modelPlan.deleteMany({
        where: { id: { in: modelsToDelete.map(m => m.id) } },
      });
    }

    for (const model of planningData.models) {
      if (existingModels.some(em => em.id === model.id)) {
        await prisma.modelPlan.update({
          where: { id: model.id },
          data: {
            ...model,
            variantes: {
              deleteMany: {},
              create: model.variantes.map((v: ModelVariant) => ({
                name: v.name,
                qte_variante: v.qte_variante,
              })),
            },
          },
        });
      } else {
        await prisma.modelPlan.create({
          data: {
            ...model,
            planningId: params.id,
            variantes: {
              create: model.variantes.map((v: ModelVariant) => ({
                name: v.name,
                qte_variante: v.qte_variante,
              })),
            },
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update planning" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.planning.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete planning" },
      { status: 500 }
    );
  }
}