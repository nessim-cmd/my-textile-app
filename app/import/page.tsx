"use client";

import { Layers, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import confetti from "canvas-confetti";
import { DeclarationImport } from "@/type";
import Wrapper from "@/components/Wrapper";
import ImportComponent from "@/components/ImportComponent";

interface Client {
  id: string;
  name: string;
}

export default function ImportPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [numDec, setNumDec] = useState("");
  const [dateImport, setDateImport] = useState("");
  const [client, setClient] = useState("");
  const [valeur, setValeur] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [modalError, setModalError] = useState<string | null>(null);

  const email = user?.primaryEmailAddress?.emailAddress;
  const [declarations, setDeclarations] = useState<DeclarationImport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchClients = async () => {
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
  };

  const fetchDeclarations = async () => {
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch(`/api/import?email=${encodeURIComponent(email)}`, {
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
  };

  useEffect(() => {
    if (email) {
      fetchDeclarations();
      fetchClients();
    }
  }, [email]);

  const filteredDeclarations = declarations.filter(declaration =>
    declaration.num_dec.toLowerCase().includes(searchTerm.toLowerCase()) ||
    declaration.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDeclaration = async () => {
    if (!email || !numDec.trim() || !dateImport || !client.trim() || !valeur.trim()) {
      setModalError("All fields are required");
      return;
    }

    setModalError(null);

    try {
      const token = await getToken();
      const response = await fetch("/api/import", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          email,
          num_dec: numDec.trim(),
          date_import: dateImport,
          client: client.trim(),
          valeur: parseFloat(valeur),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create declaration");
      }

      await fetchDeclarations();
      setNumDec("");
      setDateImport("");
      setClient("");
      setValeur("");
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
            <span className="font-bold px-2">Rechercher</span>
            <Search className="w-5 h-5 mt-0.5" />
          </button>
        </div>

        <h1 className="text-3xl font-bold">Déclarations d'Import</h1>

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
            <div className="col-span-3 alert alert-error">
              {error}
            </div>
          ) : filteredDeclarations.length > 0 ? (
            filteredDeclarations.map((declaration) => (
              <ImportComponent key={declaration.id} declaration={declaration} />
            ))
          ) : (
            <div className="col-span-3 text-center">
              Aucune déclaration trouvée
            </div>
          )}
        </div>

        <dialog id="declaration_modal" className="modal">
          <div className="modal-box">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>

            <h3 className="font-bold text-lg mb-4">Nouvelle Déclaration</h3>

            {modalError && (
              <div className="alert alert-error mb-4">
                {modalError}
              </div>
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
                value={dateImport}
                onChange={(e) => setDateImport(e.target.value)}
              />
              <select
                className="select select-bordered w-full"
                value={client}
                onChange={(e) => setClient(e.target.value)}
              >
                <option value="">Sélectionner un client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.name}>
                    {client.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Valeur"
                className="input input-bordered w-full"
                value={valeur}
                onChange={(e) => setValeur(e.target.value)}
                step="0.01"
              />
            </div>

            <button
              className="btn btn-accent w-full mt-4"
              disabled={!numDec.trim() || !dateImport || !client.trim() || !valeur.trim()}
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