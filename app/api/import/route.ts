import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  console.log("GET /api/import - Request received");
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    
    console.log("GET /api/import - Email:", email);
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        declarations: { 
          include: { 
            models: {
              include: { accessories: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Transform Date fields to strings
    const transformedDeclarations = user.declarations.map(declaration => ({
      ...declaration,
      createdAt: declaration.createdAt.toISOString(),
      updatedAt: declaration.updatedAt.toISOString(),
      date_import: declaration.date_import.toISOString(),
      models: declaration.models.map(model => ({
        ...model,
        createdAt: model.createdAt.toISOString(),
        updatedAt: model.updatedAt.toISOString(),
        accessories: model.accessories.map(acc => ({
          ...acc,
        })),
      })),
    }));

    console.log("GET /api/import - Declarations fetched:", transformedDeclarations);
    return NextResponse.json(transformedDeclarations, { status: 200 });
  } catch (error) {
    console.error("GET /api/import Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log("POST /api/import - Request received");
  try {
    const { email, num_dec, date_import, client, valeur } = await request.json();
    
    console.log("POST /api/import - Email:", email, "Num Dec:", num_dec);
    if (!email || !num_dec || !date_import || !client || valeur === undefined) {
      return NextResponse.json(
        { error: "Email, num_dec, date_import, client, and valeur are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const newDeclaration = await prisma.declarationImport.create({
      data: {
        num_dec,
        date_import: new Date(date_import),
        client,
        valeur,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: { models: { include: { accessories: true } } },
    });

    // Transform Date fields to strings
    const transformedDeclaration = {
      ...newDeclaration,
      createdAt: newDeclaration.createdAt.toISOString(),
      updatedAt: newDeclaration.updatedAt.toISOString(),
      date_import: newDeclaration.date_import.toISOString(),
      models: newDeclaration.models.map(model => ({
        ...model,
        createdAt: model.createdAt.toISOString(),
        updatedAt: model.updatedAt.toISOString(),
        accessories: model.accessories.map(acc => ({
          ...acc,
        })),
      })),
    };

    console.log("POST /api/import - New declaration created:", transformedDeclaration);
    return NextResponse.json(transformedDeclaration, { status: 201 });
  } catch (error) {
    console.error("POST /api/import Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}