// app/api/client-model/[id]/route.ts (unchanged)
import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    const updated = await prisma.clientModel.update({
      where: { id: params.id },
      data: {
        commandes: data.commandes || null,
        lotto: data.lotto || null,
        ordine: data.ordine || null,
        puht: data.puht ? parseFloat(data.puht) : null,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating client model:', error);
    return NextResponse.json({ error: 'Failed to update client model' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.clientModel.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client model:', error);
    return NextResponse.json({ error: 'Failed to delete client model' }, { status: 500 });
  }
}