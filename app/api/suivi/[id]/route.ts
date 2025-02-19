import { NextRequest, NextResponse } from 'next/server'
import prisma from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const suivi = await prisma.suiviProduction.findUnique({
      where: { id: params.id },
      include: { lines: true }
    })
    
    return suivi 
      ? NextResponse.json(suivi)
      : NextResponse.json({ error: "Suivi not found" }, { status: 404 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to fetch suivi" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const suiviData = await request.json()
    
    // Update main suivi
    await prisma.suiviProduction.update({
      where: { id: params.id },
      data: {
        model_name: suiviData.model_name,
        qte_total: suiviData.qte_total,
        client: suiviData.client
      }
    })

    // Handle lines
    const existingLines = await prisma.suiviProductionLine.findMany({
      where: { suiviId: params.id }
    })

    // Delete removed lines
    const linesToDelete = existingLines.filter(el => 
      !suiviData.lines.some((sl: any) => sl.id === el.id)
    )
    
    if (linesToDelete.length > 0) {
      await prisma.suiviProductionLine.deleteMany({
        where: { id: { in: linesToDelete.map(l => l.id) } }
      })
    }

    // Update or create lines
    for (const line of suiviData.lines) {
      if (existingLines.some(el => el.id === line.id)) {
        await prisma.suiviProductionLine.update({
          where: { id: line.id },
          data: {
            commande: line.commande,
            qte_livree: line.qte_livree,
            qte_reparation: line.qte_reparation,
            numero_livraison: line.numero_livraison,
            date_export: new Date(line.date_export)
          }
        })
      } else {
        await prisma.suiviProductionLine.create({
          data: {
            ...line,
            date_export: new Date(line.date_export),
            suiviId: params.id
          }
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to update suivi" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.suiviProduction.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to delete suivi" },
      { status: 500 }
    )
  }
}