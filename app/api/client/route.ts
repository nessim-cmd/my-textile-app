// app/api/client/route.ts
import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(clients);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newClient = await prisma.client.create({
      data: {
        name: body.name,
        email: body.email,
        phone1: body.phone1,
        phone2: body.phone2,
        fix: body.fix,
        address: body.address,
        matriculeFiscale: body.matriculeFiscale,
        soumission: body.soumission,
        dateDebutSoumission: body.dateDebutSoumission,
        dateFinSoumission: body.dateFinSoumission,
      },
    });
    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updatedClient = await prisma.client.update({
      where: { id: body.id },
      data: {
        name: body.name,
        email: body.email,
        phone1: body.phone1,
        phone2: body.phone2,
        fix: body.fix,
        address: body.address,
        matriculeFiscale: body.matriculeFiscale,
        soumission: body.soumission,
        dateDebutSoumission: body.dateDebutSoumission,
        dateFinSoumission: body.dateFinSoumission,
      },
    });
    return NextResponse.json(updatedClient);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.clientModel.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}