"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Save, Trash } from "lucide-react";
import { Livraison } from "@/type";
import Wrapper from "@/components/Wrapper";
import LivraisonInfo from "@/components/LivraisonInfo";
import LivraisonLines from "@/components/LivraisonLines";
import LivraisonPDF from "@/components/LivraisonPDF";

interface ClientModel {
  id: string;
  name: string;
  clientId: string;
}

export default function LivraisonPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [livraison, setLivraison] = useState<Livraison | null>(null);
  const [initialLivraison, setInitialLivraison] = useState<Livraison | null>(null);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [clientModels, setClientModels] = useState<ClientModel[]>([]);

  const fetchLivraison = async () => {
    try {
      const response = await fetch(`/api/livraisons/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch livraison");
      const data = await response.json();
      setLivraison(data);
      setInitialLivraison(data);
    } catch (error) {
      console.error("Error fetching livraison:", error);
    }
  };

  useEffect(() => {
    if (params.id) fetchLivraison();
  }, [params.id]);

  useEffect(() => {
    setIsSaveDisabled(JSON.stringify(livraison) === JSON.stringify(initialLivraison));
  }, [livraison, initialLivraison]);

  const handleSave = async () => {
    if (!livraison) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/livraisons/${livraison.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(livraison),
      });

      if (!response.ok) throw new Error("Failed to update livraison");

      const updatedResponse = await fetch(`/api/livraisons/${livraison.id}`);
      const updatedLivraison = await updatedResponse.json();
      setLivraison(updatedLivraison);
      setInitialLivraison(updatedLivraison);
    } catch (error) {
      console.error("Error saving livraison:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette livraison ?");
    if (confirmed && livraison?.id) {
      try {
        await fetch(`/api/livraisons/${livraison.id}`, { method: "DELETE" });
        router.push("/livraison");
      } catch (error) {
        console.error("Error deleting livraison:", error);
      }
    }
  };

  if (!livraison)
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <span className="font-bold">Chargement de la livraison...</span>
      </div>
    );

  return (
    <Wrapper>
      <div>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          <p className="badge badge-ghost badge-lg uppercase">
            <span>Livraison-</span>
            {livraison.id}
          </p>

          <div className="flex md:mt-0 mt-4">
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
            <LivraisonInfo 
              livraison={livraison} 
              setLivraison={setLivraison} 
              onModelsChange={setClientModels}
            />
          </div>

          <div className="flex w-full md:w-2/3 flex-col md:ml-4">
            <LivraisonLines 
              livraison={livraison} 
              setLivraison={setLivraison} 
              clientModels={clientModels}
            />
            <LivraisonPDF livraison={livraison} />
          </div>
        </div>
      </div>
    </Wrapper>
  );
}