import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/db";

export async function GET() { // Removed unused 'request' parameter
  try {
    const suiviProductions = await prisma.suiviProduction.findMany({
      include: { 
        lines: true 
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(suiviProductions);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch suivi" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) { // Kept 'request' since we use it for the body
  try {
    const { model_name, qte_total, client } = await request.json();

    const newSuivi = await prisma.suiviProduction.create({
      data: {
        model_name,
        qte_total,
        client,
        lines: {
          create: []
        }
      }
    });

    return NextResponse.json(newSuivi);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create suivi" },
      { status: 500 }
    );
  }
}