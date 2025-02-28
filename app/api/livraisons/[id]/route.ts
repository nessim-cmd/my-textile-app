import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Livraison } from "@/type";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const livraison = await prisma.livraison.findUnique({
      where: { id: params.id },
      include: { lines: true },
    });

    return livraison
      ? NextResponse.json(livraison)
      : NextResponse.json({ error: "Livraison not found" }, { status: 404 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch livraison" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const livraisonData = await request.json();

    await prisma.livraison.update({
      where: { id: params.id },
      data: {
        issuerName: livraisonData.issuerName,
        issuerAddress: livraisonData.issuerAddress,
        clientName: livraisonData.clientName,
        clientAddress: livraisonData.clientAddress,
        livraisonDate: livraisonData.livraisonDate,
        soumission: livraisonData.soumission,
        soumissionValable: livraisonData.soumissionValable,
      },
    });

    const existingLines = await prisma.livraisonLine.findMany({
      where: { livraisonId: params.id },
    });

    const linesToDelete = existingLines.filter(
      (el) => !livraisonData.lines.some((l: Livraison) => l.id === el.id)
    );

    if (linesToDelete.length > 0) {
      await prisma.livraisonLine.deleteMany({
        where: { id: { in: linesToDelete.map((l) => l.id) } },
      });
    }

    for (const line of livraisonData.lines) {
      if (existingLines.some((el) => el.id === line.id)) {
        await prisma.livraisonLine.update({
          where: { id: line.id },
          data: {
            modele: line.modele,
            commande: line.commande,
            description: line.description,
            quantity: line.quantity,
          },
        });
      } else {
        await prisma.livraisonLine.create({
          data: {
            ...line,
            livraisonId: params.id,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update livraison" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.livraison.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete livraison" }, { status: 500 });
  }
}