import { PrismaClient } from '@prisma/client';
import { createObjectCsvWriter } from 'csv-writer';

const prisma = new PrismaClient();

async function exportTableToCSV(modelName, fields) {
  try {
    // Fetch all records from the table
    const data = await prisma[modelName].findMany();
    if (data.length === 0) {
      console.log(`No data found for ${modelName}`);
      return;
    }

    // Define CSV writer
    const csvWriter = createObjectCsvWriter({
      path: `${modelName}.csv`,
      header: fields.map(field => ({ id: field, title: field })),
      fieldDelimiter: ',',
      recordDelimiter: '\n',
      alwaysQuote: true,
    });

    // Write data to CSV
    await csvWriter.writeRecords(data);
    console.log(`Exported ${modelName} to ${modelName}.csv`);
  } catch (error) {
    console.error(`Error exporting ${modelName}:`, error);
  }
}

async function exportAllTables() {
  const tables = {
    client: [
      'id', 'name', 'email', 'phone1', 'phone2', 'fix', 'address', 'matriculeFiscale',
      'soumission', 'dateDebutSoumission', 'dateFinSoumission', 'createdAt', 'updatedAt'
    ],
    clientModel: [
      'id', 'name', 'description', 'clientId', 'commandes', 'commandesWithVariants',
      'lotto', 'ordine', 'puht', 'createdAt', 'updatedAt'
    ],
    variant: [
      'id', 'name', 'clientModelId', 'qte_variante', 'modelId', 'createdAt', 'updatedAt'
    ],
    fournisseur: [
      'id', 'name', 'email', 'phone', 'address', 'createdAt', 'updatedAt'
    ],
    event: [
      'id', 'description', 'date'
    ],
    user: [
      'id', 'name', 'email', 'role', 'createdAt', 'updatedAt', 'clerkUserId'
    ],
    invoice: [
      'id', 'name', 'issuerName', 'issuerAddress', 'clientName', 'clientAddress',
      'invoiceDate', 'dueDate', 'vatActive', 'vatRate', 'status', 'poidsBrut',
      'poidsNet', 'nbrColis', 'volume', 'modePaiment', 'origineTessuto', 'gmailemetteur',
      'phoneemetteur', 'gmailclient', 'phoneclient', 'userId', 'createdAt', 'updatedAt'
    ],
    invoiceLine: [
      'id', 'commande', 'modele', 'description', 'quantity', 'unitPrice', 'invoiceId'
    ],
    livraison: [
      'id', 'name', 'issuerName', 'issuerAddress', 'clientName', 'clientAddress',
      'livraisonDate', 'soumission', 'soumissionValable', 'userId', 'createdAt', 'updatedAt'
    ],
    livraisonLine: [
      'id', 'commande', 'modele', 'description', 'quantity', 'livraisonId', 'createdAt',
      'updatedAt', 'isExcluded'
    ],
    livraisonEntree: [
      'id', 'name', 'clientId', 'clientName', 'livraisonDate', 'userId', 'createdAt', 'updatedAt'
    ],
    livraisonEntreeLine: [
      'id', 'commande', 'description', 'quantityReçu', 'quantityTrouvee', 'livraisonEntreeId',
      'createdAt', 'updatedAt'
    ],
    commande: [
      'id', 'name', 'issuerName', 'issuerAddress', 'clientName', 'clientAddress',
      'commandeDate', 'userId', 'createdAt', 'updatedAt'
    ],
    commandeLine: [
      'id', 'reference', 'description', 'quantity', 'commandeId'
    ],
    declarationImport: [
      'id', 'num_dec', 'date_import', 'client', 'valeur', 'userId', 'createdAt', 'updatedAt'
    ],
    model: [
      'id', 'name', 'commande', 'description', 'quantityReçu', 'quantityTrouvee',
      'createdAt', 'updatedAt', 'declarationImportId', 'livraisonEntreeId'
    ],
    accessoire: [
      'id', 'reference_accessoire', 'quantity_reçu', 'quantity_trouve', 'quantity_manque', 'modelId'
    ],
    suiviProduction: [
      'id', 'model_name', 'qte_total', 'client', 'userId', 'createdAt', 'updatedAt'
    ],
    suiviProductionLine: [
      'id', 'commande', 'qte_livree', 'qte_reparation', 'numero_livraison', 'date_export', 'suiviId'
    ],
    planning: [
      'id', 'name', 'status', 'userId', 'createdAt', 'updatedAt'
    ],
    modelPlan: [
      'id', 'name', 'lotto', 'commande', 'ordine', 'faconner', 'designation', 'date_import',
      'date_export', 'date_entre_coupe', 'date_sortie_coupe', 'date_entre_chaine',
      'date_sortie_chaine', 'planningId', 'createdAt', 'updatedAt'
    ],
    declarationExport: [
      'id', 'num_dec', 'clientName', 'exportDate', 'valeur', 'dueDate', 'vatActive', 'vatRate',
      'status', 'poidsBrut', 'poidsNet', 'nbrColis', 'volume', 'modePaiment', 'origineTessuto',
      'userId', 'createdAt', 'updatedAt'
    ],
    exportLine: [
      'id', 'commande', 'modele', 'description', 'quantity', 'unitPrice', 'isExcluded', 'exportId'
    ],
    ficheProduction: [
      'id', 'clientId', 'modelId', 'commande', 'quantity', 'createdAt', 'updatedAt'
    ],
    productionEntry: [
      'id', 'ficheId', 'week', 'day', 'hour', 'quantityCreated', 'createdAt', 'updatedAt'
    ],
    ficheCoupe: [
      'id', 'clientId', 'modelId', 'commande', 'quantity', 'createdAt', 'updatedAt'
    ],
    coupeEntry: [
      'id', 'ficheCoupeId', 'week', 'day', 'category', 'quantityCreated', 'createdAt', 'updatedAt'
    ],
  };

  for (const [modelName, fields] of Object.entries(tables)) {
    await exportTableToCSV(modelName, fields);
  }

  await prisma.$disconnect();
}

// Run the export
exportAllTables().catch(error => {
  console.error('Export failed:', error);
  prisma.$disconnect();
});