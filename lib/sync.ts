import prisma from "./db";
import { offlineDB } from "./offlineDB";

export async function syncData() {
  if (!navigator.onLine) return;

  // Sync clients (example)
  const offlineClients = await offlineDB.clients.toArray();
  for (const client of offlineClients) {
    await prisma.client.upsert({
      where: { id: client.id },
      update: client,
      create: client,
    });
    await offlineDB.clients.delete(client.id);
  }

  // Add similar sync logic for other tables (clientModels, invoices, etc.)
  // Example for invoices:
  const offlineInvoices = await offlineDB.invoices.toArray();
  for (const invoice of offlineInvoices) {
    await prisma.invoice.upsert({
      where: { id: invoice.id },
      update: invoice,
      create: invoice,
    });
    await offlineDB.invoices.delete(invoice.id);
  }

  // Repeat for all tables as needed
}

if (typeof window !== "undefined") {
  window.addEventListener("online", syncData);
}