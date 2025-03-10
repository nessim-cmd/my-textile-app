"use client";

import LivraisonEntreeInfo from "@/components/LivraisonEntreeInfo";
import LivraisonEntreeLines from "@/components/LivraisonEntreeLines";
import Wrapper from "@/components/Wrapper";
import { LivraisonEntree } from "@/type";
import { Save, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

export default function LivraisonEntreePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { getToken } = useAuth();
  const [livraisonEntree, setLivraisonEntree] = useState<LivraisonEntree | null>(null);
  const [initialLivraisonEntree, setInitialLivraisonEntree] = useState<LivraisonEntree | null>(null);
  const [, setIsSaveDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchLivraisonEntree = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/livraisonEntree/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch LivraisonEntree");
      const data = await response.json();
      setLivraisonEntree(data);
      setInitialLivraisonEntree(data);
    } catch (error) {
      console.error("Error fetching LivraisonEntree:", error);
      setErrorMessage("Failed to fetch LivraisonEntree. Please try again.");
    }
  };

  useEffect(() => {
    if (params.id) fetchLivraisonEntree();
  }, [params.id]);

  useEffect(() => {
    setIsSaveDisabled(JSON.stringify(livraisonEntree) === JSON.stringify(initialLivraisonEntree));
  }, [livraisonEntree, initialLivraisonEntree]);

  const handleSave = async () => {
    if (!livraisonEntree) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const token = await getToken();
      const response = await fetch(`/api/livraisonEntree/${livraisonEntree.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(livraisonEntree),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update LivraisonEntree");
      }

      await fetchLivraisonEntree();

      if (window.refreshClientModelPage) {
        window.refreshClientModelPage();
      }
      if (window.refreshEtatLivraisonPage) {
        window.refreshEtatLivraisonPage();
      }
    } catch (error) {
      console.error("Error saving LivraisonEntree:", error);
      setErrorMessage("Failed to save LivraisonEntree. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette livraison Entree ?");
    if (confirmed && livraisonEntree?.id) {
      try {
        const token = await getToken();
        await fetch(`/api/livraisonEntree/${livraisonEntree.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        router.push("/livraisonEntree");
      } catch (error) {
        console.error("Error deleting LivraisonEntree:", error);
        setErrorMessage("Failed to delete LivraisonEntree. Please try again.");
      }
    }
  };

  if (!livraisonEntree)
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <span className="font-bold">Chargement de la livraison...</span>
      </div>
    );

  return (
    <Wrapper>
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          <div className="flex items-center space-x-2">
            <p className="badge badge-ghost badge-lg uppercase">
              <span>LivraisonEntree-</span>
              {livraisonEntree.id}
            </p>
          </div>
          <div className="flex mt-2 md:mt-0">
            <button
              className="btn btn-sm btn-accent ml-4"
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
            <button onClick={handleDelete} className="btn btn-sm btn-accent ml-4">
              <Trash className="w-4" />
            </button>
          </div>
        </div>

        <div className="w-[500]">
          <LivraisonEntreeInfo livraisonEntree={livraisonEntree} setLivraisonEntree={setLivraisonEntree} />
        </div>

        {errorMessage && (
          <div className="alert alert-error mb-4">{errorMessage}</div>
        )}

        <div className="w-full">
          <LivraisonEntreeLines livraisonEntree={livraisonEntree} setLivraisonEntree={setLivraisonEntree} />
        </div>
      </div>
    </Wrapper>
  );
}