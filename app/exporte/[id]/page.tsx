"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Save, Trash } from "lucide-react";
import { DeclarationExport } from "@/type";
import Wrapper from "@/components/Wrapper";
import VATControlExport from "@/components/VATControleExport";
import ExportInfo from "@/components/ExportInfo";
import ExportLines from "@/components/ExportLines";
import ExportPDF from "@/components/ExportPDF";
import { useAuth } from "@clerk/nextjs";

interface Client {
  id: string;
  name: string;
}

interface ClientModel {
  id: string;
  name: string | null;
  clientId: string;
  commandes: string;
  description: string;
}

interface Totals {
  totalHT: number;
  totalVAT: number;
  totalTTC: number;
}

const statusOptions = [
  { value: 1, label: "Brouillon" },
  { value: 2, label: "En attente" },
  { value: 3, label: "Payée" },
  { value: 4, label: "Annulée" },
  { value: 5, label: "Impayée" },
];

const modePaimentOptions = [
  { value: 1, label: "Virement bancaire" },
  { value: 2, label: "Chèque" },
  { value: 3, label: "Espèce" },
];

export default function ExportDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { getToken } = useAuth();
  const [declaration, setDeclaration] = useState<DeclarationExport | null>(null);
  const [initialDeclaration, setInitialDeclaration] = useState<DeclarationExport | null>(null);
  const [, setClients] = useState<Client[]>([]);
  const [clientModels, setClientModels] = useState<ClientModel[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [, setIsSaveDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dateDebut, setDateFin] = useState("");
  const [dateFin, setDateDebut] = useState("");

  const fetchDeclaration = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/exporte/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch declaration");
      const data = await response.json();
      setDeclaration(data);
      setInitialDeclaration(data);
    } catch (error) {
      console.error("Error fetching declaration:", error);
      setErrorMessage("Failed to fetch declaration. Please try again.");
    }
  };

  const fetchClients = async () => {
    try {
      const token = await getToken();
      const response = await fetch("/api/client", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setErrorMessage("Failed to fetch clients. Please try again.");
    }
  };

  const fetchClientModels = async () => {
    if (!declaration?.clientName) {
      setClientModels([]);
      return;
    }

    try {
      const token = await getToken();
      const params = new URLSearchParams();
      params.append("client", declaration.clientName);
      if (dateDebut) params.append("dateDebut", dateDebut);
      if (dateFin) params.append("dateFin", dateFin);

      const response = await fetch(`/api/client-model?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch models");
      const data = await response.json();
      setClientModels(data);
    } catch (error) {
      console.error("Error fetching client models:", error);
      setClientModels([]);
      setErrorMessage("Failed to load models for selected client and dates");
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchDeclaration();
      fetchClients();
    }
  }, [params.id]);

  useEffect(() => {
    if (declaration?.clientName) {
      fetchClientModels();
    }
  }, [declaration?.clientName, dateDebut, dateFin]);

  useEffect(() => {
    setIsSaveDisabled(JSON.stringify(declaration) === JSON.stringify(initialDeclaration));
  }, [declaration, initialDeclaration]);

  useEffect(() => {
    if (!declaration) return;
    const ht = declaration.lines.reduce(
      (acc, { quantity, unitPrice }) => acc + (quantity || 0) * (unitPrice || 0),
      0
    );
    const vat = declaration.vatActive ? ht * (declaration.vatRate / 100) : 0;
    const totalTTC = ht + vat;
    setTotals({ totalHT: ht, totalVAT: vat, totalTTC });
    setDeclaration({ ...declaration, valeur: totalTTC });
  }, [declaration?.lines, declaration?.vatActive, declaration?.vatRate]);

  const handleSave = async () => {
    if (!declaration) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const token = await getToken();
      const response = await fetch(`/api/exporte/${declaration.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(declaration),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update declaration");
      }

      await fetchDeclaration();
    } catch (error) {
      console.error("Error saving declaration:", error);
      setErrorMessage("Failed to save declaration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette déclaration ?");
    if (confirmed && declaration?.id) {
      try {
        const token = await getToken();
        await fetch(`/api/exporte/${declaration.id}`, { 
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        router.push("/exporte");
      } catch (error) {
        console.error("Error deleting declaration:", error);
        setErrorMessage("Failed to delete declaration. Please try again.");
      }
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!declaration) return;
    setDeclaration({ ...declaration, status: parseInt(e.target.value) });
  };

  const handleModePaimentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!declaration) return;
    setDeclaration({ ...declaration, modePaiment: parseInt(e.target.value) });
  };

  const handleModelsChange = (models: ClientModel[]) => {
    setClientModels(models);
  };

  if (!declaration || !totals)
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <span className="font-bold">Chargement de la déclaration...</span>
      </div>
    );

  return (
    <Wrapper>
      <div className="p-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 space-y-4 md:space-y-0">
          {/* Left Side: Export ID and Date Inputs */}
          <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-x-4 md:space-y-0">
            <p className="badge badge-ghost badge-lg uppercase">
              <span>Export-</span>{declaration.num_dec}
            </p>
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
              <label className="text-sm font-bold whitespace-nowrap">Date Début:</label>
              <input
                type="date"
                value={dateDebut}
                className="input input-bordered input-sm w-full max-w-[150px] min-h-[48px] touch-manipulation"
                onChange={(e) => setDateDebut(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
              <label className="text-sm font-bold whitespace-nowrap">Date Fin:</label>
              <input
                type="date"
                value={dateFin}
                className="input input-bordered input-sm w-full max-w-[150px] min-h-[48px] touch-manipulation"
                onChange={(e) => setDateFin(e.target.value)}
              />
            </div>
          </div>
          {/* Right Side: Selects and Buttons */}
          <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-x-3 md:space-y-0">
            <select
              className="select select-sm select-bordered w-full max-w-[140px] min-h-[48px] touch-manipulation"
              value={declaration.modePaiment}
              onChange={handleModePaimentChange}
            >
              {modePaimentOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              className="select select-sm select-bordered w-full max-w-[140px] min-h-[48px] touch-manipulation"
              value={declaration.status}
              onChange={handleStatusChange}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              className="btn btn-sm btn-accent w-full max-w-[140px] min-h-[48px] flex items-center justify-center px-2 py-2 rounded-lg text-sm font-semibold whitespace-nowrap tracking-tight touch-manipulation"
              disabled={isLoading}
              onClick={handleSave}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  Sauvegarder
                  <Save className="w-4 ml-2" />
                </>
              )}
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-sm btn-accent w-full max-w-[50px] min-h-[48px] flex items-center justify-center px-2 py-2 rounded-lg touch-manipulation"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="alert alert-error mb-4">
            {errorMessage}
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-col md:flex-row w-full space-y-4 md:space-y-0 md:space-x-4">
          {/* Left Section: Totals and Export Info */}
          <div className="flex w-full md:w-1/3 flex-col">
            <div className="mb-4 bg-base-200 rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <div className="badge badge-accent">Résumé des Totaux</div>
                <VATControlExport declaration={declaration} setDeclaration={setDeclaration} />
              </div>
              <div className="space-y-2 text-md">
                <div className="flex justify-between">
                  <span>Total Hors Taxes</span>
                  <span>{totals.totalHT.toFixed(2)} €</span>
                </div>
                {declaration.vatActive && (
                  <div className="flex justify-between">
                    <span>TVA ({declaration.vatRate}%)</span>
                    <span>{totals.totalVAT.toFixed(2)} €</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>Total TTC</span>
                  <span className="text-accent">{totals.totalTTC.toFixed(2)} €</span>
                </div>
              </div>
            </div>
            <ExportInfo
              declaration={declaration}
              setDeclaration={setDeclaration}
              dateDebut={dateDebut}
              dateFin={dateFin}
              onModelsChange={handleModelsChange}
            />
          </div>
          {/* Right Section: Export Lines and PDF */}
          <div className="flex w-full md:w-2/3 flex-col">
            <ExportLines declaration={declaration} setDeclaration={setDeclaration} clientModels={clientModels} />
            <ExportPDF declaration={declaration} totals={totals} />
          </div>
        </div>
      </div>
    </Wrapper>
  );
}