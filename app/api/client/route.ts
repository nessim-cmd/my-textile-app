import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(clients, { status: 200 });
  } catch (error) {
    console.error("GET /api/client Error:", error);
    
  }
}

export async function POST(request: NextRequest) {
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
    console.error("POST /api/client Error:", error);
    
  }
}

export async function PUT(request: NextRequest) {
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
    return NextResponse.json(updatedClient, { status: 200 });
  } catch (error) {
    console.error("PUT /api/client Error:", error);
    
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    await prisma.client.delete({ where: { id } }); // Fixed to delete from 'client' table, not 'clientModel'
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/client Error:", error);
   
  }
}