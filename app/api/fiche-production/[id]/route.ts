/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Define the expected shape of the request body
interface ProductionEntry {
  week: string;
  day: string;
  hour: string;
  quantityCreated: number;
}

interface FicheProductionRequest {
  clientId: string;
  modelId: string;
  commande: string;
  quantity: number;
  production: ProductionEntry[];
}

export async function PUT(request: NextRequest) {
  // Extract the id from the URL pathname
  const id = request.nextUrl.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  const body: FicheProductionRequest = await request.json();
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
          create: production.map((entry) => ({
            week: entry.week,
            day: entry.day,
            hour: entry.hour,
            quantityCreated: entry.quantityCreated,
          })),
        },
      },
      include: { production: true },
    });
    return NextResponse.json(fiche);
  } catch (error) {
    console.error('Error updating fiche:', error);
    return NextResponse.json({ error: 'Failed to update fiche' }, { status: 500 });
  }
}