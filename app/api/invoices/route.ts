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
        invoices: { 
          include: { lines: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const today = new Date()
    const updatedInvoices = await Promise.all(
      user.invoices.map(async (invoice) => {
        if (invoice.dueDate && new Date(invoice.dueDate) < today && invoice.status === 2) {
          return prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: 5 },
            include: { lines: true }
          })
        }
        return invoice
      })
    )

    return NextResponse.json(updatedInvoices)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
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
    const prefix = `F-${year}-${month}-`

    const lastInvoice = await prisma.invoice.findFirst({
      where: { id: { startsWith: prefix } },
      orderBy: { id: 'desc' }
    })

    const sequenceNumber = lastInvoice ? 
      parseInt(lastInvoice.id.slice(-4), 10) + 1 : 1
    const invoiceId = `${prefix}${String(sequenceNumber).padStart(4, '0')}`

    const newInvoice = await prisma.invoice.create({
      data: {
        id: invoiceId,
        name,
        userId: user.id,
        issuerName: "",
        issuerAddress: "",
        clientName: "",
        clientAddress: "",
        invoiceDate: "",
        dueDate: "",
        vatActive: false,
        vatRate: 20,
        poidsBrut: "",
        poidsNet: "",
        nbrColis: "",
        volume: "",
        origineTessuto: ""
      }
    })

    return NextResponse.json(newInvoice)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    )
  }
}