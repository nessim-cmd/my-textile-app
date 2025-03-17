/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const id = request.nextUrl.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  try {
    const fiche = await prisma.ficheProduction.findUnique({
      where: { id },
      include: { production: true },
    });
    if (!fiche) {
      return NextResponse.json({ error: 'Fiche not found' }, { status: 404 });
    }
    console.log('Fetched fiche:', fiche); // Log to verify data
    return NextResponse.json(fiche);
  } catch (error) {
    console.error('Error fetching fiche:', error);
    return NextResponse.json({ error: 'Failed to fetch fiche' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const id = request.nextUrl.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  const body = await request.json();
  const { clientId, modelId, commande, quantity, production } = body;

  try {
    const fiche = await prisma.ficheProduction.update({
      where: { id },
      data: {
        clientId,
        modelId,
        commande,
        quantity,
        production: {
          deleteMany: {}, // Delete existing production entries
          create: production.map((entry: any) => ({
            week: entry.week,
            day: entry.day,
            hour: entry.hour,
            quantityCreated: entry.quantityCreated,
          })),
        },
      },
      include: { production: true },
    });
    console.log('Updated fiche:', fiche); // Log to verify update
    return NextResponse.json(fiche);
  } catch (error) {
    console.error('Error updating fiche:', error);
    return NextResponse.json({ error: 'Failed to update fiche' }, { status: 500 });
  }
}