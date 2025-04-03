import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

interface Variant {
  id?: string;
  name: string;
  qte_variante: number;
}

interface Commande {
  value: string;
  variants: Variant[];
}

// Define a type for the Prisma where clause
interface WhereClause {
  createdAt?: { gte: Date; lte: Date };
  OR?: Array<{
    name?: { contains: string; mode: 'insensitive' };
    client?: { name: { contains: string; mode: 'insensitive' } };
    description?: { contains: string; mode: 'insensitive' };
    commandes?: { contains: string; mode: 'insensitive' };
  }>;
  clientId?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const dateDebut = searchParams.get('dateDebut');
    const dateFin = searchParams.get('dateFin');
    const searchTerm = searchParams.get('search');
    const client = searchParams.get('client');

    console.log('GET /api/client-model params:', { email, dateDebut, dateFin, client });

    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const where: WhereClause = {}; // Use const and specific type

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
        where.clientId = clientRecord.id;
      } else {
        console.log(`Client "${client}" not found`);
        return NextResponse.json([]);
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

    console.log("ClientModels:", models);
    return NextResponse.json(models);
  } catch (error) {
    console.error('Error fetching client models:', error);
    return NextResponse.json({ error: 'Failed to fetch client models' }, { status: 500 });
  }
}

// POST, PUT, DELETE remain unchanged for now
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, commandesWithVariants, variants, files, ...modelData } = body;

    console.log('POST /api/client-model request body:', body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const combinedCommandes = Array.isArray(commandesWithVariants)
      ? commandesWithVariants.map((c: Commande) => c.value).filter((v: string) => v.trim() !== '').join(',')
      : '';

    const combinedVariants = Array.isArray(commandesWithVariants)
      ? commandesWithVariants.flatMap((c: Commande) => c.variants.filter((v: Variant) => v.name.trim() !== ''))
      : (Array.isArray(variants) ? variants : []);

    const newModel = await prisma.clientModel.create({
      data: {
        name: modelData.name || null,
        description: modelData.description || null,
        commandes: combinedCommandes || null,
        commandesWithVariants: Array.isArray(commandesWithVariants) ? commandesWithVariants : [],
        lotto: modelData.lotto || null,
        ordine: modelData.ordine || null,
        puht: modelData.puht ? parseFloat(modelData.puht) : null,
        clientId: modelData.clientId,
        files: files || null,
        variants: {
          create: combinedVariants.map((v: Variant) => ({
            name: v.name || null,
            qte_variante: v.qte_variante ? parseInt(v.qte_variante.toString()) : null,
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
    const { id, commandesWithVariants, variants, files, ...modelData } = body;

    console.log('PUT /api/client-model request body:', body);

    const existingModel = await prisma.clientModel.findUnique({
      where: { id },
      select: { clientId: true, name: true },
    });
    if (!existingModel) return NextResponse.json({ error: 'ClientModel not found' }, { status: 404 });

    const combinedCommandes = Array.isArray(commandesWithVariants)
      ? commandesWithVariants.map((c: Commande) => c.value).filter((v: string) => v.trim() !== '').join(',')
      : '';

    const combinedVariants = Array.isArray(commandesWithVariants)
      ? commandesWithVariants.flatMap((c: Commande) => c.variants.filter((v: Variant) => v.name.trim() !== ''))
      : (Array.isArray(variants) ? variants : []);

    const updatedModel = await prisma.clientModel.update({
      where: { id },
      data: {
        name: modelData.name !== undefined ? modelData.name : existingModel.name,
        description: modelData.description !== undefined ? modelData.description : null,
        commandes: combinedCommandes || null,
        commandesWithVariants: Array.isArray(commandesWithVariants) ? commandesWithVariants : [],
        lotto: modelData.lotto !== undefined ? modelData.lotto : null,
        ordine: modelData.ordine !== undefined ? modelData.ordine : null,
        puht: modelData.puht !== undefined ? parseFloat(modelData.puht) : null,
        clientId: existingModel.clientId,
        files: files !== undefined ? files : null,
        ...(combinedVariants.length > 0 && {
          variants: {
            deleteMany: {},
            create: combinedVariants.map((v: Variant) => ({
              name: v.name || null,
              qte_variante: v.qte_variante ? parseInt(v.qte_variante.toString()) : null,
            })),
          },
        }),
      },
      include: { variants: true, client: true },
    });

    console.log(`Updated ClientModel: ${id}, clientId: ${updatedModel.clientId}, name: ${updatedModel.name}, description: ${modelData.description}, commandes: ${combinedCommandes}, variants: ${JSON.stringify(combinedVariants)}`);
    return NextResponse.json(updatedModel);
  } catch (error) {
    console.error('Error updating client model:', error);
    return NextResponse.json({ error: 'Failed to update client model' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    await prisma.clientModel.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client model:', error);
    return NextResponse.json({ error: 'Failed to delete client model' }, { status: 500 });
  }
}