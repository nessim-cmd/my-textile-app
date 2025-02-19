import { NextRequest, NextResponse } from 'next/server'
import prisma from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const declaration = await prisma.declarationImport.findUnique({
      where: { id: params.id },
      include: { 
        models: {
          include: {
            accessories: true
          }
        }
      }
    })
    
    return declaration 
      ? NextResponse.json(declaration)
      : NextResponse.json({ error: "Declaration not found" }, { status: 404 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to fetch declaration" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const declarationData = await request.json()
    
    // Update main declaration
    await prisma.declarationImport.update({
      where: { id: params.id },
      data: {
        num_dec: declarationData.num_dec,
        date_import: new Date(declarationData.date_import),
        client: declarationData.client,
        valeur: parseFloat(declarationData.valeur)
      }
    })

    // Handle models and accessories
    const existingModels = await prisma.model.findMany({
      where: { declarationImportId: params.id },
      include: { accessories: true }
    })

    // Delete removed models and their accessories
    const modelsToDelete = existingModels.filter(em => 
      !declarationData.models.some((dm: any) => dm.id === em.id)
    )
    
    for (const model of modelsToDelete) {
      await prisma.model.delete({
        where: { id: model.id }
      })
    }

    // Update or create models
    for (const model of declarationData.models) {
      if (existingModels.some(em => em.id === model.id)) {
        // Update existing model
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
        })
      } else {
        // Create new model
        await prisma.model.create({
          data: {
            name: model.name,
            declarationImportId: params.id,
            accessories: {
              create: model.accessories.map((acc: any) => ({
                reference_accessoire: acc.reference_accessoire,
                quantity_reçu: acc.quantity_reçu,
                quantity_trouve: acc.quantity_trouve,
                quantity_manque: acc.quantity_manque
              }))
            }
          }
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to update declaration" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.declarationImport.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to delete declaration" },
      { status: 500 }
    )
  }
}