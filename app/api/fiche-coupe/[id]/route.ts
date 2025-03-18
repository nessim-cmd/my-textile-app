/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

interface CoupeEntry {
  week: string;
  day: string;
  category: string;
  quantityCreated: number;
}

interface FicheCoupeRequest {
  clientId?: string;
  modelId?: string;
  commande?: string;
  quantity?: number;
  coupe?: CoupeEntry[];
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  try {
    const fiche = await prisma.ficheCoupe.findUnique({
      where: { id },
      include: { coupe: true },
    });
    if (!fiche) {
      return NextResponse.json({ error: 'Fiche not found' }, { status: 404 });
    }
    return NextResponse.json(fiche);
  } catch (error) {
    console.error('Error fetching fiche-coupe:', error);
    return NextResponse.json({ error: 'Failed to fetch fiche-coupe' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const id = request.nextUrl.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  try {
    const body: FicheCoupeRequest = await request.json();
    const { clientId, modelId, commande, quantity, coupe } = body;

    // Validate input
    if (!coupe && coupe !== undefined) {
      return NextResponse.json({ error: 'Coupe data is required' }, { status: 400 });
    }

    const existingFiche = await prisma.ficheCoupe.findUnique({
      where: { id },
      include: { coupe: true },
    });

    if (!existingFiche) {
      return NextResponse.json({ error: 'Fiche not found' }, { status: 404 });
    }

    const updatedFiche = await prisma.ficheCoupe.update({
      where: { id },
      data: {
        clientId: clientId || existingFiche.clientId,
        modelId: modelId || existingFiche.modelId,
        commande: commande || existingFiche.commande,
        quantity: quantity !== undefined ? quantity : existingFiche.quantity,
        coupe: {
          deleteMany: {},
          create: Array.isArray(coupe)
            ? coupe.map((entry) => ({
                week: entry.week,
                day: entry.day,
                category: entry.category,
                quantityCreated: entry.quantityCreated || 0, // Remove parseInt, handle as number
              }))
            : [],
        },
      },
      include: { coupe: true },
    });

    console.log('Updated fiche-coupe:', updatedFiche);
    return NextResponse.json(updatedFiche, { status: 200 });
  } catch (error) {
    console.error('Error updating fiche-coupe:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update fiche-coupe';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}