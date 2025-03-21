import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientNamesParam = searchParams.get("client");
    const dateDebut = searchParams.get("dateDebut");
    const dateFin = searchParams.get("dateFin");

    const clientNames = clientNamesParam ? clientNamesParam.split(',') : [];
    const whereClient: Prisma.ClientWhereInput = clientNames.length
      ? { name: { in: clientNames } }
      : {};
    const dateFilter = dateDebut && dateFin
      ? { gte: new Date(dateDebut), lte: new Date(dateFin) }
      : undefined;

    // Clients for filtering
    const clientIds = clientNames.length
      ? (await prisma.client.findMany({
          where: whereClient,
          select: { id: true },
        })).map(c => c.id)
      : undefined;

    // Invoices
    const invoiceWhere: Prisma.InvoiceWhereInput = {
      ...(clientIds ? { clientName: { in: clientNames } } : {}), // Use clientName directly
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    };
    const invoices = await prisma.invoice.findMany({
      where: invoiceWhere,
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { lines: true },
    });
    const invoiceTotals = await prisma.invoice.aggregate({
      where: invoiceWhere,
      _sum: { vatRate: true },
      _count: { _all: true },
    });
    const invoicePaid = await prisma.invoice.aggregate({
      where: { status: 2, ...invoiceWhere },
      _sum: { vatRate: true },
    });

    // Livraisons
    const livraisonWhere: Prisma.LivraisonWhereInput = {
      ...(clientIds ? { clientName: { in: clientNames } } : {}),
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    };
    const livraisons = await prisma.livraison.findMany({
      where: livraisonWhere,
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { lines: true },
    });
    const livraisonCount = await prisma.livraison.count({ where: livraisonWhere });

    // LivraisonEntrees
    const livraisonEntreeWhere: Prisma.LivraisonEntreeWhereInput = {
      ...(clientIds ? { clientId: { in: clientIds } } : {}),
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    };
    const livraisonEntrees = await prisma.livraisonEntree.findMany({
      where: livraisonEntreeWhere,
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { models: true, client: true },
    });
    const livraisonEntreeCount = await prisma.livraisonEntree.count({ where: livraisonEntreeWhere });

    // DeclarationImports
    const importWhere: Prisma.DeclarationImportWhereInput = {
      ...(clientNames.length ? { client: { in: clientNames } } : {}),
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    };
    const imports = await prisma.declarationImport.findMany({
      where: importWhere,
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    const importTotals = await prisma.declarationImport.aggregate({
      where: importWhere,
      _sum: { valeur: true },
      _count: { _all: true },
    });

    // DeclarationExports
    const exportWhere: Prisma.DeclarationExportWhereInput = {
      ...(clientNames.length ? { clientName: { in: clientNames } } : {}),
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    };
    const exports = await prisma.declarationExport.findMany({
      where: exportWhere,
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { lines: true },
    });
    const exportTotals = await prisma.declarationExport.aggregate({
      where: exportWhere,
      _sum: { valeur: true },
      _count: { _all: true },
    });

    // ClientModels
    const clientModelWhere: Prisma.ClientModelWhereInput = {
      ...(clientIds ? { clientId: { in: clientIds } } : {}),
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    };
    const clientModels = await prisma.clientModel.findMany({
      where: clientModelWhere,
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { client: true },
    });

    // Events
    const eventWhere: Prisma.EventWhereInput = {
      ...(dateFilter ? { date: dateFilter } : {}),
    };
    const events = await prisma.event.findMany({
      where: eventWhere,
      orderBy: { date: "desc" },
      take: 5,
    });

    // Calculate HT and TTC
    const htInvoices = invoices.reduce((sum, inv) => sum + inv.lines.reduce((lSum, line) => lSum + (line.quantity * line.unitPrice), 0), 0);
    const ttcInvoices = invoices.reduce((sum, inv) => sum + (inv.vatActive ? htInvoices * (1 + (inv.vatRate || 0) / 100) : htInvoices), 0);
    const htExports = exports.reduce((sum, exp) => sum + (exp.valeur || 0), 0);
    const ttcExports = exports.reduce((sum, exp) => sum + (exp.vatActive ? exp.valeur * (1 + (exp.vatRate || 0) / 100) : exp.valeur), 0);
    const totalTTC = ttcInvoices + ttcExports;

    return NextResponse.json({
      invoices: {
        list: invoices,
        totalCount: invoiceTotals._count._all,
        totalHT: htInvoices,
        totalTTC: ttcInvoices,
        paidHT: invoicePaid._sum.vatRate && invoiceTotals._sum.vatRate ? htInvoices * (invoicePaid._sum.vatRate / invoiceTotals._sum.vatRate) : 0,
        paidTTC: invoicePaid._sum.vatRate && invoiceTotals._sum.vatRate ? ttcInvoices * (invoicePaid._sum.vatRate / invoiceTotals._sum.vatRate) : 0,
      },
      livraisons: { list: livraisons, totalCount: livraisonCount },
      livraisonEntrees: { list: livraisonEntrees, totalCount: livraisonEntreeCount },
      imports: {
        list: imports,
        totalCount: importTotals._count._all,
        totalHT: importTotals._sum.valeur || 0,
      },
      exports: {
        list: exports,
        totalCount: exportTotals._count._all,
        totalHT: htExports,
        totalTTC: ttcExports,
      },
      clientModels: { list: clientModels },
      events: { list: events },
      totalTTC,
    }, { status: 200 });
  } catch (error) {
    console.error("GET /api/dashboard Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}