"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Wrapper from "@/components/Wrapper";
import { Search } from "lucide-react";
import { useParams } from "next/navigation";

interface EtatLivraisonDeclaration {
  id: string;
  dateEntree: Date | null;
  numLivraisonEntree: string;
  name: string;
  clientEntree: string;
  modele: string;
  commande: string;
  description: string;
  dateSortie: Date | null;
  numLivraisonSortie: string;
  clientSortie: string;
  quantityDelivered: number;
  quantityTotal: number;
  quantityReçu: number;
}

export default function ModelEtatImportExportLivraisonPage() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const { client, modele } = useParams();
  const clientName = decodeURIComponent(client as string);
  const modelName = decodeURIComponent(modele as string);
  const [etatData, setEtatData] = useState<EtatLivraisonDeclaration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchEtatData = async () => {
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/etat-import-export-livraison?email=${encodeURIComponent(email)}`
      );
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();
      const filteredData = data.filter(
        (item: EtatLivraisonDeclaration) =>
          (item.clientEntree === clientName || item.clientSortie === clientName) &&
          item.modele === modelName
      );
      setEtatData(filteredData);
      console.log("Fetched EtatData (all):", data);
      console.log("Filtered EtatData:", filteredData);
    } catch (err) {
      setError("Failed to load livraison status");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (email) fetchEtatData();
  }, [email, clientName, modelName, refreshTrigger]);

  const filteredData = etatData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.numLivraisonSortie || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.commande.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.modele.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by commande for totals
  const commandeTotals = Array.from(
    new Map(
      filteredData.map((item) => [
        item.commande,
        {
          quantityTotal: Math.max(...filteredData.filter((i) => i.commande === item.commande).map((i) => i.quantityTotal), 0),
          quantityDelivered: filteredData
            .filter((i) => i.commande === item.commande && i.numLivraisonSortie)
            .reduce((sum, i) => sum + i.quantityDelivered, 0),
          quantityReçu: Math.max(...filteredData.filter((i) => i.commande === item.commande).map((i) => i.quantityReçu || 0), 0),
        },
      ])
    ).entries()
  ).map(([commande, totals]) => ({ commande, ...totals }));

  const totalDelivered = filteredData
    .filter((item) => item.numLivraisonSortie)
    .reduce((sum, item) => sum + item.quantityDelivered, 0);
  const totalQuantity = commandeTotals.reduce((sum, cmd) => sum + cmd.quantityTotal, 0);

  const handleExternalRefresh = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    (window as any).refreshEtatLivraisonPage = handleExternalRefresh;
    return () => {
      delete (window as any).refreshEtatLivraisonPage;
    };
  }, []);

  return (
    <Wrapper>
      <div className="flex flex-col space-y-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-0">
          <h1 className="text-3xl font-bold text-gray-800">
            État des Livraisons pour {modelName} ({clientName})
          </h1>
          <div className="border border-gray-300 outline outline-1 outline-gray-200 p-4 rounded-lg bg-white shadow-md w-full max-w-md mt-4 md:mt-0">
            <div className="space-y-2">
              {commandeTotals.map((cmd) => (
                <p key={cmd.commande} className="text-sm text-gray-600">
                  Commande {cmd.commande || "N/A"}: Total <span className="font-medium">{cmd.quantityTotal}</span> / Livré <span className="font-medium">{cmd.quantityDelivered}</span> / Reçu <span className="font-medium">{cmd.quantityReçu}</span>
                </p>
              ))}
              <div className="border-t pt-2 mt-2">
                <p className="text-sm text-gray-600 font-bold">
                  Total: <span className="font-medium">{totalQuantity}</span> / Livré: <span className="font-medium">{totalDelivered}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2 w-full">
          <input
            type="text"
            placeholder="Rechercher par N° Livraison, Commande ou Modèle"
            className="rounded-xl p-2 bg-gray-100 w-full max-w-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center">
            <span className="loading loading-spinner loading-lg text-blue-500"></span>
          </div>
        ) : error ? (
          <div className="alert alert-error text-center">{error}</div>
        ) : filteredData.length > 0 ? (
          <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
            <table className="table w-full">
              <thead className="bg-blue-600 text-white">
                <tr>{/* No whitespace between <th> tags */}
                  <th className="p-4 text-left">Date Entrée</th><th className="p-4 text-left">N° Livraison Entrée</th><th className="p-4 text-left">Quantité Reçu</th><th className="p-4 text-left">Modèle</th><th className="p-4 text-left">Commande</th><th className="p-4 text-left">Description</th><th className="p-4 text-left">Date Sortie</th><th className="p-4 text-left">N° Livraison Sortie</th><th className="p-4 text-left">Qté Livrée</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-100 transition-colors">{/* No whitespace between <td> tags */}
                    <td className="p-4">{item.dateEntree ? new Date(item.dateEntree).toLocaleDateString() : "N/A"}</td><td className="p-4">{item.name || "N/A"}</td><td className="p-4">{item.quantityReçu || "N/A"}</td><td className="p-4 font-medium">{item.modele}</td><td className="p-4">{item.commande || "N/A"}</td><td className="p-4">{item.description || "N/A"}</td><td className="p-4">{item.dateSortie ? new Date(item.dateSortie).toLocaleDateString() : "N/A"}</td><td className="p-4">{item.numLivraisonSortie || "N/A"}</td><td className="p-4">{item.quantityDelivered}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Aucune donnée trouvée pour ce modèle
          </div>
        )}
      </div>
    </Wrapper>
  );
}