import { NextRequest, NextResponse } from 'next/server'
import prisma from "@/lib/db"
import { Commande } from '@/type'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commande = await prisma.commande.findUnique({
      where: { id: params.id },
      include: { lines: true }
    })
    
    return commande
      ? NextResponse.json(commande)
      : NextResponse.json({ error: "Commande not found" }, { status: 404 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to fetch commande" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commandeData = await request.json()
    
    await prisma.commande.update({
      where: { id: params.id },
      data: {
        issuerName: commandeData.issuerName,
        issuerAddress: commandeData.issuerAddress,
        clientName: commandeData.clientName,
        clientAddress: commandeData.clientAddress,
        commandeDate: commandeData.commandeDate
        
      }
    })

    const existingLines = await prisma.commandeLine.findMany({
      where: { commandeId: params.id }
    })

    const linesToDelete = existingLines.filter(el => 
      !commandeData.lines.some((l: Commande) => l.id === el.id)
    )
    
    if (linesToDelete.length > 0) {
      await prisma.commandeLine.deleteMany({
        where: { id: { in: linesToDelete.map(l => l.id) } }
      })
    }

    for (const line of commandeData.lines) {
      if (existingLines.some(el => el.id === line.id)) {
        await prisma.commandeLine.update({
          where: { id: line.id },
          data: {
            reference: line.reference,
            description: line.description,
            quantity: line.quantity
          }
        })
      } else {
        await prisma.commandeLine.create({
          data: {
            ...line,
            commandeId: params.id
          }
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to update commande" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.commande.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to delete commande" },
      { status: 500 }
    )
  }
}