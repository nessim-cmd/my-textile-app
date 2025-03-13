/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

interface Variant {
  id?: string;
  name?: string | null;
  qte_variante?: number | null;
}

interface Commande {
  value: string;
  variants: Variant[];
}

interface ClientModel {
  id: string;
  name?: string | null;
  description?: string | null;
  commandes?: string | null;
  commandesWithVariants?: Prisma.InputJsonValue; // Use Prisma.InputJsonValue
  lotto?: string | null;
  ordine?: string | null;
  puht?: number | null;
  clientId: string;
  variants?: Variant[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
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

    const where: any = {};

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
      include: { client: true, variants: true },
      orderBy: { createdAt: 'desc' },
    });

    console.log("ClientModels:", models);
    return NextResponse.json(models);
  } catch (error) {
    console.error('Error fetching client models:', error);
    return NextResponse.json({ error: 'Failed to fetch client models' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Sync handler for offline data
    if (body.isSync) {
      const models: ClientModel[] = Array.isArray(body.models) ? body.models : [body];
      const results = await Promise.all(
        models.map(async (model: ClientModel) => {
          return prisma.clientModel.upsert({
            where: { id: model.id },
            update: {
              name: model.name,
              description: model.description,
              commandes: model.commandes,
              commandesWithVariants: model.commandesWithVariants ?? Prisma.JsonNull, // Ensure JSON compatibility
              lotto: model.lotto,
              ordine: model.ordine,
              puht: model.puht,
              clientId: model.clientId,
              variants: {
                deleteMany: {},
                create: (model.variants || []).map((v: Variant) => ({
                  name: v.name || null,
                  qte_variante: v.qte_variante || null,
                })),
              },
            },
            create: {
              id: model.id,
              name: model.name,
              description: model.description,
              commandes: model.commandes,
              commandesWithVariants: model.commandesWithVariants ?? Prisma.JsonNull, // Ensure JSON compatibility
              lotto: model.lotto,
              ordine: model.ordine,
              puht: model.puht,
              clientId: model.clientId,
              variants: {
                create: (model.variants || []).map((v: Variant) => ({
                  name: v.name || null,
                  qte_variante: v.qte_variante || null,
                })),
              },
              createdAt: new Date(model.createdAt || Date.now()),
              updatedAt: new Date(model.updatedAt || Date.now()),
            },
            include: { variants: true, client: true },
          });
        })
      );
      return NextResponse.json(results, { status: 201 });
    }

    // Normal online POST
    const { email, commandesWithVariants, variants, ...modelData } = body;

    console.log('POST /api/client-model request body:', body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const combinedCommandes = Array.isArray(commandesWithVariants)
      ? commandesWithVariants.map((c: Commande) => c.value).filter((v: string) => v.trim() !== '').join(',')
      : '';

    const combinedVariants = Array.isArray(commandesWithVariants)
      ? commandesWithVariants.flatMap((c: Commande) => c.variants.filter((v: Variant) => v.name && v.name.trim() !== ''))
      : (Array.isArray(variants) ? variants : []);

    const newModel = await prisma.clientModel.create({
      data: {
        name: modelData.name || null,
        description: modelData.description || null,
        commandes: combinedCommandes || null,
        commandesWithVariants: Array.isArray(commandesWithVariants) ? commandesWithVariants : Prisma.JsonNull,
        lotto: modelData.lotto || null,
        ordine: modelData.ordine || null,
        puht: modelData.puht ? parseFloat(modelData.puht) : null,
        clientId: modelData.clientId,
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
    const { id, commandesWithVariants, variants, ...modelData } = body;

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
      ? commandesWithVariants.flatMap((c: Commande) => c.variants.filter((v: Variant) => v.name && v.name.trim() !== ''))
      : (Array.isArray(variants) ? variants : []);

    const updatedModel = await prisma.clientModel.update({
      where: { id },
      data: {
        name: modelData.name !== undefined ? modelData.name : existingModel.name,
        description: modelData.description !== undefined ? modelData.description : null,
        commandes: combinedCommandes || null,
        commandesWithVariants: Array.isArray(commandesWithVariants) ? commandesWithVariants : Prisma.JsonNull,
        lotto: modelData.lotto !== undefined ? modelData.lotto : null,
        ordine: modelData.ordine !== undefined ? modelData.ordine : null,
        puht: modelData.puht !== undefined ? parseFloat(modelData.puht) : null,
        clientId: existingModel.clientId,
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

    console.log(`Updated ClientModel: ${id}, clientId: ${updatedModel.clientId}, name: ${updatedModel.name}`);
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