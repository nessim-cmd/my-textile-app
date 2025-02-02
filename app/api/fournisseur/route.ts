import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    const fournisseur = await prisma.fournisseur.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    })
    return NextResponse.json(fournisseur);
}

export async function POST(request : Request) {
    try {
        const body = await request.json();
        const newFournisseur = await prisma.fournisseur.create({
            data:{
                name: body.name,
                email: body.email,
                phone: body.phone,
                address: body.address
            }
        })
        return NextResponse.json(newFournisseur)
    } catch (error) {
        console.log("failed to add fournisseur.", error)
    }
}


export async function PUT(request: Request) {
    try {
      const body = await request.json();
      const updatedFournisseur = await prisma.fournisseur.update({
        where: { id: body.id },
        data: {
          name: body.name,
          email: body.email,
          phone: body.phone,
          address: body.address,
        },
      });
      return NextResponse.json(updatedFournisseur);
    } catch (error) {
      console.log(error)
      return NextResponse.json(
        { error: 'Failed to update fournisseur' },
        { status: 500 }
      );
    }
  }



  export async function DELETE(request: Request) {
    try {
      const { id } = await request.json();
      await prisma.fournisseur.delete({
        where: { id },
      });
      return NextResponse.json({ success: true });
    } catch (error) {
      console.log(error)
      return NextResponse.json(
        { error: 'Failed to delete fournisseur' },
        { status: 500 }
      );
    }
  }