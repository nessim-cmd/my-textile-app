"use client";

import { Layers, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useUser, useAuth } from "@clerk/nextjs"; // Added useAuth
import confetti from "canvas-confetti";
import { Commande } from "@/type";
import Wrapper from "@/components/Wrapper";
import CommandeComponent from "@/components/CommandeComponents";

export default function Home() {
  const { user } = useUser();
  const { getToken } = useAuth(); // Added for authentication
  const [commandeName, setCommandeName] = useState("");
  const [isNameValid, setIsNameValid] = useState(true);
  const email = user?.primaryEmailAddress?.emailAddress;
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchCommandes = useCallback(async () => {
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch(`/api/commande?email=${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      console.log('Fetched commandes:', data); // Debug log
      setCommandes(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Error loading commandes:", err);
      setError(errorMessage || "Failed to load commandes");
    } finally {
      setLoading(false);
    }
  }, [email, getToken]);

  useEffect(() => {
    if (email) fetchCommandes();
  }, [email, fetchCommandes]);

  const filteredCommandes = commandes.filter(commande =>
    commande.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    commande.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredCommandes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedCommandes = filteredCommandes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreateCommande = async () => {
    if (!email || !commandeName.trim()) return;

    try {
      const token = await getToken();
      const response = await fetch("/api/commande", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          email, 
          name: commandeName.trim() 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create commande");
      }

      await fetchCommandes();
      setCommandeName("");
      (document.getElementById("commande_modal") as HTMLDialogElement)?.close();

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 9999,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Error creating commande:", err);
      alert(errorMessage || "Failed to create commande");
    }
  };

  return (
    <Wrapper>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search by name commande"
            className="rounded-xl p-2 bg-gray-100 w-[600px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="flex p-2 rounded-xl bg-blue-300">
            <span className="font-bold px-2">Search</span>
            <Search className="w-5 h-5 mt-0.5" />
          </button>
        </div>

        <h1 className="text-3xl font-bold">Mes Commandes</h1>

        <div className="grid md:grid-cols-3 gap-4">
          <div
            className="cursor-pointer border border-accent rounded-xl flex flex-col justify-center items-center p-5"
            onClick={() => (document.getElementById("commande_modal") as HTMLDialogElement)?.showModal()}
          >
            <div className="font-bold text-accent">Créer une commande</div>
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
          ) : paginatedCommandes.length > 0 ? (
            paginatedCommandes.map((commande) => (
              <CommandeComponent key={commande.id} commande={commande} index={0} />
            ))
          ) : (
            <div className="col-span-3 text-center">Aucune commande trouvée</div>
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

        <dialog id="commande_modal" className="modal">
          <div className="modal-box">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>

            <h3 className="font-bold text-lg mb-4">Nouvelle Commande</h3>

            <div className="form-control">
              <input
                type="text"
                placeholder="Nom de la commande (max 60 caractères)"
                className="input input-bordered w-full"
                value={commandeName}
                onChange={(e) => {
                  setCommandeName(e.target.value);
                  setIsNameValid(e.target.value.length <= 60);
                }}
                maxLength={60}
              />
              <label className="label">
                <span className="label-text-alt">{commandeName.length}/60 caractères</span>
              </label>
            </div>

            <button
              className="btn btn-accent w-full mt-4"
              disabled={!isNameValid || !commandeName.trim()}
              onClick={handleCreateCommande}
            >
              Créer
            </button>
          </div>
        </dialog>
      </div>
    </Wrapper>
  );
}