import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  console.log("GET /api/all-accessories - Request received");
  try {
    // Fetch accessories from DeclarationImport
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
          quantity_reçu: acc.quantity_reçu || 0,
          quantity_trouve: acc.quantity_trouve || 0,
          quantity_sortie: acc.quantity_sortie || 0,
          quantity_manque: acc.quantity_manque || 0,
        })),
      })),
    }));

    // Fetch standalone accessories (not linked to DeclarationImport)
    const standaloneAccessories = await prisma.accessoire.findMany({
      where: {
        model: {
          declarationImportId: null,
          livraisonEntreeId: null, // Ensure no association with other entities
        },
      },
      include: {
        model: true,
      },
    });

    const transformedStandaloneAccessories = standaloneAccessories.map(acc => ({
      ...acc,
      client: acc.model?.name || "Manual Entry", // Use model name or default
      quantity_reçu: acc.quantity_reçu || 0,
      quantity_trouve: acc.quantity_trouve || 0,
      quantity_sortie: acc.quantity_sortie || 0,
      quantity_manque: acc.quantity_manque || 0,
    }));

    console.log("GET /api/all-accessories - Declarations fetched:", transformedDeclarations.length);
    console.log("GET /api/all-accessories - Standalone accessories fetched:", transformedStandaloneAccessories.length);

    return NextResponse.json(
      {
        declarationAccessories: transformedDeclarations,
        standaloneAccessories: transformedStandaloneAccessories,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/all-accessories Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}