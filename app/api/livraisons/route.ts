import { NextRequest, NextResponse } from 'next/server'
import prisma from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        livraisons: { 
          include: { lines: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    return NextResponse.json(user.livraisons)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch livraisons" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()
    
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const prefix = `L-${year}-${month}-`

    const lastLivraison = await prisma.livraison.findFirst({
      where: { id: { startsWith: prefix } },
      orderBy: { id: 'desc' }
    })

    const sequenceNumber = lastLivraison ? 
      parseInt(lastLivraison.id.slice(-4), 10) + 1 : 1
    const livraisonId = `${prefix}${String(sequenceNumber).padStart(4, '0')}`

    const newLivraison = await prisma.livraison.create({
      data: {
        id: livraisonId,
        name,
        userId: user.id,
        issuerName: "",
        issuerAddress: "",
        clientName: "",
        clientAddress: "",
        livraisonDate: "",
        soumission: "",
        soumissionValable: ""
      }
    })

    return NextResponse.json(newLivraison)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to create livraison" },
      { status: 500 }
    )
  }
}