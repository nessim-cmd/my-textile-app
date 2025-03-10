import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() { // Removed unused 'request' parameter
  try {
    const livraisonsEntree = await prisma.livraisonEntree.findMany({
      include: {
        lines: true,
        client: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("GET /api/livraisonEntree - LivraisonsEntree fetched:", livraisonsEntree);
    return NextResponse.json(livraisonsEntree);
  } catch (error) {
    console.error("GET /api/livraisonEntree Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/livraisonEntree - Request received");
    const { name } = await request.json();

    if (!name) {
      console.log("POST /api/livraisonEntree - Missing name field");
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const prefix = `L.E${year}-${month}-`;

    const lastLivraisonEntree = await prisma.livraisonEntree.findFirst({
      where: { id: { startsWith: prefix } },
      orderBy: { id: "desc" },
    });

    const sequenceNumber = lastLivraisonEntree ? parseInt(lastLivraisonEntree.id.slice(-4), 10) + 1 : 1;
    const livraisonEntreeId = `${prefix}${String(sequenceNumber).padStart(4, "0")}`;

    const newLivraisonEntree = await prisma.livraisonEntree.create({
      data: {
        id: livraisonEntreeId,
        name,
        clientName: "",
        livraisonDate: "",
        // userId is optional, so we omit it here
      },
    });

    console.log("POST /api/livraisonEntree - New livraisonEntree created:", newLivraisonEntree);
    return NextResponse.json(newLivraisonEntree, { status: 201 });
  } catch (error) {
    console.error("POST /api/livraisonEntree Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}