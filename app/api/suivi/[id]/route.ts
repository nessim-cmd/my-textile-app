import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/db";

// Define interfaces for type safety
interface SuiviProductionLine {
  id: string;
  commande: string;
  qte_livree: number;
  qte_reparation: number;
  numero_livraison: string;
  date_export: Date;
  suiviId: string;
}

interface SuiviProductionData {
  model_name: string;
  qte_total: number;
  client: string;
  lines: SuiviProductionLine[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const suivi = await prisma.suiviProduction.findUnique({
      where: { id },
      include: { lines: true },
    });
    
    return suivi 
      ? NextResponse.json(suivi)
      : NextResponse.json({ error: "Suivi not found" }, { status: 404 });
  } catch (error) {
    console.error("GET /api/suivi/[id] Error:", error);
    return NextResponse.json({ error: "Failed to fetch suivi" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const suiviData: SuiviProductionData = await request.json();
    
    // Update main suivi
    await prisma.suiviProduction.update({
      where: { id },
      data: {
        model_name: suiviData.model_name,
        qte_total: suiviData.qte_total,
        client: suiviData.client,
      },
    });

    // Handle lines
    const existingLines = await prisma.suiviProductionLine.findMany({
      where: { suiviId: id },
    });

    // Delete removed lines
    const linesToDelete = existingLines.filter(el => 
      !suiviData.lines.some((sl: SuiviProductionLine) => sl.id === el.id)
    );
    
    if (linesToDelete.length > 0) {
      await prisma.suiviProductionLine.deleteMany({
        where: { id: { in: linesToDelete.map(l => l.id) } },
      });
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
            date_export: new Date(line.date_export),
          },
        });
      } else {
        await prisma.suiviProductionLine.create({
          data: {
            ...line,
            date_export: new Date(line.date_export),
            suiviId: id,
          },
        });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/suivi/[id] Error:", error);
    return NextResponse.json({ error: "Failed to update suivi" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.suiviProduction.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/suivi/[id] Error:", error);
    return NextResponse.json({ error: "Failed to delete suivi" }, { status: 500 });
  }
}