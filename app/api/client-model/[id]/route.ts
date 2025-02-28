import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

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
          create: (data.variants || []).map((v: any) => ({
            name: v.name || null,
            qte_variante: v.qte_variante ? parseInt(v.qte_variante) : null,
          })),
        },
      },
      include: { variants: true, client: true }, // Return updated data with variants
    });
    
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Error updating client model:', error);
    
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
    
  }
}