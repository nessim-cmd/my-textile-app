/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const fiches = await prisma.ficheCoupe.findMany({
      include: { coupe: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(fiches);
  } catch (error) {
    console.error('Error fetching fiches-coupe:', error);
    return NextResponse.json({ error: 'Failed to fetch fiches-coupe' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { clientId, modelId, commande, quantity, coupe } = await request.json();
  if (!clientId || !modelId || !commande) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const existingFiche = await prisma.ficheCoupe.findFirst({
      where: { modelId, commande },
      include: { coupe: true },
    });

    if (existingFiche) {
      return NextResponse.json(existingFiche, { status: 200 });
    }

    const fiche = await prisma.ficheCoupe.create({
      data: {
        clientId,
        modelId,
        commande,
        quantity,
        coupe: {
          create: coupe.map((entry: any) => ({
            week: entry.week,
            day: entry.day,
            category: entry.category,
            quantityCreated: entry.quantityCreated,
          })),
        },
      },
      include: { coupe: true },
    });
    return NextResponse.json(fiche, { status: 201 });
  } catch (error) {
    console.error('Error creating fiche-coupe:', error);
    return NextResponse.json({ error: 'Failed to create fiche-coupe' }, { status: 500 });
  }
}