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
        phone: body.phone,
        address: body.address,
      },
    });
    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.log(error)
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
        phone: body.phone,
        address: body.address,
      },
    });
    return NextResponse.json(updatedClient);
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.client.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}