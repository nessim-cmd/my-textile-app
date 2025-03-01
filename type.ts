import { 
  Invoice as PrismaInvoice,
  Livraison as PrismaLivraison,
  Commande as PrismaCommande,
  InvoiceLine,
  LivraisonLine,
  CommandeLine,
  SuiviProduction as PrismaSuiviProduction,
  SuiviProductionLine as PrismaSuiviProductionLine,
  Planning as PrismaPlanning,
  ModelPlan as PrismaModelPlan,
  Variant as PrismaVariante,
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

export interface DeclarationImport {
  id: string;
  num_dec: string;
  date_import: string;
  client: string;
  valeur: number;
  userId: string;
  models: Model[];
  createdAt: string;
  updatedAt: string;
}

export interface Model {
  id: string;
  name: string;
  declarationImportId: string;
  accessories: Accessoire[];
  createdAt: string;
  updatedAt: string;
}

export interface Accessoire {
  id: string;
  reference_accessoire: string;
  quantity_reçu: number;
  quantity_trouve: number;
  quantity_manque: number;
  modelId: string;
  createdAt?: string;
  updatedAt?: string;
}

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

export interface DeclarationExport {
  id: string;
  num_dec: string;
  clientName: string;
  exportDate: string;
  valeur: number;
  dueDate: string;
  vatActive: boolean;
  vatRate: number;
  status: number;
  poidsBrut: string;
  poidsNet: string;
  nbrColis: string;
  volume: string;
  modePaiment: number;
  origineTessuto: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  lines: ExportLine[];
}

export interface ExportLine {
  id: string;
  commande: string;
  modele: string;
  description: string;
  quantity: number;
  unitPrice: number;
  exportId: string;
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