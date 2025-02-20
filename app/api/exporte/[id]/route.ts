// app/api/export/[id]/route.ts
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const exporte = await prisma.declarationExport.findUnique({
      where: { id: params.id },
      include: { lines: true },
    });

    if (!exporte) {
      return NextResponse.json({ error: "Export not found" }, { status: 404 });
    }

    return NextResponse.json(exporte, { status: 200 });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const exportData = await request.json();

    await prisma.declarationExport.update({
      where: { id: params.id },
      data: {
        clientName: exportData.clientName,
        exportDate: exportData.exportDate,
        dueDate: exportData.dueDate,
        vatActive: exportData.vatActive,
        vatRate: exportData.vatRate,
        status: exportData.status,
        poidsBrut: exportData.poidsBrut,
        poidsNet: exportData.poidsNet,
        nbrColis: exportData.nbrColis,
        modePaiment: exportData.modePaiment,
        volume: exportData.volume,
        origineTessuto: exportData.origineTessuto,
      },
    });

    const existingLines = await prisma.exportLine.findMany({
      where: { exportId: params.id },
    });

    const linesToDelete = existingLines.filter(
      (el) => !exportData.lines.some((l: any) => l.id === el.id)
    );

    if (linesToDelete.length > 0) {
      await prisma.exportLine.deleteMany({
        where: { id: { in: linesToDelete.map((l) => l.id) } },
      });
    }

    for (const line of exportData.lines) {
      if (existingLines.some((el) => el.id === line.id)) {
        await prisma.exportLine.update({
          where: { id: line.id },
          data: {
            commande: line.commande,
            modele: line.modele,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
          },
        });
      } else {
        await prisma.exportLine.create({
          data: {
            ...line,
            exportId: params.id,
          },
        });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.declarationExport.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete export" },
      { status: 500 }
    );
  }
}