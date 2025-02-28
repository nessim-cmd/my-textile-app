"use client";

import { Layers, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import confetti from "canvas-confetti";
import { Livraison } from "@/type";
import Wrapper from "@/components/Wrapper";
import LivraisonComponent from "@/components/LivraisonComponent";

export default function LivraisonPage() {
  const { user } = useUser();
  const [livraisonName, setLivraisonName] = useState("");
  const [isNameValid, setIsNameValid] = useState(true);
  const email = user?.primaryEmailAddress?.emailAddress;
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLivraisons = async () => {
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/livraisons?email=${encodeURIComponent(email)}`);
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      setLivraisons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading livraisons:", error);
      setError("Failed to load livraisons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (email) fetchLivraisons();
  }, [email]);

  const filteredLivraisons = livraisons.filter((livraison) =>
    livraison.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    livraison.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateLivraison = async () => {
    if (!email || !livraisonName.trim()) return;

    try {
      const response = await fetch("/api/livraisons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          name: livraisonName.trim() 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create livraison");
      }

      await fetchLivraisons();
      setLivraisonName("");
      (document.getElementById("livraison_modal") as HTMLDialogElement)?.close();

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 9999,
      });
    } catch (error) {
      console.error("Error creating livraison:", error);
      setError("Failed to create livraison");
    }
  };

  return (
    <Wrapper>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search by name livraison"
            className="rounded-xl p-2 bg-gray-100 w-[600px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="flex p-2 rounded-xl bg-blue-300">
            <span className="font-bold px-2">Search</span>
            <Search className="w-5 h-5 mt-0.5" />
          </button>
        </div>

        <h1 className="text-3xl font-bold">Mes Livraisons</h1>

        <div className="grid md:grid-cols-3 gap-4">
          <div
            className="cursor-pointer border border-accent rounded-xl flex flex-col justify-center items-center p-5"
            onClick={() => (document.getElementById("livraison_modal") as HTMLDialogElement)?.showModal()}
          >
            <div className="font-bold text-accent">Créer une livraison</div>
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
          ) : filteredLivraisons.length > 0 ? (
            filteredLivraisons.map((livraison) => (
              <LivraisonComponent key={livraison.id} livraison={livraison} index={0} />
            ))
          ) : (
            <div className="col-span-3 text-center">Aucune livraison trouvée</div>
          )}
        </div>

        <dialog id="livraison_modal" className="modal">
          <div className="modal-box">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>

            <h3 className="font-bold text-lg mb-4">Nouvelle Livraison</h3>

            <div className="form-control">
              <input
                type="text"
                placeholder="Nom de la livraison (max 60 caractères)"
                className="input input-bordered w-full"
                value={livraisonName}
                onChange={(e) => {
                  setLivraisonName(e.target.value);
                  setIsNameValid(e.target.value.length <= 60);
                }}
                maxLength={60}
              />
              <label className="label">
                <span className="label-text-alt">
                  {livraisonName.length}/60 caractères
                </span>
              </label>
            </div>

            <button
              className="btn btn-accent w-full mt-4"
              disabled={!isNameValid || !livraisonName.trim()}
              onClick={handleCreateLivraison}
            >
              Créer
            </button>
          </div>
        </dialog>
      </div>
    </Wrapper>
  );
}