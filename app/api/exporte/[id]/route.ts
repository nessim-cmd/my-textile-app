import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { ExportLine } from "@/type";

export async function GET(
  _: NextRequest, // Use underscore for unused parameter
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const declaration = await prisma.declarationExport.findUnique({
      where: { id },
      include: { lines: true },
    });
    
    if (!declaration) {
      return NextResponse.json({ error: "Declaration not found" }, { status: 404 });
    }

    const transformedDeclaration = {
      ...declaration,
      createdAt: declaration.createdAt.toISOString(),
      updatedAt: declaration.updatedAt.toISOString(),
      exportDate: declaration.exportDate ? new Date(declaration.exportDate).toISOString() : "",
      lines: declaration.lines.map(line => ({
        ...line,
        isExcluded: line.isExcluded,
      })),
    };

    return NextResponse.json(transformedDeclaration, { status: 200 });
  } catch (error) {
    console.error("GET /api/exporte/[id] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const declarationData = await request.json();
    
    await prisma.declarationExport.update({
      where: { id },
      data: {
        num_dec: declarationData.num_dec,
        exportDate: declarationData.exportDate,
        clientName: declarationData.clientName,
        valeur: declarationData.valeur,
        dueDate: declarationData.dueDate,
        vatActive: declarationData.vatActive,
        vatRate: declarationData.vatRate,
        status: declarationData.status,
        poidsBrut: declarationData.poidsBrut,
        poidsNet: declarationData.poidsNet,
        nbrColis: declarationData.nbrColis,
        modePaiment: declarationData.modePaiment,
        volume: declarationData.volume,
        origineTessuto: declarationData.origineTessuto,
      },
    });

    const existingLines = await prisma.exportLine.findMany({
      where: { exportId: id },
    });

    const linesToDelete = existingLines.filter(
      (line) => !declarationData.lines.some((l: ExportLine) => l.id === line.id)
    );

    if (linesToDelete.length > 0) {
      await prisma.exportLine.deleteMany({
        where: { id: { in: linesToDelete.map(l => l.id) } },
      });
    }

    for (const line of declarationData.lines) {
      if (existingLines.some(el => el.id === line.id)) {
        await prisma.exportLine.update({
          where: { id: line.id },
          data: {
            commande: line.commande,
            modele: line.modele,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            isExcluded: line.isExcluded,
          },
        });
      } else {
        await prisma.exportLine.create({
          data: {
            id: line.id,
            commande: line.commande,
            modele: line.modele,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            isExcluded: line.isExcluded,
            exportId: id,
          },
        });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/exporte/[id] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest, // Use underscore for unused parameter
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.declarationExport.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/exporte/[id] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}