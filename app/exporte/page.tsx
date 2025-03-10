"use client";

import { Layers, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import confetti from "canvas-confetti";
import { DeclarationExport } from "@/type";
import Wrapper from "@/components/Wrapper";
import ExportComponent from "@/components/ExportComponent";

interface Client {
  id: string;
  name: string;
}

export default function ExportPage() {
  const { getToken } = useAuth();
  const [numDec, setNumDec] = useState("");
  const [exportDate, setExportDate] = useState("");
  const [clientName, setClientName] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [modalError, setModalError] = useState<string | null>(null);
  const [declarations, setDeclarations] = useState<DeclarationExport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchClients = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch("/api/client", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setError("Failed to fetch clients");
    }
  }, [getToken]);

  const fetchDeclarations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch("/api/exporte", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      setDeclarations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading declarations:", error);
      setError("Failed to load declarations");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchDeclarations();
    fetchClients();
  }, [fetchClients, fetchDeclarations]);

  const filteredDeclarations = declarations.filter(declaration =>
    declaration.num_dec.toLowerCase().includes(searchTerm.toLowerCase()) ||
    declaration.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredDeclarations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedDeclarations = filteredDeclarations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreateDeclaration = async () => {
    if (!numDec.trim() || !exportDate || !clientName.trim()) {
      setModalError("All fields are required");
      return;
    }

    setModalError(null);

    try {
      const token = await getToken();
      const response = await fetch("/api/exporte", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          num_dec: numDec.trim(),
          exportDate,
          clientName: clientName.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create declaration");
      }

      await fetchDeclarations();
      setNumDec("");
      setExportDate("");
      setClientName("");
      (document.getElementById("declaration_modal") as HTMLDialogElement)?.close();

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 9999,
      });
    } catch (error) {
      console.error("Error creating declaration:", error);
      setModalError("Failed to create declaration");
    }
  };

  return (
    <Wrapper>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Rechercher par numéro ou client"
            className="rounded-xl p-2 bg-gray-100 w-[600px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="flex p-2 rounded-xl bg-blue-300">
            <span className="font-bold px-2">Search</span>
            <Search className="w-5 h-5 mt-0.5" />
          </button>
        </div>

        <h1 className="text-3xl font-bold">Déclarations d&apos;Export</h1>

        <div className="grid md:grid-cols-3 gap-4">
          <div
            className="cursor-pointer border border-accent rounded-xl flex flex-col justify-center items-center p-5"
            onClick={() => (document.getElementById("declaration_modal") as HTMLDialogElement)?.showModal()}
          >
            <div className="font-bold text-accent">Nouvelle Déclaration</div>
            <div className="bg-accent-content text-accent rounded-full p-2 mt-2">
              <Layers className="h-6 w-6" />
            </div>
          </div>

          {loading ? (
            <div className="col-span-3 text-center">
              <span className="loading loading-dots loading-lg"></span>
            </div>
          ) : error ? (
            <div className="col-span-3 alert alert-error">{error}</div>
          ) : paginatedDeclarations.length > 0 ? (
            paginatedDeclarations.map((declaration) => (
              <ExportComponent key={declaration.id} exporte={declaration} />
            ))
          ) : (
            <div className="col-span-3 text-center">Aucune déclaration trouvée</div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <button
              className="btn btn-outline btn-sm flex items-center"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </button>
            <span className="text-sm">Page {currentPage} of {totalPages}</span>
            <button
              className="btn btn-outline btn-sm flex items-center"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        )}

        <dialog id="declaration_modal" className="modal">
          <div className="modal-box">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>

            <h3 className="font-bold text-lg mb-4">Nouvelle Déclaration</h3>

            {modalError && (
              <div className="alert alert-error mb-4">{modalError}</div>
            )}

            <div className="form-control space-y-4">
              <input
                type="text"
                placeholder="Numéro de déclaration"
                className="input input-bordered w-full"
                value={numDec}
                onChange={(e) => setNumDec(e.target.value)}
              />
              <input
                type="date"
                className="input input-bordered w-full"
                value={exportDate}
                onChange={(e) => setExportDate(e.target.value)}
              />
              <select
                className="select select-bordered w-full"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              >
                <option value="">Sélectionner un client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.name}>{client.name}</option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-accent w-full mt-4"
              disabled={!numDec.trim() || !exportDate || !clientName.trim()}
              onClick={handleCreateDeclaration}
            >
              Créer
            </button>
          </div>
        </dialog>
      </div>
    </Wrapper>
  );
}