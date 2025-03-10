import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() { // Removed unused 'request' parameter
  console.log("GET /api/exporte - Request received");
  try {
    const declarations = await prisma.declarationExport.findMany({
      include: { 
        lines: true 
      },
      orderBy: { createdAt: "desc" },
    });

    const transformedDeclarations = declarations.map(declaration => ({
      ...declaration,
      createdAt: declaration.createdAt.toISOString(),
      updatedAt: declaration.updatedAt.toISOString(),
      exportDate: declaration.exportDate ? new Date(declaration.exportDate).toISOString() : "",
      lines: declaration.lines.map(line => ({
        ...line,
      })),
    }));

    console.log("GET /api/exporte - Declarations fetched:", transformedDeclarations);
    return NextResponse.json(transformedDeclarations, { status: 200 });
  } catch (error) {
    console.error("GET /api/exporte Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log("POST /api/exporte - Request received");
  try {
    const body = await request.json();
    console.log("POST /api/exporte - Request body:", body);

    const { num_dec, exportDate, clientName } = body;
    
    if (!num_dec || !exportDate || !clientName) {
      console.log("POST /api/exporte - Missing required fields:", { num_dec, exportDate, clientName });
      return NextResponse.json(
        { error: "num_dec, exportDate, and clientName are required" },
        { status: 400 }
      );
    }

    const newDeclaration = await prisma.declarationExport.create({
      data: {
        num_dec,
        exportDate,
        clientName,
        valeur: 0, // Default to 0, will be updated based on TotalTTC
        vatActive: false,
        vatRate: 20,
        status: 1,
        poidsBrut: "",
        poidsNet: "",
        nbrColis: "",
        volume: "",
        modePaiment: 1,
        origineTessuto: "",
        dueDate: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        // userId is omitted since it's optional now
      },
      include: { lines: true },
    });

    const transformedDeclaration = {
      ...newDeclaration,
      createdAt: newDeclaration.createdAt.toISOString(),
      updatedAt: newDeclaration.updatedAt.toISOString(),
      exportDate: newDeclaration.exportDate ? new Date(newDeclaration.exportDate).toISOString() : "",
      lines: newDeclaration.lines.map(line => ({
        ...line,
      })),
    };

    console.log("POST /api/exporte - New declaration created:", transformedDeclaration);
    return NextResponse.json(transformedDeclaration, { status: 201 });
  } catch (error) {
    console.error("POST /api/exporte Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}