/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const livraisonsEntree = await prisma.livraisonEntree.findMany({
      include: {
        client: true,
        models: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const transformedLivraisons = livraisonsEntree.map(livraison => ({
      ...livraison,
      createdAt: livraison.createdAt.toISOString(),
      updatedAt: livraison.updatedAt.toISOString(),
      livraisonDate: livraison.livraisonDate || "",
      models: livraison.models.map(model => ({
        ...model,
        createdAt: model.createdAt.toISOString(),
        updatedAt: model.updatedAt.toISOString(),
      })),
    }));

    console.log("GET /api/livraisonEntree - LivraisonsEntree fetched:", transformedLivraisons);
    return NextResponse.json(transformedLivraisons);
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
    const { name, clientName, livraisonDate, models } = await request.json();

    if (!name || !clientName || !livraisonDate) {
      console.log("POST /api/livraisonEntree - Missing required fields");
      return NextResponse.json({ error: "Name, clientName, and livraisonDate are required" }, { status: 400 });
    }

    // Resolve or create client
    let clientId: string | null = null;
    const existingClient = await prisma.client.findFirst({
      where: { name: clientName },
    });
    if (existingClient) {
      clientId = existingClient.id;
    } else {
      const newClient = await prisma.client.create({
        data: {
          name: clientName,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      clientId = newClient.id;
      console.log(`Created new Client: ${clientName}, ID: ${clientId}`);
    }

    // Generate LivraisonEntree ID
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

    // Create LivraisonEntree
    const newLivraisonEntree = await prisma.livraisonEntree.create({
      data: {
        id: livraisonEntreeId,
        name,
        clientId,
        clientName,
        livraisonDate,
        models: {
          create: models?.map((model: any) => ({
            name: model.name,
            commande: model.commande || "",
            description: model.description || "",
            quantityReçu: model.quantityReçu || 0,
            quantityTrouvee: model.quantityTrouvee || 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          })) || [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: { models: true, client: true },
    });

    const transformedLivraison = {
      ...newLivraisonEntree,
      createdAt: newLivraisonEntree.createdAt.toISOString(),
      updatedAt: newLivraisonEntree.updatedAt.toISOString(),
      livraisonDate: newLivraisonEntree.livraisonDate || "",
      models: newLivraisonEntree.models.map(model => ({
        ...model,
        createdAt: model.createdAt.toISOString(),
        updatedAt: model.updatedAt.toISOString(),
      })),
    };

    console.log("POST /api/livraisonEntree - New livraisonEntree created:", transformedLivraison);
    return NextResponse.json(transformedLivraison, { status: 201 });
  } catch (error) {
    console.error("POST /api/livraisonEntree Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}