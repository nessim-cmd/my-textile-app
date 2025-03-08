"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import Wrapper from "@/components/Wrapper";
import ClientManqueList from "@/components/ClientManqueList";
import { DeclarationImport, LivraisonEntree } from "@/type";

interface ManqueData {
  declarations: DeclarationImport[];
  livraisons: LivraisonEntree[];
}

export default function ListeManquePage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const email = user?.primaryEmailAddress?.emailAddress;
  const [manqueData, setManqueData] = useState<ManqueData>({ declarations: [], livraisons: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchManqueData = useCallback(async () => {
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch(`/api/liste-manque?email=${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      setManqueData(data);
    } catch (error) {
      console.error("Error loading manque data:", error);
      setError("Failed to load missing items");
    } finally {
      setLoading(false);
    }
  }, [email, getToken]);

  useEffect(() => {
    if (email) fetchManqueData();
  }, [email, fetchManqueData]);

  // Group data by client
  const groupedByClient = manqueData.declarations.reduce((acc, declaration) => {
    const clientName = declaration.client || "Unknown Client"; // DeclarationImport uses client directly
    if (!acc[clientName]) {
      acc[clientName] = { declarations: [], livraisons: [] };
    }
    acc[clientName].declarations.push(declaration);
    return acc;
  }, {} as Record<string, { declarations: DeclarationImport[]; livraisons: LivraisonEntree[] }>);

  manqueData.livraisons.forEach(livraison => {
    const clientName = livraison.client?.name || livraison.clientName || "Unknown Client";
    if (!groupedByClient[clientName]) {
      groupedByClient[clientName] = { declarations: [], livraisons: [] };
    }
    groupedByClient[clientName].livraisons.push(livraison);
  });

  return (
    <Wrapper>
      <div className="flex flex-col space-y-6">
        <h1 className="text-3xl font-bold">Liste des Manques</h1>

        {loading ? (
          <div className="text-center">
            <span className="loading loading-dots loading-lg"></span>
          </div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : Object.keys(groupedByClient).length > 0 ? (
          Object.entries(groupedByClient).map(([clientName, data]) => (
            <ClientManqueList key={clientName} clientName={clientName} data={data} />
          ))
        ) : (
          <div className="text-center">Aucun manque trouvé</div>
        )}
      </div>
    </Wrapper>
  );
}