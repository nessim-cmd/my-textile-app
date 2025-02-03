import prisma from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const email = searchParams.get('email')
        
        if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })
    
        const user = await prisma.user.findUnique({
          where: { email },
          include: { 
            commandes: { 
              include: { lines: true },
              orderBy: { createdAt: 'desc' }
            }
          }
        })
    
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
    
        return NextResponse.json(user.commandes)
        
    } catch (error) {
        console.log("error to get the commandes", error)
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
      const prefix = `C-${year}-${month}-`
  
      const lastCommande = await prisma.commande.findFirst({
        where: { id: { startsWith: prefix } },
        orderBy: { id: 'desc' }
      })
  
      const sequenceNumber = lastCommande ? 
        parseInt(lastCommande.id.slice(-4), 10) + 1 : 1
      const commandeId = `${prefix}${String(sequenceNumber).padStart(4, '0')}`
  
      const newCommande = await prisma.commande.create({
        data: {
          id: commandeId,
          name,
          userId: user.id,
          issuerName: "",
          issuerAddress: "",
          clientName: "",
          clientAddress: "",
          commandeDate: "",
        }
      })
  
      return NextResponse.json(newCommande)
    } catch (error) {
      console.error(error)
      return NextResponse.json(
        { error: "Failed to create commande" },
        { status: 500 }
      )
    }
  }