import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  console.log("POST /api/accessories - Request received");
  try {
    const {
      client,
      model,
      reference_accessoire,
      description,
      quantity_reçu,
      quantity_trouve,
      quantity_manque,
      quantity_sortie,
    } = await request.json();

    if (
      !client ||
      !model ||
      !reference_accessoire ||
      !description ||
      quantity_reçu === undefined ||
      quantity_trouve === undefined
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Resolve or create client
    let clientRecord = await prisma.client.findFirst({ where: { name: client } });
    if (!clientRecord) {
      clientRecord = await prisma.client.create({
        data: {
          name: client,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    // Resolve or create client model
    let clientModel = await prisma.clientModel.findFirst({
      where: { clientId: clientRecord.id, name: model.toLowerCase() },
    });
    if (!clientModel) {
      clientModel = await prisma.clientModel.create({
        data: {
          name: model.toLowerCase(),
          clientId: clientRecord.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    // Create a standalone accessory
    const newAccessory = await prisma.accessoire.create({
      data: {
        reference_accessoire,
        description,
        quantity_reçu,
        quantity_trouve,
        quantity_manque,
        quantity_sortie,
        model: {
          create: {
            name: model,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      },
    });

    const response = {
      id: newAccessory.id,
      client,
      model,
      reference_accessoire,
      description,
      quantity_reçu,
      quantity_trouve,
      quantity_manque,
      quantity_sortie,
    };

    console.log("POST /api/accessories - New accessory created:", response);
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("POST /api/accessories Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}