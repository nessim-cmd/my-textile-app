import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const commandes = await prisma.commande.findMany({
      include: {
        lines: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("GET /api/commandes - Commandes fetched:", commandes.length);
    return NextResponse.json(commandes, { status: 200 });
  } catch (error) {
    console.error("GET /api/commandes Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch commandes", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const prefix = `C-${year}-${month}-`;

    const lastCommande = await prisma.commande.findFirst({
      where: { id: { startsWith: prefix } },
      orderBy: { id: "desc" },
    });

    const sequenceNumber = lastCommande ? parseInt(lastCommande.id.slice(-4), 10) + 1 : 1;
    const commandeId = `${prefix}${String(sequenceNumber).padStart(4, "0")}`;

    const newCommande = await prisma.commande.create({
      data: {
        id: commandeId,
        name,
        // userId omitted since it’s optional
        issuerName: "",
        issuerAddress: "",
        clientName: "",
        clientAddress: "",
        commandeDate: "",
      },
    });

    console.log("POST /api/commandes - New commande created:", newCommande);
    return NextResponse.json(newCommande, { status: 201 });
  } catch (error) {
    console.error("POST /api/commandes Error:", error);
    return NextResponse.json(
      { error: "Failed to create commande", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}