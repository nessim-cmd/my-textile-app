import { Invoice as PrismaInvoice } from "@prisma/client";
import { Livraison as PrismaLivraison } from "@prisma/client";
import { InvoiceLine } from "@prisma/client";
import { LivraisonLine } from "@prisma/client";

export interface Invoice extends PrismaInvoice {
  lines: InvoiceLine[];
}

export interface Livraison extends PrismaLivraison{
  lines: LivraisonLine[];
}

export interface Totals {
  totalHT: number;
  totalVAT: number;
  totalTTC: number;
}