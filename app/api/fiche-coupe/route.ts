import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const fiches = await prisma.ficheCoupe.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        coupe: true,
        client: true,
        model: true,
      },
    });
    return NextResponse.json(fiches, { status: 200 });
  } catch (error) {
    console.error('[GET /api/fiche-coupe] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch fiches' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, modelId, commande, quantity } = body;

    if (!clientId || !modelId || !commande || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const fiche = await prisma.ficheCoupe.create({
      data: {
        clientId,
        modelId,
        commande,
        quantity,
      },
      include: { coupe: true },
    });

    console.log('[POST /api/fiche-coupe] Created:', JSON.stringify(fiche, null, 2));
    return NextResponse.json(fiche, { status: 201 });
  } catch (error) {
    console.error('[POST /api/fiche-coupe] Error:', error);
    return NextResponse.json({ error: 'Failed to create fiche' }, { status: 500 });
  }
}