import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const dateDebut = searchParams.get('dateDebut');
    const dateFin = searchParams.get('dateFin');
    const searchTerm = searchParams.get('search');
    const client = searchParams.get('client'); // Filter by client name

    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    let where: any = {};

    if (dateDebut && dateFin) {
      const startDate = new Date(dateDebut);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(dateFin);
      endDate.setUTCHours(23, 59, 59, 999);
      where.createdAt = { gte: startDate, lte: endDate };
    }

    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { client: { name: { contains: searchTerm, mode: 'insensitive' } } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { commandes: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (client) {
      const clientRecord = await prisma.client.findFirst({ where: { name: client } });
      if (clientRecord) {
        where.clientId = clientRecord.id; // Filter by clientId
      } else {
        return NextResponse.json([]); // Return empty array if client not found
      }
    }

    const models = await prisma.clientModel.findMany({
      where,
      include: {
        client: true,
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(models);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch client models' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newModel = await prisma.clientModel.create({
      data: {
        name: body.name,
        description: body.description,
        commandes: body.commandes,
        lotto: body.lotto,
        ordine: body.ordine,
        puht: parseFloat(body.puht) || 0,
        clientId: body.clientId,
        variants: {
          create: body.variants.map((v: any) => ({
            name: v.name,
            qte_variante: parseInt(v.qte_variante) || 0,
          })),
        },
      },
      include: { variants: true, client: true },
    });
    return NextResponse.json(newModel, { status: 201 });
  } catch (error) {
    console.error('Error creating client model:', error);
    return NextResponse.json({ error: 'Failed to create client model' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    await prisma.variant.deleteMany({ where: { clientModelId: body.id } });
    const updatedModel = await prisma.clientModel.update({
      where: { id: body.id },
      data: {
        name: body.name,
        description: body.description,
        commandes: body.commandes,
        lotto: body.lotto,
        ordine: body.ordine,
        puht: parseFloat(body.puht) || 0,
        clientId: body.clientId,
        variants: {
          create: body.variants.map((v: any) => ({
            name: v.name,
            qte_variante: parseInt(v.qte_variante) || 0,
          })),
        },
      },
      include: { variants: true, client: true },
    });
    return NextResponse.json(updatedModel);
  } catch (error) {
    console.error('Error updating client model:', error);
    return NextResponse.json({ error: 'Failed to update client model' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    await prisma.clientModel.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client model:', error);
    return NextResponse.json({ error: 'Failed to delete client model' }, { status: 500 });
  }
}