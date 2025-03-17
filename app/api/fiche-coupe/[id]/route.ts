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
  clientId: string;
  modelId: string;
  commande: string;
  quantity: number;
  coupe: CoupeEntry[];
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

  const body: FicheCoupeRequest = await request.json();
  const { clientId, modelId, commande, quantity, coupe } = body;

  try {
    const fiche = await prisma.ficheCoupe.update({
      where: { id },
      data: {
        clientId,
        modelId,
        commande,
        quantity,
        coupe: {
          deleteMany: {},
          create: coupe.map((entry) => ({
            week: entry.week,
            day: entry.day,
            category: entry.category,
            quantityCreated: entry.quantityCreated,
          })),
        },
      },
      include: { coupe: true },
    });
    return NextResponse.json(fiche);
  } catch (error) {
    console.error('Error updating fiche-coupe:', error);
    return NextResponse.json({ error: 'Failed to update fiche-coupe' }, { status: 500 });
  }
}