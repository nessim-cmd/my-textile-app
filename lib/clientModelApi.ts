import { offlineDB } from "./offlineDB";
import { v4 as uuidv4 } from "uuid";
import { Prisma } from '@prisma/client';

interface Variant {
  id?: string;
  name?: string | null;
  qte_variante?: number | null;
}



interface ClientModel {
  id: string;
  name?: string | null;
  description?: string | null;
  commandes?: string | null;
  commandesWithVariants?: Prisma.InputJsonValue; // Use Prisma.InputJsonValue
  lotto?: string | null;
  ordine?: string | null;
  puht?: number | null;
  clientId: string;
  variants?: Variant[];
  createdAt?: string;
  updatedAt?: string;
}

// GET client models
export async function getClientModels(params: { email: string; dateDebut?: string; dateFin?: string; search?: string; client?: string }) {
  if (navigator.onLine) {
    const urlParams = new URLSearchParams({ email: params.email });
    if (params.dateDebut) urlParams.append('dateDebut', params.dateDebut);
    if (params.dateFin) urlParams.append('dateFin', params.dateFin);
    if (params.search) urlParams.append('search', params.search);
    if (params.client) urlParams.append('client', params.client);

    const response = await fetch(`/api/client-model?${urlParams.toString()}`, { method: "GET" });
    if (!response.ok) throw new Error("Failed to fetch client models");
    return response.json();
  } else {
    let models = await offlineDB.clientModels.toArray();
    if (params.dateDebut && params.dateFin) {
      const start = new Date(params.dateDebut).getTime();
      const end = new Date(params.dateFin).getTime();
      models = models.filter(m => {
        const createdAt = new Date(m.createdAt || 0).getTime();
        return createdAt >= start && createdAt <= end;
      });
    }
    if (params.search) {
      const term = params.search.toLowerCase();
      models = models.filter(m =>
        (m.name?.toLowerCase().includes(term) ||
        m.description?.toLowerCase().includes(term) ||
        m.commandes?.toLowerCase().includes(term))
      );
    }
    if (params.client) {
      models = models.filter(m => m.clientId === params.client);
    }
    return models;
  }
}

// POST client model
export async function createClientModel(data: Partial<ClientModel> & { email: string }) {
  const modelData: ClientModel = {
    id: uuidv4(),
    name: data.name,
    description: data.description,
    commandes: data.commandes,
    commandesWithVariants: data.commandesWithVariants || [],
    lotto: data.lotto,
    ordine: data.ordine,
    puht: data.puht,
    clientId: data.clientId!,
    variants: data.variants || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (navigator.onLine) {
    const response = await fetch("/api/client-model", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...modelData, email: data.email }),
    });
    if (!response.ok) throw new Error("Failed to create client model");
    return response.json();
  } else {
    await offlineDB.clientModels.add(modelData);
    return modelData;
  }
}

// PUT client model
export async function updateClientModel(data: Partial<ClientModel>) {
  const modelData: Partial<ClientModel> = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  if (navigator.onLine) {
    const response = await fetch("/ personally/api/client-model", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(modelData),
    });
    if (!response.ok) throw new Error("Failed to update client model");
    return response.json();
  } else {
    await offlineDB.clientModels.update(data.id!, modelData);
    return { ...await offlineDB.clientModels.get(data.id!), ...modelData };
  }
}

// DELETE client model
export async function deleteClientModel(id: string) {
  if (navigator.onLine) {
    const response = await fetch("/api/client-model", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) throw new Error("Failed to delete client model");
    return response.json();
  } else {
    await offlineDB.clientModels.delete(id);
    return { success: true };
  }
}

// Sync offline data with server
export async function syncClientModels(email: string) {
  if (!navigator.onLine) return;

  const offlineModels = await offlineDB.clientModels.toArray();
  if (offlineModels.length === 0) return;

  const response = await fetch("/api/client-model", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isSync: true, models: offlineModels, email }),
  });

  if (response.ok) {
    await offlineDB.clientModels.clear();
  } else {
    console.error("Sync failed:", await response.text());
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    const email = localStorage.getItem("clerkUserEmail");
    if (email) syncClientModels(email);
  });
}