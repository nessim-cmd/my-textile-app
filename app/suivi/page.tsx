"use client";

import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import confetti from "canvas-confetti";
import { SuiviProduction } from "@/type";
import Wrapper from "@/components/Wrapper";
import SuiviComponent from "@/components/SuiviComponent";

export default function SuiviPage() {
  const { user } = useUser();
  const [modelName, setModelName] = useState("");
  const [qteTotal, setQteTotal] = useState("");
  const [client, setClient] = useState("");
  const email = user?.primaryEmailAddress?.emailAddress;
  const [suivis, setSuivis] = useState<SuiviProduction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSuivis = async () => {
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/suivi?email=${encodeURIComponent(email)}`);
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      setSuivis(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading suivis:", error);
     
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (email) fetchSuivis();
  }, [email]);

  const filteredSuivis = suivis.filter(suivi =>
    suivi.model_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    suivi.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSuivi = async () => {
    if (!email || !modelName.trim() || !qteTotal || !client.trim()) return;

    try {
      const response = await fetch("/api/suivi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email,
          model_name: modelName.trim(),
          qte_total: parseInt(qteTotal),
          client: client.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create suivi");
      }

      await fetchSuivis();
      setModelName("");
      setQteTotal("");
      setClient("");

      (document.getElementById("suivi_modal") as HTMLDialogElement)?.close();

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 9999,
      });
    } catch (error) {
      console.error("Error creating suivi:", error);
      
    }
  };

  return (
    <Wrapper>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Rechercher par modèle ou client"
            className="rounded-xl p-2 bg-gray-100 w-[600px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="flex p-2 rounded-xl bg-blue-300">
            <Search className="w-5 h-5 mt-0.5" />
          </button>
        </div>

        <h1 className="text-3xl font-bold">Suivi de Production</h1>

        <div className="grid md:grid-cols-3 gap-4">
          <div
            className="cursor-pointer border border-accent rounded-xl flex flex-col justify-center items-center p-5"
            onClick={() => (document.getElementById("suivi_modal") as HTMLDialogElement)?.showModal()}
          >
            <div className="font-bold text-accent">Nouveau Suivi</div>
            <div className="bg-accent-content text-accent rounded-full p-2 mt-2">
              <Plus className="h-6 w-6" />
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
          ) : filteredSuivis.length > 0 ? (
            filteredSuivis.map((suivi) => (
              <SuiviComponent key={suivi.id} suivi={suivi} />
            ))
          ) : (
            <div className="col-span-3 text-center">
              Aucun suivi trouvé
            </div>
          )}
        </div>

        <dialog id="suivi_modal" className="modal">
          <div className="modal-box">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>

            <h3 className="font-bold text-lg mb-4">Nouveau Suivi</h3>

            <div className="form-control space-y-4">
            <input
                type="text"
                placeholder="Client"
                className="input input-bordered w-full"
                value={client}
                onChange={(e) => setClient(e.target.value)}
              />

              <input
                type="text"
                placeholder="Nom du modèle"
                className="input input-bordered w-full"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
              />
              
              <input
                type="number"
                placeholder="Quantité totale"
                className="input input-bordered w-full"
                value={qteTotal}
                onChange={(e) => setQteTotal(e.target.value)}
              />
              
              
            </div>

            <button
              className="btn btn-accent w-full mt-4"
              disabled={!modelName.trim() || !qteTotal || !client.trim()}
              onClick={handleCreateSuivi}
            >
              Créer
            </button>
          </div>
        </dialog>
      </div>
    </Wrapper>
  );
}