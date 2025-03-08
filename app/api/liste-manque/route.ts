import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      console.log("No email provided");
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    console.log("Fetching declarations for email:", email);
    const declarations = await prisma.declarationImport.findMany({
      where: {
        user: { email },
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

    console.log("Fetching livraisons for email:", email);
    const livraisons = await prisma.livraisonEntree.findMany({
      where: {
        createdById: { email },
        lines: {
          some: {
            quantityReçu: { gt: prisma.livraisonEntreeLine.fields.quantityTrouvee }, // Changed to gt
          },
        },
      },
      include: {
        lines: {
          where: {
            quantityReçu: { gt: prisma.livraisonEntreeLine.fields.quantityTrouvee }, // Changed to gt
          },
        },
        client: true,
      },
    });

    console.log("Livraisons fetched:", livraisons.length);
    livraisons.forEach(liv => {
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

    console.log("Data transformed successfully");

    return NextResponse.json({
      declarations: transformedDeclarations,
      livraisons,
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