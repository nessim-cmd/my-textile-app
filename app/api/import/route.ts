import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  console.log("GET /api/import - Request received");
  try {
    const declarations = await prisma.declarationImport.findMany({
      include: {
        models: {
          include: { accessories: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const transformedDeclarations = declarations.map(declaration => ({
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

    console.log("GET /api/import - Declarations fetched:", transformedDeclarations.length);
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
    const { num_dec, date_import, client, valeur } = await request.json();

    console.log("POST /api/import - Num Dec:", num_dec);
    if (!num_dec || !date_import || !client || valeur === undefined) {
      return NextResponse.json(
        { error: "num_dec, date_import, client, and valeur are required" },
        { status: 400 }
      );
    }

    const newDeclaration = await prisma.declarationImport.create({
      data: {
        num_dec,
        date_import: new Date(date_import),
        client,
        valeur,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: { models: { include: { accessories: true } } },
    });

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