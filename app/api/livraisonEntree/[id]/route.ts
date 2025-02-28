import prisma from '@/lib/db';
import { LivraisonEntree } from '@/type';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const livraisonEntree = await prisma.livraisonEntree.findUnique({
      where: { id },
      include: { client: true, lines: true },
    });
    return livraisonEntree
      ? NextResponse.json(livraisonEntree)
      : NextResponse.json({ error: "LivraisonEntree Not Found" }, { status: 404 });
  } catch (error) {
    console.error("GET /api/livraisonEntree/[id] Error:", error);
    
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const livraisonEntreeData = await request.json();

    // Ensure the client exists or create it
    let clientId = livraisonEntreeData.clientId;
    if (!clientId && livraisonEntreeData.clientName) {
      const client = await prisma.client.findFirst({
        where: { name: livraisonEntreeData.clientName },
      });

      if (!client) {
        const newClient = await prisma.client.create({
          data: {
            name: livraisonEntreeData.clientName,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        clientId = newClient.id;
        console.log(`Created new client: ${livraisonEntreeData.clientName} with ID: ${clientId}`);
      } else {
        clientId = client.id;
        console.log(`Found existing client: ${livraisonEntreeData.clientName} with ID: ${clientId}`);
      }
    }

    await prisma.livraisonEntree.update({
      where: { id },
      data: {
        name: livraisonEntreeData.name,
        clientId: clientId || null,
        clientName: livraisonEntreeData.clientName,
        livraisonDate: livraisonEntreeData.livraisonDate,
        userId: livraisonEntreeData.userId || null,
      },
    });

    const existingLines = await prisma.livraisonEntreeLine.findMany({
      where: { livraisonEntreeId: id },
    });

    const linesToDelete = existingLines.filter(
      (el) => !livraisonEntreeData.lines.some((l: LivraisonEntree["lines"][0]) => l.id === el.id)
    );

    if (linesToDelete.length > 0) {
      await prisma.livraisonEntreeLine.deleteMany({
        where: { id: { in: linesToDelete.map((l) => l.id) } },
      });
    }

    for (const line of livraisonEntreeData.lines) {
      let clientModel;

      if (clientId && line.modele) {
        // Convert modele to lowercase before saving
        const modeleLowercase = line.modele.toLowerCase();

        const existingClientModel = await prisma.clientModel.findFirst({
          where: {
            clientId: clientId,
            name: modeleLowercase,
          },
        });

        if (!existingClientModel) {
          clientModel = await prisma.clientModel.create({
            data: {
              clientId: clientId,
              name: modeleLowercase,
              description: null,
              commandes: line.commande || null,
              commandesWithVariants: [],
              lotto: null,
              ordine: null,
              puht: null,
              variants: { create: [] },
            },
            include: { variants: true },
          });
          console.log(`Created new ClientModel: ${clientModel.id}, modele: ${modeleLowercase}, commandes: ${line.commande || 'null'}`);
        } else {
          clientModel = existingClientModel;
          console.log(`Reused existing ClientModel: ${clientModel.id}, modele: ${modeleLowercase}, commandes: ${line.commande || 'null'}`);
        }
      } else {
        console.error(`Missing clientId: ${clientId} or modele: ${line.modele}`);
      }

      if (existingLines.some((el) => el.id === line.id)) {
        await prisma.livraisonEntreeLine.update({
          where: { id: line.id },
          data: {
            modele: line.modele,
            commande: line.commande || "",
            description: line.description || "",
            quantityReçu: line.quantityReçu,
            quantityTrouvee: line.quantityTrouvee,
          },
        });
      } else {
        await prisma.livraisonEntreeLine.create({
          data: {
            ...line,
            commande: line.commande || "",
            description: line.description || "",
            livraisonEntreeId: id,
          },
        });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/livraisonEntree/[id] Error:", error);
    
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.livraisonEntree.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/livraisonEntree/[id] Error:", error);
    
  }
}