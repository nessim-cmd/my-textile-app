import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

type CoupeInput = {
  clientId: string;
  modele: string;
  refArticle: string;
  refTissu?: string | null;
  colorisTissu?: string | null;
  sizes: Record<string, number>;
  rolls: {
    nRlx?: string | null;
    metrRoul?: number | null;
    nMatelas?: string | null;
    nbPils?: number | null;
    longMatelas?: number | null;
    mtsMatelas?: number | null;
    restes?: number | null;
    defauts?: number | null;
    manqueRoul?: number | null;
    pieces: Record<string, number>;
  }[];
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    if (!data) {
      return NextResponse.json({ error: "Request body is empty" }, { status: 400 });
    }

    const { clientId, modele, refArticle, refTissu, colorisTissu, sizes, rolls } = data as CoupeInput;

    if (!clientId || !modele || !refArticle) {
      return NextResponse.json(
        { error: "Missing required fields: clientId, modele, and refArticle are required" },
        { status: 400 }
      );
    }

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const updatedCoupe = await prisma.coupe.update({
      where: { id },
      data: {
        clientId,
        modele,
        refArticle,
        refTissu: refTissu || null,
        colorisTissu: colorisTissu || null,
        sizes: {
          deleteMany: {},
          create: Object.entries(sizes || {}).map(([label, quantity]) => ({
            label,
            quantity: Number(quantity) || 0,
          })),
        },
        rolls: {
          deleteMany: {},
          create: (rolls || []).map((roll) => ({
            nRlx: roll.nRlx || null,
            metrRoul: roll.metrRoul || 0,
            nMatelas: roll.nMatelas || null,
            nbPils: roll.nbPils || 0,
            longMatelas: roll.longMatelas || 0,
            mtsMatelas: roll.mtsMatelas || 0,
            restes: roll.restes || 0,
            defauts: roll.defauts || 0,
            manqueRoul: roll.manqueRoul || 0,
            pieces: {
              create: Object.entries(roll.pieces || {}).map(([sizeLabel, quantity]) => ({
                sizeLabel,
                quantity: Number(quantity) || 0,
              })),
            },
          })),
        },
      },
      include: { client: true, sizes: true, rolls: { include: { pieces: true } } },
    });

    return NextResponse.json(updatedCoupe, { status: 200 });
  } catch (error) {
    console.error("Error updating coupe:", error);
    return NextResponse.json(
      { error: "Failed to update coupe", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.coupe.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting coupe:", error);
    return NextResponse.json({ error: "Failed to delete coupe" }, { status: 500 });
  }
}