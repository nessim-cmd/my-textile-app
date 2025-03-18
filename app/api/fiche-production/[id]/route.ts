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

  try {
    const body = await request.json();
    const { clientId, modelId, commande, quantity, production } = body;

    // Validate input
    if (!production && production !== undefined) {
      return NextResponse.json({ error: 'Production data is required' }, { status: 400 });
    }

    const existingFiche = await prisma.ficheProduction.findUnique({
      where: { id },
      include: { production: true },
    });

    if (!existingFiche) {
      return NextResponse.json({ error: 'Fiche not found' }, { status: 404 });
    }

    const updatedFiche = await prisma.ficheProduction.update({
      where: { id },
      data: {
        clientId: clientId || existingFiche.clientId, // Keep existing value if not provided
        modelId: modelId || existingFiche.modelId,
        commande: commande || existingFiche.commande,
        quantity: quantity !== undefined ? quantity : existingFiche.quantity,
        production: {
          deleteMany: {}, // Clear existing production entries
          create: Array.isArray(production)
            ? production.map((entry: any) => ({
                week: entry.week,
                day: entry.day,
                hour: entry.hour,
                quantityCreated: parseInt(entry.quantityCreated) || 0,
              }))
            : [],
        },
      },
      include: { production: true },
    });

    console.log('Updated fiche:', updatedFiche); // Log to verify update
    return NextResponse.json(updatedFiche, { status: 200 });
  } catch (error) {
    console.error('Error updating fiche:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update fiche';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}