import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/db";

// Define interfaces for type safety
interface LivraisonLine {
  id: string;
  modele: string;
  commande: string;
  description: string;
  quantity: number;
  livraisonId: string;
}

interface LivraisonData {
  name: string;
  livraisonDate: string;
  clientName: string;
  lines: LivraisonLine[];
}

// Define the GET handler
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const livraison = await prisma.livraison.findUnique({
      where: { id },
      include: { lines: true },
    });
    
    return livraison 
      ? NextResponse.json(livraison)
      : NextResponse.json({ error: "Livraison not found" }, { status: 404 });
  } catch (error) {
    console.error("GET /api/livraisons/[id] Error:", error);
    return NextResponse.json({ error: "Failed to fetch livraison" }, { status: 500 });
  }
}

// Define the PUT handler
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const livraisonData: LivraisonData = await request.json();
    
    // Update main livraison
    await prisma.livraison.update({
      where: { id },
      data: {
        name: livraisonData.name,
        livraisonDate: livraisonData.livraisonDate,
        clientName: livraisonData.clientName,
      },
    });

    // Handle lines
    const existingLines = await prisma.livraisonLine.findMany({
      where: { livraisonId: id },
    });

    // Delete removed lines
    const linesToDelete = existingLines.filter(el => 
      !livraisonData.lines.some((sl: LivraisonLine) => sl.id === el.id)
    );
    
    if (linesToDelete.length > 0) {
      await prisma.livraisonLine.deleteMany({
        where: { id: { in: linesToDelete.map(l => l.id) } },
      });
    }

    // Update or create lines
    for (const line of livraisonData.lines) {
      if (existingLines.some(el => el.id === line.id)) {
        await prisma.livraisonLine.update({
          where: { id: line.id },
          data: {
            modele: line.modele,
            commande: line.commande,
            description: line.description,
            quantity: line.quantity ? parseInt(line.quantity.toString()) : 0,
          },
        });
      } else {
        await prisma.livraisonLine.create({
          data: {
            ...line,
            quantity: line.quantity ? parseInt(line.quantity.toString()) : 0,
            livraisonId: id,
          },
        });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/livraisons/[id] Error:", error);
    return NextResponse.json({ error: "Failed to update livraison" }, { status: 500 });
  }
}

// Define the DELETE handler
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.livraison.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/livraisons/[id] Error:", error);
    return NextResponse.json({ error: "Failed to delete livraison" }, { status: 500 });
  }
}