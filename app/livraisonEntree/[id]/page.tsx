/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Save, Trash } from "lucide-react";
import { LivraisonEntree } from "@/type";
import Wrapper from "@/components/Wrapper";
import LivraisonEntreeLines from "@/components/LivraisonEntreeLines";
import LivraisonEntreeInfo from "@/components/LivraisonEntreeInfo";
import { useAuth } from "@clerk/nextjs";

export default function LivraisonEntreeDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { getToken } = useAuth();
  const [livraisonEntree, setLivraisonEntree] = useState<LivraisonEntree | null>(null);
  const [initialLivraisonEntree, setInitialLivraisonEntree] = useState<LivraisonEntree | null>(null);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
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
    if (params.id) {
      fetchLivraisonEntree();
    }
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
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update LivraisonEntree");
      }

      await fetchLivraisonEntree();
      if (typeof window !== "undefined" && (window as any).refreshClientModelPage) {
        (window as any).refreshClientModelPage();
      }
    } catch (error) {
      console.error("Error saving LivraisonEntree:", error);
      setErrorMessage("Failed to save LivraisonEntree. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette LivraisonEntree ?");
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

  if (!livraisonEntree) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <span className="font-bold">Chargement de la LivraisonEntree...</span>
      </div>
    );
  }

  return (
    <Wrapper>
      <div>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          <p className="badge badge-ghost badge-lg uppercase">
            <span>L.E-</span>{livraisonEntree.id}
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

            <button
              onClick={handleDelete}
              className="btn btn-sm btn-accent ml-4"
            >
              <Trash className="w-4" />
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="alert alert-error mb-4">{errorMessage}</div>
        )}

        <div className="flex flex-col md:flex-row w-full gap-4">
          {/* Left Side - LivraisonEntree Info */}
          <div className="w-full md:w-1/3">
            <LivraisonEntreeInfo livraisonEntree={livraisonEntree} setLivraisonEntree={setLivraisonEntree} />
          </div>

          {/* Right Side - Models Table */}
          <div className="w-full md:w-2/3">
            <LivraisonEntreeLines livraisonEntree={livraisonEntree} setLivraisonEntree={setLivraisonEntree} />
          </div>
        </div>
      </div>
    </Wrapper>
  );
}