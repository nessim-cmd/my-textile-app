"use client";

import { Layers, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import confetti from "canvas-confetti";
import { Invoice, DeclarationExport } from "@/type";
import Wrapper from "@/components/Wrapper";
import InvoiceComponent from "@/components/InvoiceComponent";
import ExportComponent from "@/components/ExportComponent";

export default function Home() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [invoiceName, setInvoiceName] = useState("");
  const [isNameValid, setIsNameValid] = useState(true);
  const email = user?.primaryEmailAddress?.emailAddress;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [exports, setExports] = useState<DeclarationExport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchInvoices = useCallback(async () => {
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch(`/api/invoices?email=${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading invoices:", error);
      setError("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [email, getToken]);

  const fetchExports = useCallback(async () => {
    if (!email) return;

    try {
      const token = await getToken();
      const response = await fetch(`/api/exporte?email=${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      setExports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading exports:", error);
      setError("Failed to load exports");
    }
  }, [email, getToken]);

  useEffect(() => {
    if (email) {
      fetchInvoices();
      fetchExports();
    }
  }, [email, fetchInvoices, fetchExports]);

  const combinedItems = [
    ...invoices.map(item => ({ type: "invoice", data: item })),
    ...exports.map(item => ({ type: "export", data: item })),
  ].filter(item =>
    item.type === "invoice"
      ? (item.data as Invoice).name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.data as Invoice).id.toString().toLowerCase().includes(searchTerm.toLowerCase())
      : (item.data as DeclarationExport).num_dec.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.data as DeclarationExport).clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.data as DeclarationExport).id.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = combinedItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedItems = combinedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreateInvoice = async () => {
    if (!email || !invoiceName.trim()) return;

    try {
      const token = await getToken();
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email, name: invoiceName.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create invoice");
      }

      await fetchInvoices();
      setInvoiceName("");
      (document.getElementById("invoice_modal") as HTMLDialogElement)?.close();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, zIndex: 9999 });
    } catch (error) {
      console.error("Error creating invoice:", error);
      setError("Failed to create invoice");
    }
  };

  return (
    <Wrapper>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search by name or ID (Invoices/Exports)"
            className="rounded-xl p-2 bg-gray-100 w-[600px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="flex p-2 rounded-xl bg-blue-300">
            <span className="font-bold px-2">Search</span>
            <Search className="w-5 h-5 mt-0.5" />
          </button>
        </div>

        <h1 className="text-3xl font-bold">Mes factures et Exports</h1>

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
            <div className="col-span-3 alert alert-error">{error}</div>
          ) : paginatedItems.length > 0 ? (
            paginatedItems.map((item, index) => (
              item.type === "invoice" ? (
                <InvoiceComponent key={(item.data as Invoice).id} invoice={item.data as Invoice} index={index} />
              ) : (
                <ExportComponent key={(item.data as DeclarationExport).id} exporte={item.data as DeclarationExport} />
              )
            ))
          ) : (
            <div className="col-span-3 text-center">Aucune facture ou export trouvé</div>
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
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
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

        <dialog id="invoice_modal" className="modal">
          <div className="modal-box">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
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
                <span className="label-text-alt">{invoiceName.length}/60 caractères</span>
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