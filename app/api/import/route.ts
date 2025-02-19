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
        declarations: { 
          include: { 
            models: {
              include: {
                accessories: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    return NextResponse.json(user.declarations)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch declarations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, num_dec, date_import, client, valeur } = await request.json()
    
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const newDeclaration = await prisma.declarationImport.create({
      data: {
        num_dec,
        date_import: new Date(date_import),
        client,
        valeur: parseFloat(valeur),
        userId: user.id,
        models: {
          create: []
        }
      },
      include: {
        models: true
      }
    })

    return NextResponse.json(newDeclaration)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to create declaration" },
      { status: 500 }
    )
  }
}