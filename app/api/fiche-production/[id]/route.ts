/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { clientId, modelId, commande, quantity, production } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

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
    return NextResponse.json(fiche);
  } catch (error) {
    console.error('Error updating fiche:', error);
    return NextResponse.json({ error: 'Failed to update fiche' }, { status: 500 });
  }
}