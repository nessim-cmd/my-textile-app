import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        declarations: { 
          include: { 
            models: {
              include: {
                accessories: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    console.log("GET /api/import - Declarations fetched:", user.declarations);
    return NextResponse.json(user.declarations, { status: 200 });
  } catch (error) {
    console.error("GET /api/import Error:", error);
    
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/import - Request received"); // Debug log
    const { email, num_dec, date_import, client, valeur } = await request.json();
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const newDeclaration = await prisma.declarationImport.create({
      data: {
        num_dec,
        date_import: new Date(date_import),
        client,
        valeur: parseFloat(valeur),
        userId: user.id,
        models: {
          create: []
        }
      },
      include: {
        models: true
      }
    });

    console.log("POST /api/import - New declaration created:", newDeclaration);
    return NextResponse.json(newDeclaration, { status: 201 });
  } catch (error) {
    console.error("POST /api/import Error:", error);
    
  }
}