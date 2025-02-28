import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        livraisonsEntry: {
          include: {
            lines: true,
            client: true,
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    
    console.log("GET /api/livraisonEntree - LivraisonsEntree fetched:", user.livraisonsEntry);
    return NextResponse.json(user.livraisonsEntry);
  } catch (error) {
    console.error("GET /api/livraisonEntree Error:", error);
  
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/livraisonEntree - Request received"); // Debug log
    const { email, name } = await request.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `L.E${year}-${month}-`;

    const lastLivraisonEntree = await prisma.livraisonEntree.findFirst({
      where: { id: { startsWith: prefix } },
      orderBy: { id: 'desc' }
    });

    const sequenceNumber = lastLivraisonEntree ? parseInt(lastLivraisonEntree.id.slice(-4), 10) + 1 : 1;
    const livraisonEntreeId = `${prefix}${String(sequenceNumber).padStart(4, '0')}`;

    const newLivraisonEntree = await prisma.livraisonEntree.create({
      data: {
        id: livraisonEntreeId,
        name,
        userId: user.id,
        clientName: "",
        livraisonDate: ""
      }
    });

    console.log("POST /api/livraisonEntree - New livraisonEntree created:", newLivraisonEntree);
    return NextResponse.json(newLivraisonEntree);
  } catch (error) {
    console.error("POST /api/livraisonEntree Error:", error);
    
  }
}