"use client";

import { Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import confetti from "canvas-confetti";
import { Invoice } from "@/type";
import Wrapper from "@/components/Wrapper";
import InvoiceComponent from "@/components/InvoiceComponent";



export default function Home() {
  const { user } = useUser();
  const [invoiceName, setInvoiceName] = useState("");
  const [isNameValid, setIsNameValid] = useState(true);
  const email = user?.primaryEmailAddress?.emailAddress;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/invoices?email=${encodeURIComponent(email)}`);
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error loading invoices:", err);
      setError(err.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (email) fetchInvoices();
  }, [email]);

  const handleCreateInvoice = async () => {
    if (!email || !invoiceName.trim()) return;

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          name: invoiceName.trim() 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create invoice");
      }

      await fetchInvoices();
      setInvoiceName("");

      // Close modal
      (document.getElementById("invoice_modal") as HTMLDialogElement)?.close();

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 9999,
      });
    } catch (err: any) {
      console.error("Error creating invoice:", err);
      alert(err.message || "Failed to create invoice");
    }
  };

  return (
    <Wrapper>
      <div className="flex flex-col space-y-4">
        <h1 className="text-lg font-bold">Mes factures</h1>

        <div className="grid md:grid-cols-3 gap-4">
          <div
            className="cursor-pointer border border-accent rounded-xl flex flex-col justify-center items-center p-5"
            onClick={() => (document.getElementById("invoice_modal") as HTMLDialogElement)?.showModal()}
          >
            <div className="font-bold text-accent">Créer une facture</div>
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
          ) : invoices.length > 0 ? (
            invoices.map((invoice) => (
              <InvoiceComponent key={invoice.id} invoice={invoice} index={0} />
            ))
          ) : (
            <div className="col-span-3 text-center">
              Aucune facture trouvée
            </div>
          )}
        </div>

        <dialog id="invoice_modal" className="modal">
          <div className="modal-box">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>

            <h3 className="font-bold text-lg mb-4">Nouvelle Facture</h3>

            <div className="form-control">
              <input
                type="text"
                placeholder="Nom de la facture (max 60 caractères)"
                className="input input-bordered w-full"
                value={invoiceName}
                onChange={(e) => {
                  setInvoiceName(e.target.value);
                  setIsNameValid(e.target.value.length <= 60);
                }}
                maxLength={60}
              />
              <label className="label">
                <span className="label-text-alt">
                  {invoiceName.length}/60 caractères
                </span>
              </label>
            </div>

            <button
              className="btn btn-accent w-full mt-4"
              disabled={!isNameValid || !invoiceName.trim()}
              onClick={handleCreateInvoice}
            >
              Créer
            </button>
          </div>
        </dialog>
      </div>
    </Wrapper>
  );
}