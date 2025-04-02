import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

type VariantInput = {
  name?: string | null;
  qte_variante?: string | number | null;
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    const updated = await prisma.clientModel.update({
      where: { id },
      data: {
        name: data.name || null,
        description: data.description || null,
        commandes: data.commandes || null,
        lotto: data.lotto || null,
        ordine: data.ordine || null,
        puht: data.puht ? parseFloat(data.puht) : null,
        variants: {
          deleteMany: {},
          create: (data.variants || []).map((v: VariantInput) => ({
            name: v.name || null,
            qte_variante: v.qte_variante ? parseInt(v.qte_variante as string) : null,
          })),
        },
      },
      include: { variants: true, client: true },
    });
    
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Error updating client model:', error);
    return NextResponse.json({ error: 'Failed to update client model' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.clientModel.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting client model:', error);
    return NextResponse.json({ error: 'Failed to delete client model' }, { status: 500 });
  }
}