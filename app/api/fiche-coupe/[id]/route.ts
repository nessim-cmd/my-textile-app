import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

interface CoupeEntryInput {
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
  coupe?: CoupeEntryInput[];
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.pathname.split('/').pop();
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  try {
    const fiche = await prisma.ficheCoupe.findUnique({
      where: { id },
      include: {
        coupe: true,
        client: true,
        model: true,
      },
    });
    if (!fiche) return NextResponse.json({ error: 'Fiche not found' }, { status: 404 });

    console.log(`[GET /api/fiche-coupe/${id}] Response:`, JSON.stringify(fiche, null, 2));
    return NextResponse.json(fiche, { status: 200 });
  } catch (error) {
    console.error(`[GET /api/fiche-coupe/${id}] Error:`, error);
    return NextResponse.json({ error: 'Failed to fetch fiche' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const id = request.nextUrl.pathname.split('/').pop();
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  try {
    const body: FicheCoupeRequest = await request.json();
    const { clientId, modelId, commande, quantity, coupe } = body;

    const existingFiche = await prisma.ficheCoupe.findUnique({
      where: { id },
      include: { coupe: true },
    });
    if (!existingFiche) return NextResponse.json({ error: 'Fiche not found' }, { status: 404 });

    const updatedFiche = await prisma.ficheCoupe.update({
      where: { id },
      data: {
        clientId: clientId || existingFiche.clientId,
        modelId: modelId || existingFiche.modelId,
        commande: commande || existingFiche.commande,
        quantity: quantity !== undefined ? quantity : existingFiche.quantity,
        coupe: {
          deleteMany: {}, // Clear existing entries
          create: Array.isArray(coupe)
            ? coupe.map((entry) => ({
                week: entry.week,
                day: entry.day,
                category: entry.category,
                quantityCreated: entry.quantityCreated,
              }))
            : [],
        },
      },
      include: {
        coupe: true,
        client: true,
        model: true,
      },
    });

    console.log(`[PUT /api/fiche-coupe/${id}] Updated:`, JSON.stringify(updatedFiche, null, 2));
    return NextResponse.json(updatedFiche, { status: 200 });
  } catch (error) {
    console.error(`[PUT /api/fiche-coupe/${id}] Error:`, error);
    return NextResponse.json({ error: 'Failed to update fiche' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) { // Updated to static params
  const id = request.nextUrl.pathname.split('/').pop();
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  try {
    await prisma.ficheCoupe.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(`[DELETE /api/fiche-coupe/${id}] Error:`, error);
    return NextResponse.json({ error: 'Failed to delete fiche' }, { status: 500 });
  }
}