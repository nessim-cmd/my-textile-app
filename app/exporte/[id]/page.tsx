"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Save, Trash } from "lucide-react";
import { DeclarationExport, TotalsExport } from "@/type";
import Wrapper from "@/components/Wrapper";
import VATControlExport from "@/components/VATControleExport";
import ExportInfo from "@/components/ExportInfo";
import ExportLines from "@/components/ExportLines";
import ExportPDF from "@/components/ExportPDF";
import { useAuth } from "@clerk/nextjs"; // Add Clerk auth hook

interface ClientModel {
  id: string;
  name: string;
  clientId: string;
}

export default function ExportDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { getToken } = useAuth(); // Get Clerk auth token
  const [exporte, setExporte] = useState<DeclarationExport | null>(null);
  const [initialExport, setInitialExport] = useState<DeclarationExport | null>(null);
  const [totals, setTotals] = useState<TotalsExport | null>(null);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [clientModels, setClientModels] = useState<ClientModel[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Add error state

  const fetchExport = async () => {
    try {
      const token = await getToken(); // Get fresh token
      const response = await fetch(`/api/exporte/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch export");
      const data = await response.json();
      setExporte(data);
      setInitialExport(data);
    } catch (error) {
      console.error("Error fetching export:", error);
    }
  };

  useEffect(() => {
    if (params.id) fetchExport();
  }, [params.id]);

  useEffect(() => {
    if (!exporte) return;

    const ht = exporte.lines.reduce(
      (acc, { quantity, unitPrice }) => acc + (quantity || 0) * (unitPrice || 0),
      0
    );
    const vat = exporte.vatActive ? ht * (exporte.vatRate / 100) : 0;
    setTotals({
      totalHT: ht,
      totalVAT: vat,
      totalTTC: ht + vat,
    });
  }, [exporte]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!exporte) return;
    setExporte({ ...exporte, status: parseInt(e.target.value) });
  };

  const handleModePaiment = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!exporte) return;
    setExporte({ ...exporte, modePaiment: parseInt(e.target.value) });
  };

  useEffect(() => {
    setIsSaveDisabled(JSON.stringify(exporte) === JSON.stringify(initialExport));
  }, [exporte, initialExport]);

  const handleSave = async () => {
    if (!exporte) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const token = await getToken(); // Get fresh token for each request
      const response = await fetch(`/api/exporte/${exporte.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` // Add auth header
        },
        body: JSON.stringify(exporte),
        signal: AbortSignal.timeout(30000) // 30-second timeout
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update export");
      }

      await fetchExport(); // Refresh data after save
    } catch (error) {
      console.error("Error saving export:", error);
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cet export ?");
    if (confirmed && exporte?.id) {
      try {
        const token = await getToken();
        await fetch(`/api/exporte/${exporte.id}`, { 
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        router.push("/exporte");
      } catch (error) {
        console.error("Error deleting export:", error);
        setErrorMessage("Failed to delete export. Please try again.");
      }
    }
  };

  if (!exporte || !totals)
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <span className="font-bold">Chargement de Export...</span>
      </div>
    );

  return (
    <Wrapper>
      <div>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          <p className="badge badge-ghost badge-lg uppercase">
            <span>Export-</span>
            {exporte.id}
          </p>

          <div className="flex md:mt-0 mt-4">
            <select
              className="select select-sm select-bordered w-full"
              value={exporte.modePaiment}
              onChange={handleModePaiment}
            >
              <option value={1}>Virement bancaire</option>
              <option value={2}>Chéque</option>
              <option value={3}>Espéce</option>
            </select>

            <select
              className="select select-sm select-bordered w-full"
              value={exporte.status}
              onChange={handleStatusChange}
            >
              <option value={1}>Brouillon</option>
              <option value={2}>En attente</option>
              <option value={3}>Payée</option>
              <option value={4}>Annulée</option>
              <option value={5}>Impayée</option>
            </select>

            <button
              className="btn btn-sm btn-accent ml-4"
              disabled={isSaveDisabled || isLoading}
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

            <button onClick={handleDelete} className="btn btn-sm btn-accent ml-4">
              <Trash className="w-4" />
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="alert alert-error mb-4">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col md:flex-row w-full">
          <div className="flex w-full md:w-1/3 flex-col">
            <div className="mb-4 bg-base-200 rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <div className="badge badge-accent">Résumé des Totaux</div>
                <VATControlExport exporte={exporte} setExports={setExporte} />
              </div>

              <div className="space-y-2 text-md">
                <div className="flex justify-between">
                  <span>Total Hors Taxes</span>
                  <span>{totals.totalHT.toFixed(2)} €</span>
                </div>
                {exporte.vatActive && (
                  <div className="flex justify-between">
                    <span>TVA ({exporte.vatRate}%)</span>
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
              exporte={exporte} 
              setExports={setExporte}
              onModelsChange={setClientModels}
            />
          </div>

          <div className="flex w-full md:w-2/3 flex-col md:ml-4">
            <ExportLines 
              exporte={exporte} 
              setExports={setExporte} 
              clientModels={clientModels}
            />
            <ExportPDF exporte={exporte} totalsExport={totals} />
          </div>
        </div>
      </div>
    </Wrapper>
  );
}