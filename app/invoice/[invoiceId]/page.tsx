// app/invoice/[invoiceId]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Save, Trash } from "lucide-react";
import { Invoice, Totals } from "@/type";
import Wrapper from "@/components/Wrapper";
import VATControl from "@/components/VATControl";
import InvoiceInfo from "@/components/InvoiceInfo";
import InvoiceLines from "@/components/InvoiceLines";
import InvoicePDF from "@/components/InvoicePDF";

interface ClientModel {
  id: string;
  name: string | null;
  clientId: string;
  commandes: string | null; // Add commandes from ClientModel
  description: string | null; // Add description from ClientModel
}

export default function InvoicePage() {
  const router = useRouter();
  const params = useParams<{ invoiceId: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [initialInvoice, setInitialInvoice] = useState<Invoice | null>(null);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [clientModels, setClientModels] = useState<ClientModel[]>([]);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${params.invoiceId}`);
      if (!response.ok) throw new Error("Failed to fetch invoice");
      const data = await response.json();
      setInvoice(data);
      setInitialInvoice(data);
    } catch (error) {
      console.error("Error fetching invoice:", error);
    }
  };

  useEffect(() => {
    if (params.invoiceId) fetchInvoice();
  }, [params.invoiceId]);

  useEffect(() => {
    if (!invoice) return;
    const ht = invoice.lines.reduce(
      (acc, { quantity, unitPrice }) => acc + (quantity || 0) * (unitPrice || 0),
      0
    );
    const vat = invoice.vatActive ? ht * (invoice.vatRate / 100) : 0;
    setTotals({ totalHT: ht, totalVAT: vat, totalTTC: ht + vat });
  }, [invoice]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!invoice) return;
    setInvoice({ ...invoice, status: parseInt(e.target.value) });
  };

  const handleModePaiment = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!invoice) return;
    setInvoice({ ...invoice, modePaiment: parseInt(e.target.value) });
  };

  useEffect(() => {
    setIsSaveDisabled(JSON.stringify(invoice) === JSON.stringify(initialInvoice));
  }, [invoice, initialInvoice]);

  const handleSave = async () => {
    if (!invoice) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoice),
      });
      if (!response.ok) throw new Error("Failed to update invoice");
      const updatedResponse = await fetch(`/api/invoices/${invoice.id}`);
      const updatedInvoice = await updatedResponse.json();
      setInvoice(updatedInvoice);
      setInitialInvoice(updatedInvoice);
    } catch (error) {
      console.error("Error saving invoice:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette facture ?");
    if (confirmed && invoice?.id) {
      try {
        await fetch(`/api/invoices/${invoice.id}`, { method: "DELETE" });
        router.push("/invoice");
      } catch (error) {
        console.error("Error deleting invoice:", error);
      }
    }
  };

  if (!invoice || !totals)
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <span className="font-bold">Chargement de la facture...</span>
      </div>
    );

  return (
    <Wrapper>
      <div>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          <div className="flex items-center space-x-4">
            <p className="badge badge-ghost badge-lg uppercase">
              <span>Facture-</span>
              {invoice.id}
            </p>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-bold">Date Début:</label>
              <input
                type="date"
                value={dateDebut}
                className="input input-bordered input-sm w-36"
                onChange={(e) => setDateDebut(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-bold">Date Fin:</label>
              <input
                type="date"
                value={dateFin}
                className="input input-bordered input-sm w-36"
                onChange={(e) => setDateFin(e.target.value)}
              />
            </div>
          </div>
          <div className="flex md:mt-0 mt-4">
            <select
              className="select select-sm select-bordered w-full"
              value={invoice.modePaiment}
              onChange={handleModePaiment}
            >
              <option value={1}>Virement bancaire</option>
              <option value={2}>Chéque</option>
              <option value={3}>Espéce</option>
            </select>
            <select
              className="select select-sm select-bordered w-full"
              value={invoice.status}
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
        <div className="flex flex-col md:flex-row w-full">
          <div className="flex w-full md:w-1/3 flex-col">
            <div className="mb-4 bg-base-200 rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <div className="badge badge-accent">Résumé des Totaux</div>
                <VATControl invoice={invoice} setInvoice={setInvoice} />
              </div>
              <div className="space-y-2 text-md">
                <div className="flex justify-between">
                  <span>Total Hors Taxes</span>
                  <span>{totals.totalHT.toFixed(2)} €</span>
                </div>
                {invoice.vatActive && (
                  <div className="flex justify-between">
                    <span>TVA ({invoice.vatRate}%)</span>
                    <span>{totals.totalVAT.toFixed(2)} €</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>Total TTC</span>
                  <span className="text-accent">{totals.totalTTC.toFixed(2)} €</span>
                </div>
              </div>
            </div>
            <InvoiceInfo
              invoice={invoice}
              setInvoice={setInvoice}
              dateDebut={dateDebut}
              dateFin={dateFin}
              onModelsChange={setClientModels}
            />
          </div>
          <div className="flex w-full md:w-2/3 flex-col md:ml-4">
            <InvoiceLines invoice={invoice} setInvoice={setInvoice} clientModels={clientModels} />
            <InvoicePDF invoice={invoice} totals={totals} />
          </div>
        </div>
      </div>
    </Wrapper>
  );
}