/* eslint-disable @typescript-eslint/no-explicit-any */
import Dexie, { Table } from "dexie";

class OfflineDB extends Dexie {
  clients!: Table<any>;
  clientModels!: Table<any>;
  variants!: Table<any>;
  fournisseurs!: Table<any>;
  events!: Table<any>;
  users!: Table<any>;
  invoices!: Table<any>;
  invoiceLines!: Table<any>;
  livraisons!: Table<any>;
  livraisonLines!: Table<any>;
  livraisonEntrees!: Table<any>;
  livraisonEntreeLines!: Table<any>;
  commandes!: Table<any>;
  commandeLines!: Table<any>;
  declarationImports!: Table<any>;
  models!: Table<any>;
  accessoires!: Table<any>;
  suiviProductions!: Table<any>;
  suiviProductionLines!: Table<any>;
  plannings!: Table<any>;
  modelPlans!: Table<any>;
  declarationExports!: Table<any>;
  exportLines!: Table<any>;

  constructor() {
    super("OfflineDB");
    this.version(1).stores({
      clients: "id, name, email, phone1, phone2, address",
      clientModels: "id, name, clientId, commandes",
      variants: "id, name, clientModelId, modelId",
      fournisseurs: "id, name, email, phone, address",
      events: "id, description, date",
      users: "id, name, email, role, clerkUserId",
      invoices:
        "id, name, issuerName, clientName, invoiceDate, userId",
      invoiceLines: "id, invoiceId, commande, modele, quantity",
      livraisons: "id, name, issuerName, clientName, livraisonDate, userId",
      livraisonLines: "id, livraisonId, commande, modele, quantity",
      livraisonEntrees: "id, name, clientId, clientName, livraisonDate, userId",
      livraisonEntreeLines: "id, livraisonEntreeId, modele, commande, quantityReçu",
      commandes: "id, name, issuerName, clientName, commandeDate, userId",
      commandeLines: "id, commandeId, reference, quantity",
      declarationImports: "id, num_dec, date_import, client, valeur, userId",
      models: "id, name, declarationImportId",
      accessoires: "id, reference_accessoire, modelId",
      suiviProductions: "id, model_name, qte_total, client, userId",
      suiviProductionLines: "id, suiviId, commande, qte_livree, date_export",
      plannings: "id, name, status, userId",
      modelPlans: "id, name, planningId, lotto, commande",
      declarationExports: "id, num_dec, clientName, exportDate, userId",
      exportLines: "id, exportId, commande, modele, quantity",
    });
  }
}

export const offlineDB = new OfflineDB();