import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { quantity_sortie } = await request.json();

    const updatedAccessory = await prisma.accessoire.update({
      where: { id },
      data: { quantity_sortie },
    });

    return NextResponse.json(updatedAccessory, { status: 200 });
  } catch (error) {
    console.error("PUT /api/accessories/[id] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}