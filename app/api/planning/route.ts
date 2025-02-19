// app/api/planning/route.ts
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
        plannings: { 
          include: { 
            models: {
              include: {
                variantes: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    return NextResponse.json(user?.plannings || [])
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch plannings" }, { status: 500 })
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
    const prefix = `PLAN-${year}-${month}-`

    const lastPlanning = await prisma.planning.findFirst({
      where: { id: { startsWith: prefix } },
      orderBy: { id: 'desc' }
    })

    const sequenceNumber = lastPlanning ? 
      parseInt(lastPlanning.id.slice(-4), 10) + 1 : 1
    const planningId = `${prefix}${String(sequenceNumber).padStart(4, '0')}`

    const newPlanning = await prisma.planning.create({
      data: {
        id: planningId,
        name,
        userId: user.id,
        status: "EN_COURS"
      }
    })

    return NextResponse.json(newPlanning)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to create planning" },
      { status: 500 }
    )
  }
}