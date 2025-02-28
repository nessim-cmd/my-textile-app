"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Wrapper from "@/components/Wrapper";
import { Search } from "lucide-react";
import { useParams } from "next/navigation";

interface EtatDeclaration {
  id: string;
  dateImport: Date;
  numDecImport: string;
  valeurImport: number;
  clientImport: string;
  modele: string;
  commande: string;
  designation: string;
  dateExport: Date | null;
  numDecExport: string;
  clientExport: string;
  valeurExport: number;
  quantityDelivered: number;
  quantityTotal: number;
}

export default function ModelEtatImportExportPage() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const { client, modele } = useParams();
  const clientName = decodeURIComponent(client as string);
  const modelName = decodeURIComponent(modele as string);
  const [etatData, setEtatData] = useState<EtatDeclaration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchEtatData = async () => {
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/etat-import-export?email=${encodeURIComponent(email)}`
      );
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();
      const filteredData = data.filter(
        (item: EtatDeclaration) =>
          (item.clientExport || item.clientImport) === clientName &&
          item.modele === modelName
      );
      setEtatData(filteredData);
    } catch (err) {
      setError("Failed to load import/export status");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (email) fetchEtatData();
  }, [email, clientName, modelName]);

  const filteredData = etatData.filter(
    (item) =>
      item.numDecImport.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.numDecExport || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.commande.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by commande for totals
  const commandeTotals = Array.from(
    new Map(
      filteredData.map((item) => [
        item.commande,
        {
          quantityTotal: Math.max(
            ...filteredData.filter((i) => i.commande === item.commande).map((i) => i.quantityTotal),
            0
          ),
          quantityDelivered: filteredData
            .filter((i) => i.commande === item.commande && i.numDecExport)
            .reduce((sum, i) => sum + i.quantityDelivered, 0),
        },
      ])
    ).entries()
  ).map(([commande, totals]) => ({ commande, ...totals }));

  const totalDelivered = filteredData
    .filter((item) => item.numDecExport)
    .reduce((sum, item) => sum + item.quantityDelivered, 0);
  const totalQuantity = commandeTotals.reduce((sum, cmd) => sum + cmd.quantityTotal, 0);

  return (
    <Wrapper>
      <div className="flex flex-col space-y-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-gray-800">
            État des Déclarations pour {modelName} ({clientName})
          </h1>
          <div className="border border-gray-300 outline outline-1 outline-gray-200 p-4 rounded-lg bg-white shadow-md w-full max-w-md mt-4 md:mt-0">
            <div className="space-y-2">
              {commandeTotals.map((cmd) => (
                <p key={cmd.commande} className="text-sm text-gray-600">
                  Commande {cmd.commande || "N/A"}: Total <span className="font-medium">{cmd.quantityTotal}</span> / Livré <span className="font-medium">{cmd.quantityDelivered}</span>
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

        <div className="flex items-center justify-center space-x-2">
          <input
            type="text"
            placeholder="Rechercher par N° DEC ou Commande"
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
                <tr>
                  <th className="p-4 text-left">Date Import</th>
                  <th className="p-4 text-left">N° DEC Import</th>
                  <th className="p-4 text-left">Valeur (€)</th>
                  <th className="p-4 text-left">Modèle</th>
                  <th className="p-4 text-left">Commande</th>
                  <th className="p-4 text-left">Désignation</th>
                  <th className="p-4 text-left">Date Export</th>
                  <th className="p-4 text-left">N° DEC Export</th>
                  <th className="p-4 text-left">Valeur (€)</th>
                  <th className="p-4 text-left">Qté Livrée</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-100 transition-colors`}
                  >
                    <td className="p-4">{new Date(item.dateImport).toLocaleDateString()}</td>
                    <td className="p-4">{item.numDecImport}</td>
                    <td className="p-4">{item.valeurImport.toFixed(2)}</td>
                    <td className="p-4 font-medium">{item.modele}</td>
                    <td className="p-4">{item.commande || "N/A"}</td>
                    <td className="p-4">{item.designation || "N/A"}</td>
                    <td className="p-4">{item.dateExport ? new Date(item.dateExport).toLocaleDateString() : "Non exporté"}</td>
                    <td className="p-4">{item.numDecExport || "N/A"}</td>
                    <td className="p-4">{item.valeurExport.toFixed(2)}</td>
                    <td className="p-4">{item.quantityDelivered}</td>
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