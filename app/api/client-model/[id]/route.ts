import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Define the type for a variant
type VariantInput = {
  name?: string | null;
  qte_variante?: string | number | null; // Accept string since it’s parsed to number
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    // Delete existing variants and update the model with new data
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
          deleteMany: {}, // Remove all existing variants
          create: (data.variants || []).map((v: VariantInput) => ({
            name: v.name || null,
            qte_variante: v.qte_variante ? parseInt(v.qte_variante as string) : null,
          })),
        },
      },
      include: { variants: true, client: true }, // Return updated data with variants
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