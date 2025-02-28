import { 
  Invoice as PrismaInvoice,
  Livraison as PrismaLivraison,
  Commande as PrismaCommande,
  InvoiceLine,
  LivraisonLine,
  CommandeLine,
  DeclarationImport as PrismaDeclarationImport,
  Model as PrismaModel,
  Accessoire as PrismaAccessoire,
  SuiviProduction as PrismaSuiviProduction,
  SuiviProductionLine as PrismaSuiviProductionLine,
  Planning as PrismaPlanning,
  ModelPlan as PrismaModelPlan,
  Variant as PrismaVariante,
  DeclarationExport as PrismaDeclarationExport,
  ExportLine,
  LivraisonEntree as PrismaLivraisonEntry,
  LivraisonEntreeLine,
} from "@prisma/client";

export interface Invoice extends PrismaInvoice {
  lines: InvoiceLine[];
}

export interface Livraison extends PrismaLivraison {
  lines: LivraisonLine[];
}
export interface LivraisonEntree extends PrismaLivraisonEntry {
  lines: LivraisonEntreeLine[];
}

export interface Commande extends PrismaCommande {
  lines: CommandeLine[];
}

export interface Totals {
  totalHT: number;
  totalVAT: number;
  totalTTC: number;
}

export interface TotalsExport {
  totalHT: number;
  totalVAT: number;
  totalTTC: number;
}

export interface DeclarationImport extends PrismaDeclarationImport {
  models: Model[];
}

export interface Model extends PrismaModel {
  accessories: Accessoire[];
}

export type Accessoire = PrismaAccessoire;

export interface SuiviProduction extends PrismaSuiviProduction {
  lines: SuiviProductionLine[];
}

export type SuiviProductionLine = PrismaSuiviProductionLine;

export interface Planning extends PrismaPlanning {
  models: ModelPlan[];
}

export interface ModelPlan extends PrismaModelPlan {
  variantes: Variante[];
}

export type Variante = PrismaVariante;

export interface DeclarationExport extends PrismaDeclarationExport {
  lines: ExportLine[];
}

export interface EtatImportExport {
  id: string;
  modelId: string;
  clientModel: {
    id: string;
    name: string | null;
    client: { name: string | null };
    variants: { qte_variante: number }[];
  };
  dateImport: Date | null;
  dateExport: Date | null;
  quantityTotal: number;
  quantityLivree: number;
  createdAt: Date;
  updatedAt: Date;
}

// type.ts (partial)
export interface EtatDeclaration {
  id: string;
  dateImport: Date;
  numDecImport: string;
  valeurImport: number;
  clientImport: string;
  modele: string;
  commande: string;
  designation: string;
  dateExport: Date | null;
  numDecExport: string;
  clientExport: string;
  valeurExport: number;
  quantityDelivered: number;
  quantityTotal: number;
}

// type.ts (partial)
export interface EtatLivraisonDeclaration {
  id: string;
  dateEntree: Date | null;
  numLivraisonEntree: string;
  valeurEntree: number;
  clientEntree: string;
  modele: string;
  commande: string;
  description: string;
  dateSortie: Date | null;
  numLivraisonSortie: string;
  clientSortie: string;
  valeurSortie: number;
  quantityDelivered: number;
  quantityTotal: number;
}