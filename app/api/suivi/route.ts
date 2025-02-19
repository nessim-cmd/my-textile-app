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
        suiviProductions: { 
          include: { lines: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    return NextResponse.json(user.suiviProductions)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch suivi" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, model_name, qte_total, client } = await request.json()
    
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const newSuivi = await prisma.suiviProduction.create({
      data: {
        model_name,
        qte_total,
        client,
        userId: user.id,
        lines: {
          create: []
        }
      }
    })

    return NextResponse.json(newSuivi)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to create suivi" },
      { status: 500 }
    )
  }
}