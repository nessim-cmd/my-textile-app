"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Wrapper from "@/components/Wrapper";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Search } from "lucide-react";

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

const ModelComponent: React.FC<{
  modele: string;
  quantityDelivered: number;
  quantityTotal: number;
  clientName: string;
}> = ({ modele, quantityDelivered, quantityTotal, clientName }) => {
  const progress = quantityTotal > 0 ? (quantityDelivered / quantityTotal) * 100 : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{modele}</h3>
          <p className="text-sm text-gray-500">
            Livré: {quantityDelivered} / {quantityTotal}
          </p>
        </div>
        <Link
          href={`/etat-import-export/${encodeURIComponent(clientName)}/${encodeURIComponent(modele)}`}
        >
          <button className="btn btn-sm btn-accent">Détails</button>
        </Link>
      </div>
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default function ClientEtatImportExportPage() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const { client } = useParams();
  const clientName = decodeURIComponent(client as string);
  const [etatData, setEtatData] = useState<EtatDeclaration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

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
          (item.clientExport || item.clientImport) === clientName
      );
      setEtatData(filteredData);
      console.log("Fetched EtatData:", filteredData);
    } catch (err) {
      setError("Failed to load import/export status");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (email) fetchEtatData();
  }, [email, clientName]);

  // Filter data by search term and date range
  const filteredData = etatData.filter((item) => {
    const matchesSearch = item.modele
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const dateImport = new Date(item.dateImport);
    const dateExport = item.dateExport ? new Date(item.dateExport) : null;
    let matchesDate = true;

    if (dateDebut || dateFin) {
      const start = dateDebut ? new Date(dateDebut) : null;
      const end = dateFin ? new Date(dateFin) : null;

      matchesDate =
        (!start || dateImport >= start) &&
        (!end || dateImport <= end) &&
        (!dateExport || ((!start || dateExport >= start) && (!end || dateExport <= end)));
    }

    return matchesSearch && matchesDate;
  });

  // Group filtered data by model for the cards and stats
  const uniqueModels = Array.from(new Set(filteredData.map((item) => item.modele))).map(
    (modele) => {
      const items = filteredData.filter((item) => item.modele === modele);
      const quantityDelivered = items
        .filter((item) => item.numDecExport) // Only export rows
        .reduce((sum, item) => sum + item.quantityDelivered, 0);
      const quantityTotal = Math.max(...items.map((item) => item.quantityTotal), 0);
      return { modele, quantityDelivered, quantityTotal };
    }
  );

  // Calculate Import stats based on unique models without repeating valeurImport
  const importStats = uniqueModels.reduce(
    (acc, model) => {
      const importItems = filteredData.filter(
        (item) => item.modele === model.modele && item.numDecImport && !item.numDecExport
      );
      // Take the first valeurImport for this model to avoid repetition
      const valeurImport = importItems.length > 0 ? importItems[0].valeurImport : 0;
      return {
        qteTotal: acc.qteTotal + model.quantityTotal,
        valeurTotal: acc.valeurTotal + valeurImport,
      };
    },
    { qteTotal: 0, valeurTotal: 0 }
  );
  const importValuePerQty = importStats.qteTotal > 0 ? importStats.valeurTotal / importStats.qteTotal : 0;

  // Calculate Export stats based on unique models
  const exportStats = uniqueModels.reduce(
    (acc, model) => {
      const exportItems = filteredData.filter(
        (item) => item.modele === model.modele && item.numDecExport
      );
      const valeurTotal = exportItems.reduce(
        (sum, item) => sum + item.valeurExport,
        0
      );
      return {
        qteTotal: acc.qteTotal + model.quantityDelivered,
        valeurTotal: acc.valeurTotal + valeurTotal,
      };
    },
    { qteTotal: 0, valeurTotal: 0 }
  );
  const exportValuePerQty = exportStats.qteTotal > 0 ? exportStats.valeurTotal / exportStats.qteTotal : 0;

  return (
    <Wrapper>
      <div className="flex flex-col space-y-4 py-4">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Modèles pour {clientName}
        </h1>

        {/* Divs on the Same Line */}
        <div className="flex flex-row gap-4">
          {/* Export Div */}
          <div className="border border-gray-300 outline outline-1 outline-gray-200 p-4 rounded-lg bg-white shadow-md flex-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Export</h2>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                Qté Total: <span className="font-medium">{exportStats.qteTotal}</span>
              </p>
              <p className="text-sm text-gray-600">
                Valeur Total: <span className="font-medium">{exportStats.valeurTotal.toFixed(2)} €</span>
              </p>
              <p className="text-sm text-gray-600">
                Valeur/Qté: <span className="font-medium">{exportValuePerQty.toFixed(2)} €</span>
              </p>
            </div>
          </div>

          {/* Import Div */}
          <div className="border border-gray-300 outline outline-1 outline-gray-200 p-4 rounded-lg bg-white shadow-md flex-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Import</h2>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                Qté Total: <span className="font-medium">{importStats.qteTotal}</span>
              </p>
              <p className="text-sm text-gray-600">
                Valeur Total: <span className="font-medium">{importStats.valeurTotal.toFixed(2)} €</span>
              </p>
              <p className="text-sm text-gray-600">
                Valeur/Qté: <span className="font-medium">{importValuePerQty.toFixed(2)} €</span>
              </p>
            </div>
          </div>
        </div>

        {/* Search and Date Filters - Stack on Phone */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 w-full max-w-md">
            <input
              type="text"
              placeholder="Rechercher par modèle"
              className="rounded-xl p-2 bg-gray-100 w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
            <input
              type="date"
              className="input input-bordered w-full md:w-auto"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
            />
            <span className="text-gray-600 hidden md:inline">à</span>
            <input
              type="date"
              className="input input-bordered w-full md:w-auto"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
            />
            {(dateDebut || dateFin) && (
              <button
                className="btn btn-sm btn-error w-full md:w-auto"
                onClick={() => {
                  setDateDebut("");
                  setDateFin("");
                }}
              >
                Effacer
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center">
            <span className="loading loading-spinner loading-lg text-blue-500"></span>
          </div>
        ) : error ? (
          <div className="alert alert-error text-center">{error}</div>
        ) : uniqueModels.length > 0 ? (
          <div className="space-y-6">
            {/* Model Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {uniqueModels.map((model) => (
                <ModelComponent
                  key={model.modele}
                  modele={model.modele}
                  quantityDelivered={model.quantityDelivered}
                  quantityTotal={model.quantityTotal}
                  clientName={clientName}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Aucun modèle trouvé pour ce client
          </div>
        )}
      </div>
    </Wrapper>
  );
}