/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const livraisonEntree = await prisma.livraisonEntree.findUnique({
      where: { id },
      include: {
        client: true,
        models: true,
      },
    });

    if (!livraisonEntree) {
      return NextResponse.json({ error: "LivraisonEntree not found" }, { status: 404 });
    }

    const transformedLivraison = {
      ...livraisonEntree,
      createdAt: livraisonEntree.createdAt.toISOString(),
      updatedAt: livraisonEntree.updatedAt.toISOString(),
      livraisonDate: livraisonEntree.livraisonDate || "",
      models: livraisonEntree.models.map((model) => ({
        ...model,
        createdAt: model.createdAt.toISOString(),
        updatedAt: model.updatedAt.toISOString(),
      })),
    };

    console.log(`GET /api/livraisonEntree/${id} - Fetched:`, transformedLivraison);
    return NextResponse.json(transformedLivraison);
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, clientName, clientId, livraisonDate, models } = body;

    console.log(`PUT /api/livraisonEntree/${id} - Request body:`, body);

    if (!name || !clientName || !clientId || !livraisonDate) {
      return NextResponse.json(
        { error: "Name, clientName, clientId, and livraisonDate are required" },
        { status: 400 }
      );
    }

    // Resolve or create client (for consistency, though clientId should already exist)
    let resolvedClientId = clientId;
    const existingClient = await prisma.client.findFirst({
      where: { name: clientName },
    });
    if (!existingClient) {
      const newClient = await prisma.client.create({
        data: {
          name: clientName,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      resolvedClientId = newClient.id;
      console.log(`Created new Client: ${clientName}, ID: ${resolvedClientId}`);
    } else if (existingClient.id !== clientId) {
      console.warn(`Client ID mismatch: ${clientId} vs ${existingClient.id}, using ${existingClient.id}`);
      resolvedClientId = existingClient.id;
    }

    // Sync ClientModel entries
    if (Array.isArray(models) && models.length > 0) {
      for (const model of models) {
        if (!model.name) {
          console.log(`Skipping model with no name for clientId: ${resolvedClientId}`);
          continue;
        }

        const modelNameLower = model.name.toLowerCase();
        const existingClientModel = await prisma.clientModel.findFirst({
          where: {
            clientId: resolvedClientId,
            name: modelNameLower,
          },
        });

        if (!existingClientModel) {
          const newClientModel = await prisma.clientModel.create({
            data: {
              name: modelNameLower,
              clientId: resolvedClientId,
              description: model.description || null,
              commandes: model.commande || null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
          console.log(`Created ClientModel: ${modelNameLower}, ID: ${newClientModel.id} for clientId: ${resolvedClientId}`);
        } else {
          console.log(`Skipped duplicate ClientModel: ${modelNameLower}, ID: ${existingClientModel.id} for clientId: ${resolvedClientId}`);
        }
      }
    }

    // Update LivraisonEntree
    const updatedLivraisonEntree = await prisma.livraisonEntree.update({
      where: { id },
      data: {
        name,
        clientName,
        clientId: resolvedClientId,
        livraisonDate,
        updatedAt: new Date(),
        models: {
          deleteMany: {},
          create: models.map((model: any) => ({
            name: model.name,
            commande: model.commande || "",
            description: model.description || "",
            quantityReçu: model.quantityReçu || 0,
            quantityTrouvee: model.quantityTrouvee || 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
        },
      },
      include: { models: true, client: true },
    });

    const transformedLivraison = {
      ...updatedLivraisonEntree,
      createdAt: updatedLivraisonEntree.createdAt.toISOString(),
      updatedAt: updatedLivraisonEntree.updatedAt.toISOString(),
      livraisonDate: updatedLivraisonEntree.livraisonDate || "",
      models: updatedLivraisonEntree.models.map((model) => ({
        ...model,
        createdAt: model.createdAt.toISOString(),
        updatedAt: model.updatedAt.toISOString(),
      })),
    };

    console.log(`PUT /api/livraisonEntree/${id} - Updated:`, transformedLivraison);
    return NextResponse.json(transformedLivraison);
  } catch (error) {
    console.error( error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.livraisonEntree.delete({ where: { id } });
    console.log(`DELETE /api/livraisonEntree/${id} - Deleted`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error( error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}