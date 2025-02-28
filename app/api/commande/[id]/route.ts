import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/db";
import { Commande } from '@/type';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Type params as a Promise
) {
  try {
    const { id } = await params; // Await params to resolve the id
    const commande = await prisma.commande.findUnique({
      where: { id },
      include: { lines: true }
    });
    
    return commande
      ? NextResponse.json(commande)
      : NextResponse.json({ error: "Commande not found" }, { status: 404 });
  } catch (error) {
    console.error("GET /api/commande/[id] Error:", error);
    
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Type params as a Promise
) {
  try {
    const { id } = await params; // Await params to resolve the id
    const commandeData = await request.json();
    
    await prisma.commande.update({
      where: { id },
      data: {
        issuerName: commandeData.issuerName,
        issuerAddress: commandeData.issuerAddress,
        clientName: commandeData.clientName,
        clientAddress: commandeData.clientAddress,
        commandeDate: commandeData.commandeDate
      }
    });

    const existingLines = await prisma.commandeLine.findMany({
      where: { commandeId: id }
    });

    const linesToDelete = existingLines.filter(el => 
      !commandeData.lines.some((l: Commande) => l.id === el.id)
    );
    
    if (linesToDelete.length > 0) {
      await prisma.commandeLine.deleteMany({
        where: { id: { in: linesToDelete.map(l => l.id) } }
      });
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
        });
      } else {
        await prisma.commandeLine.create({
          data: {
            ...line,
            commandeId: id
          }
        });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/commande/[id] Error:", error);
    
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Type params as a Promise
) {
  try {
    const { id } = await params; // Await params to resolve the id
    await prisma.commande.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/commande/[id] Error:", error);
    
  }
}