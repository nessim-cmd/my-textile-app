import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateDebut = searchParams.get('dateDebut');
    const dateFin = searchParams.get('dateFin');
    const searchTerm = searchParams.get('search');

    let where: any = {};

    // Date filtering
    if (dateDebut && dateFin) {
      const startDate = new Date(dateDebut);
      startDate.setUTCHours(0, 0, 0, 0);
      
      const endDate = new Date(dateFin);
      endDate.setUTCHours(23, 59, 59, 999);

      where.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Search filtering
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } }, // Model name search
        { client: { name: { contains: searchTerm, mode: 'insensitive' } } }, // Client name search
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { commandes: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const models = await prisma.clientModel.findMany({
      where,
      include: {
        client: true,
        variants: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(models);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Failed to fetch client models' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newModel = await prisma.clientModel.create({
      data: {
        name: body.name,
        description: body.description,
        commandes: body.commandes,
        lotto: body.lotto,
        ordine: body.ordine,
        puht: parseFloat(body.puht),
        clientId: body.clientId,
        variants: {
          create: body.variants.map(v  => ({
            name: v.name,
            qte_variante: parseInt(v.qte_variante)
          }))
        }
      },
      include: { variants: true }
    });

    return NextResponse.json(newModel, { status: 201 });
  } catch (error) {
    console.error('Error creating client model:', error);
    return NextResponse.json(
      { error: 'Failed to create client model' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // Delete existing variants
    await prisma.variant.deleteMany({
      where: { clientModelId: body.id }
    });

    const updatedModel = await prisma.clientModel.update({
      where: { id: body.id },
      data: {
        name: body.name,
        description: body.description,
        commandes: body.commandes,
        lotto: body.lotto,
        ordine: body.ordine,
        puht: parseFloat(body.puht),
        clientId: body.clientId,
        variants: {
          create: body.variants.map(v => ({
            name: v.name,
            qte_variante: parseInt(v.qte_variante)
          }))
        }
      },
      include: { variants: true }
    });

    return NextResponse.json(updatedModel);
  } catch (error) {
    console.error('Error updating client model:', error);
    return NextResponse.json(
      { error: 'Failed to update client model' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    
    await prisma.clientModel.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client model:', error);
    return NextResponse.json(
      { error: 'Failed to delete client model' },
      { status: 500 }
    );
  }
}