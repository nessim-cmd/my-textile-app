"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Wrapper from "@/components/Wrapper";
import Link from "next/link";

interface EtatDeclaration {
  id: string;
  dateImport: string | null;
  numDecImport: string;
  valeurImport: number;
  clientImport: string;
  modele: string;
  commande: string;
  designation: string;
  dateExport: string | null;
  numDecExport: string;
  clientExport: string;
  valeurExport: number;
  quantityDelivered: number;
  quantityTotal: number;
  isExcluded?: boolean;
}

const ClientComponent: React.FC<{ clientName: string }> = ({ clientName }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex justify-between items-center">
    <h2 className="text-xl font-semibold text-gray-800">{clientName}</h2>
    <Link href={`/etat-import-export/${encodeURIComponent(clientName)}`}>
      <button className="btn btn-sm btn-accent">Détails</button>
    </Link>
  </div>
);

export default function EtatDeclarationImportExportPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const email = user?.primaryEmailAddress?.emailAddress;
  const [etatData, setEtatData] = useState<{ imports: EtatDeclaration[]; exports: EtatDeclaration[] }>({ imports: [], exports: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEtatData = async () => {
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch(
        `/api/etat-import-export?email=${encodeURIComponent(email)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();
      setEtatData({ imports: data.imports || [], exports: data.exports || [] });
    } catch (err) {
      setError("Failed to load import/export status");
      console.error(err);
      setEtatData({ imports: [], exports: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (email) fetchEtatData();
  }, [email]);

  const clients = Array.from(
    new Set(
      etatData.imports.concat(etatData.exports).map((item) => item.clientExport || item.clientImport || "N/A")
    )
  ).filter((client) => client !== "N/A");

  return (
    <Wrapper>
      <div className="flex flex-col space-y-6 py-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          État des Déclarations Import/Export par Client
        </h1>

        {loading ? (
          <div className="text-center">
            <span className="loading loading-spinner loading-lg text-blue-500"></span>
          </div>
        ) : error ? (
          <div className="alert alert-error text-center">{error}</div>
        ) : clients.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((clientName) => (
              <ClientComponent key={clientName} clientName={clientName} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Aucun client trouvé
          </div>
        )}
      </div>
    </Wrapper>
  );
}