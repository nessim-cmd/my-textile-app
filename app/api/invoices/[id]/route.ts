import { NextRequest, NextResponse } from 'next/server'
import prisma from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: { lines: true }
    })
    
    return invoice 
      ? NextResponse.json(invoice)
      : NextResponse.json({ error: "Invoice not found" }, { status: 404 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceData = await request.json()
    
    await prisma.invoice.update({
      where: { id: params.id },
      data: {
        issuerName: invoiceData.issuerName,
        issuerAddress: invoiceData.issuerAddress,
        clientName: invoiceData.clientName,
        clientAddress: invoiceData.clientAddress,
        invoiceDate: invoiceData.invoiceDate,
        dueDate: invoiceData.dueDate,
        vatActive: invoiceData.vatActive,
        vatRate: invoiceData.vatRate,
        status: invoiceData.status,
        poidsBrut: invoiceData.poidsBrut,
        poidsNet: invoiceData.poidsNet,
        nbrColis: invoiceData.nbrColis,
        modePaiment: invoiceData.modePaiment,
        volume: invoiceData.volume
      }
    })

    const existingLines = await prisma.invoiceLine.findMany({
      where: { invoiceId: params.id }
    })

    const linesToDelete = existingLines.filter(el => 
      !invoiceData.lines.some((l: any) => l.id === el.id)
    )
    
    if (linesToDelete.length > 0) {
      await prisma.invoiceLine.deleteMany({
        where: { id: { in: linesToDelete.map(l => l.id) } }
      })
    }

    for (const line of invoiceData.lines) {
      if (existingLines.some(el => el.id === line.id)) {
        await prisma.invoiceLine.update({
          where: { id: line.id },
          data: {
            reference: line.reference,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice
          }
        })
      } else {
        await prisma.invoiceLine.create({
          data: {
            ...line,
            invoiceId: params.id
          }
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.invoice.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    )
  }
}