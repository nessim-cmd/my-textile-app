/* eslint-disable @typescript-eslint/no-explicit-any */
import { offlineDB } from "./offlineDB";
import { v4 as uuidv4 } from "uuid"; // Install uuid: npm install uuid

// GET clients
export async function getClients() {
  if (navigator.onLine) {
    const response = await fetch("/api/client", { method: "GET" });
    if (!response.ok) throw new Error("Failed to fetch clients");
    return response.json();
  } else {
    return offlineDB.clients.toArray();
  }
}

// POST client
export async function createClient(data: any) {
  const clientData = {
    id: uuidv4(), // Generate unique ID offline
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (navigator.onLine) {
    const response = await fetch("/api/client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientData),
    });
    if (!response.ok) throw new Error("Failed to create client");
    return response.json();
  } else {
    await offlineDB.clients.add(clientData);
    return clientData;
  }
}

// PUT client
export async function updateClient(data: any) {
  const clientData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  if (navigator.onLine) {
    const response = await fetch("/api/client", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientData),
    });
    if (!response.ok) throw new Error("Failed to update client");
    return response.json();
  } else {
    await offlineDB.clients.update(data.id, clientData);
    return clientData;
  }
}

// DELETE client
export async function deleteClient(id: string) {
  if (navigator.onLine) {
    const response = await fetch("/api/client", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) throw new Error("Failed to delete client");
    return response.json();
  } else {
    await offlineDB.clients.delete(id);
    return { success: true };
  }
}

// Sync offline data with server
export async function syncClients() {
  if (!navigator.onLine) return;

  const offlineClients = await offlineDB.clients.toArray();
  if (offlineClients.length === 0) return;

  const response = await fetch("/api/client", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isSync: true, clients: offlineClients }),
  });

  if (response.ok) {
    await offlineDB.clients.clear(); // Clear offline storage after successful sync
  } else {
    console.error("Sync failed:", await response.text());
  }
}

// Auto-sync when online
if (typeof window !== "undefined") {
  window.addEventListener("online", syncClients);
}