import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/db";
import { Invoice } from '@/type';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Type params as a Promise
) {
  try {
    const { id } = await params; // Await params to resolve the id
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { lines: true }
    });
    
    return invoice 
      ? NextResponse.json(invoice)
      : NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  } catch (error) {
    console.error("GET /api/invoice/[id] Error:", error);
    
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Type params as a Promise
) {
  try {
    const { id } = await params; // Await params to resolve the id
    const invoiceData = await request.json();
    
    await prisma.invoice.update({
      where: { id },
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
        volume: invoiceData.volume,
        origineTessuto: invoiceData.origineTessuto,
        gmailclient: invoiceData.gmailclient,
        gmailemetteur: invoiceData.gmailemetteur,
        phoneclient: invoiceData.phoneclient,
        phoneemetteur: invoiceData.phoneemetteur
      }
    });

    const existingLines = await prisma.invoiceLine.findMany({
      where: { invoiceId: id }
    });

    const linesToDelete = existingLines.filter(el => 
      !invoiceData.lines.some((l: Invoice) => l.id === el.id)
    );
    
    if (linesToDelete.length > 0) {
      await prisma.invoiceLine.deleteMany({
        where: { id: { in: linesToDelete.map(l => l.id) } }
      });
    }

    for (const line of invoiceData.lines) {
      if (existingLines.some(el => el.id === line.id)) {
        await prisma.invoiceLine.update({
          where: { id: line.id },
          data: {
            commande: line.reference,
            modele: line.modele,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice
          }
        });
      } else {
        await prisma.invoiceLine.create({
          data: {
            ...line,
            invoiceId: id
          }
        });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/invoice/[id] Error:", error);
    
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Type params as a Promise
) {
  try {
    const { id } = await params; // Await params to resolve the id
    await prisma.invoice.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/invoice/[id] Error:", error);
    
  }
}