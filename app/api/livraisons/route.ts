import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() { // Removed email filtering
  try {
    const livraisons = await prisma.livraison.findMany({
      include: {
        lines: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("GET /api/livraisons - Livraisons fetched:", livraisons);
    return NextResponse.json(livraisons);
  } catch (error) {
    console.error("GET /api/livraisons Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch livraisons", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const prefix = `L-${year}-${month}-`;

    const lastLivraison = await prisma.livraison.findFirst({
      where: { id: { startsWith: prefix } },
      orderBy: { id: "desc" },
    });

    const sequenceNumber = lastLivraison ? parseInt(lastLivraison.id.slice(-4), 10) + 1 : 1;
    const livraisonId = `${prefix}${String(sequenceNumber).padStart(4, "0")}`;

    const newLivraison = await prisma.livraison.create({
      data: {
        id: livraisonId,
        name,
        // userId omitted since it’s optional
        issuerName: "",
        issuerAddress: "",
        clientName: "",
        clientAddress: "",
        livraisonDate: "",
        soumission: "",
        soumissionValable: "",
      },
    });

    console.log("POST /api/livraisons - New livraison created:", newLivraison);
    return NextResponse.json(newLivraison, { status: 201 });
  } catch (error) {
    console.error("POST /api/livraisons Error:", error);
    return NextResponse.json(
      { error: "Failed to create livraison", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}