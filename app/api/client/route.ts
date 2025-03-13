// app/api/client/route.ts
import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Define the Client interface based on your Prisma schema
interface Client {
  id: string;
  name?: string | null;
  email?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  fix?: string | null;
  address?: string | null;
  matriculeFiscale?: string | null;
  soumission?: string | null;
  dateDebutSoumission?: string | null;
  dateFinSoumission?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(clients, { status: 200 });
  } catch (error) {
    console.error("GET /api/client Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is a sync request from offline data
    if (body.isSync) {
      const clients: Client[] = Array.isArray(body.clients) ? body.clients : [body];
      const results = await Promise.all(
        clients.map(async (client: Client) => {
          return prisma.client.upsert({
            where: { id: client.id },
            update: {
              name: client.name,
              email: client.email,
              phone1: client.phone1,
              phone2: client.phone2,
              fix: client.fix,
              address: client.address,
              matriculeFiscale: client.matriculeFiscale,
              soumission: client.soumission,
              dateDebutSoumission: client.dateDebutSoumission,
              dateFinSoumission: client.dateFinSoumission,
            },
            create: {
              id: client.id,
              name: client.name,
              email: client.email,
              phone1: client.phone1,
              phone2: client.phone2,
              fix: client.fix,
              address: client.address,
              matriculeFiscale: client.matriculeFiscale,
              soumission: client.soumission,
              dateDebutSoumission: client.dateDebutSoumission,
              dateFinSoumission: client.dateFinSoumission,
              createdAt: new Date(client.createdAt || Date.now()),
              updatedAt: new Date(client.updatedAt || Date.now()),
            },
          });
        })
      );
      return NextResponse.json(results, { status: 201 });
    }

    // Normal online POST
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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    await prisma.client.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/client Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}