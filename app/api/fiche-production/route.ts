/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const fiches = await prisma.ficheProduction.findMany({
      include: { production: true },
      orderBy: { createdAt: 'desc' },
    });
    console.log('API returning fiches:', fiches);
    return NextResponse.json(fiches);
  } catch (error) {
    console.error('Error fetching fiches:', error);
    return NextResponse.json({ error: 'Failed to fetch fiches' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { clientId, modelId, commande, quantity, production } = await request.json();
  if (!clientId || !modelId || !commande) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Check if a fiche already exists for this modelId and commande
    const existingFiche = await prisma.ficheProduction.findFirst({
      where: { modelId, commande },
      include: { production: true },
    });

    if (existingFiche) {
      return NextResponse.json(existingFiche, { status: 200 });
    }

    const fiche = await prisma.ficheProduction.create({
      data: {
        clientId,
        modelId,
        commande,
        quantity,
        production: {
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
    return NextResponse.json(fiche, { status: 201 });
  } catch (error) {
    console.error('Error creating fiche:', error);
    return NextResponse.json({ error: 'Failed to create fiche' }, { status: 500 });
  }
}