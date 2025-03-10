import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { lines: true },
      orderBy: { createdAt: "desc" },
    });

    const today = new Date();
    const updatedInvoices = await Promise.all(
      invoices.map(async (invoice) => {
        if (invoice.dueDate && new Date(invoice.dueDate) < today && invoice.status === 2) {
          return prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: 5 },
            include: { lines: true },
          });
        }
        return invoice;
      })
    );

    console.log("GET /api/invoices - Invoices fetched and updated:", updatedInvoices.length);
    return NextResponse.json(updatedInvoices, { status: 200 });
  } catch (error) {
    console.error("GET /api/invoices Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const prefix = `F-${year}-${month}-`;

    const lastInvoice = await prisma.invoice.findFirst({
      where: { id: { startsWith: prefix } },
      orderBy: { id: "desc" },
    });

    const sequenceNumber = lastInvoice ? parseInt(lastInvoice.id.slice(-4), 10) + 1 : 1;
    const invoiceId = `${prefix}${String(sequenceNumber).padStart(4, "0")}`;

    const newInvoice = await prisma.invoice.create({
      data: {
        id: invoiceId,
        name,
        // userId omitted since it’s optional
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
        origineTessuto: "",
        gmailclient: "",
        phoneclient: "",
        gmailemetteur: "",
        phoneemetteur: "",
      },
    });

    console.log("POST /api/invoices - New invoice created:", newInvoice);
    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error("POST /api/invoices Error:", error);
    return NextResponse.json(
      { error: "Failed to create invoice", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}