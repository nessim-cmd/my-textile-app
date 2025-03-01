import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  console.log("GET /api/exporte - Request received");
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    
    console.log("GET /api/exporte - Email:", email);
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        exporte: { 
          include: { lines: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const transformedDeclarations = user.exporte.map(declaration => ({
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

    const { email, num_dec, exportDate, clientName } = body;
    
    if (!email || !num_dec || !exportDate || !clientName) {
      console.log("POST /api/exporte - Missing required fields:", { email, num_dec, exportDate, clientName });
      return NextResponse.json(
        { error: "Email, num_dec, exportDate, and clientName are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log("POST /api/exporte - User not found for email:", email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newDeclaration = await prisma.declarationExport.create({
      data: {
        num_dec,
        exportDate,
        clientName,
        valeur: 0, // Default to 0, will be updated based on TotalTTC
        userId: user.id,
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
      },
      include: { lines: true },
    });

    if (!newDeclaration) {
      console.log("POST /api/exporte - Failed to create declaration");
      return NextResponse.json({ error: "Failed to create declaration" }, { status: 500 });
    }

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