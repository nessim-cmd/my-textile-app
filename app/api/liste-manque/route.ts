import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    console.log("Fetching all declarations with missing quantities");
    const declarations = await prisma.declarationImport.findMany({
      where: {
        models: {
          some: {
            accessories: {
              some: {
                quantity_manque: { lt: 0 },
              },
            },
          },
        },
      },
      include: {
        models: {
          include: {
            accessories: {
              where: { quantity_manque: { lt: 0 } },
            },
          },
        },
      },
    });

    console.log("Declarations fetched:", declarations.length);

    console.log("Fetching all livraisons with missing quantities");
    const livraisons = await prisma.livraisonEntree.findMany({
      include: {
        models: true, // Changed from 'lines' to 'models'
        client: true,
      },
    });

    // Filter livraisons where any model has quantityTrouvee < quantityReçu
    const filteredLivraisons = livraisons
      .map(liv => ({
        ...liv,
        models: liv.models.filter(model => (model.quantityTrouvee || 0) < (model.quantityReçu || 0)),
      }))
      .filter(liv => liv.models.length > 0);

    console.log("Livraisons fetched and filtered:", filteredLivraisons.length);
    filteredLivraisons.forEach(liv => {
      if (!liv.client && !liv.clientName) {
        console.warn(`Livraison ${liv.id} has no client or clientName`);
      }
    });

    const transformedDeclarations = declarations.map(declaration => {
      console.log("Transforming declaration:", declaration.id);
      return {
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
            quantity_manque: acc.quantity_trouve - acc.quantity_reçu,
          })),
        })),
      };
    });

    const transformedLivraisons = filteredLivraisons.map(livraison => ({
      ...livraison,
      createdAt: livraison.createdAt.toISOString(),
      updatedAt: livraison.updatedAt.toISOString(),
      livraisonDate: livraison.livraisonDate ? livraison.livraisonDate.toString() : null,
      models: livraison.models.map(model => ({
        ...model,
        createdAt: model.createdAt.toISOString(),
        updatedAt: model.updatedAt.toISOString(),
      })),
    }));

    console.log("Data transformed successfully");

    return NextResponse.json({
      declarations: transformedDeclarations,
      livraisons: transformedLivraisons,
    }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("GET /api/liste-manque Error:", errorMessage, {
      stack: error instanceof Error ? error.stack : undefined,
      details: error,
    });
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}