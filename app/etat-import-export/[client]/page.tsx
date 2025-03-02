/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import Wrapper from "@/components/Wrapper";
import { Search, Printer } from "lucide-react";
import { useParams } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface EtatDeclarationData {
  imports: EtatDeclaration[];
  exports: EtatDeclaration[];
  models: ModelEntry[];
}

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

interface ModelEntry {
  name: string;
  client: string;
  commandes: string;
  commandesWithVariants: { value: string; variants: { name: string; qte_variante: number }[] }[];
}

interface CommandeSummary {
  model: string;
  commande: string;
  quantityTotal: number;
  quantityDelivered: number;
  quantityReceived: number;
}

interface GroupedImportEntry {
  dateImport: string | null;
  numDecImport: string;
  lines: EtatDeclaration[];
}

interface GroupedExportEntry {
  dateExport: string | null;
  numDecExport: string;
  lines: EtatDeclaration[];
}

export default function ClientEtatImportExportPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const email = user?.primaryEmailAddress?.emailAddress;
  const { client } = useParams();
  const clientName = decodeURIComponent(client as string);
  const [etatData, setEtatData] = useState<EtatDeclarationData>({ imports: [], exports: [], models: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  const fetchEtatData = useCallback(async () => {
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
      const data: EtatDeclarationData = await response.json();
      setEtatData({ imports: data.imports || [], exports: data.exports || [], models: data.models || [] });
      console.log("Fetched EtatData:", data);
    } catch (err) {
      setError("Failed to load declaration status");
      console.error(err);
      setEtatData({ imports: [], exports: [], models: [] });
    } finally {
      setLoading(false);
    }
  }, [email, getToken]);

  useEffect(() => {
    if (email) fetchEtatData();
  }, [email, clientName, fetchEtatData]);

  const filteredImports = etatData.imports?.filter((item) => {
    const matchesClient = item.clientImport === clientName;
    const matchesSearch =
      item.commande.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.designation || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModel = selectedModel ? item.modele === selectedModel : true;
    const dateImport = item.dateImport ? new Date(item.dateImport) : null;
    let matchesDate = true;

    if (dateDebut || dateFin) {
      const start = dateDebut ? new Date(dateDebut) : null;
      const end = dateFin ? new Date(dateFin) : null;

      matchesDate =
        (!start || (dateImport && dateImport >= start)) &&
        (!end || (dateImport && dateImport <= end));
    }

    return matchesClient && matchesSearch && matchesModel && matchesDate;
  }) || [];

  const filteredExports = etatData.exports?.filter((item) => {
    const matchesClient = item.clientExport === clientName;
    const matchesSearch =
      item.commande.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.designation || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModel = selectedModel ? item.modele === selectedModel : true;
    const dateExport = item.dateExport ? new Date(item.dateExport) : null;
    let matchesDate = true;

    if (dateDebut || dateFin) {
      const start = dateDebut ? new Date(dateDebut) : null;
      const end = dateFin ? new Date(dateFin) : null;

      matchesDate =
        (!start || (dateExport && dateExport >= start)) &&
        (!end || (dateExport && dateExport <= end));
    }

    return matchesClient && matchesSearch && matchesModel && matchesDate;
  }) || [];

  const groupedImports = filteredImports.reduce((acc, item) => {
    const key = `${item.numDecImport}-${item.dateImport || "null"}`;
    if (!acc[key]) {
      acc[key] = {
        dateImport: item.dateImport,
        numDecImport: item.numDecImport,
        lines: [],
      };
    }
    acc[key].lines.push(item);
    return acc;
  }, {} as Record<string, GroupedImportEntry>);

  const groupedImportsArray = Object.values(groupedImports);

  const groupedExports = filteredExports.reduce((acc, item) => {
    const key = `${item.numDecExport}-${item.dateExport || "null"}`;
    if (!acc[key]) {
      acc[key] = {
        dateExport: item.dateExport,
        numDecExport: item.numDecExport,
        lines: [],
      };
    }
    acc[key].lines.push(item);
    return acc;
  }, {} as Record<string, GroupedExportEntry>);

  const groupedExportsArray = Object.values(groupedExports);

  const allModels = Array.from(
    new Set(
      etatData.models
        .filter((model) => model.client === clientName)
        .map((model) => model.name)
        .filter((name): name is string => name !== null && name !== undefined)
    )
  );

  console.log("All Models for dropdown:", allModels);

  const commandeSummaries: CommandeSummary[] = (etatData.models || [])
    .filter((model) => model.client === clientName)
    .flatMap((model) => {
      const modelImports = filteredImports.filter((item) => item.modele === model.name);
      const modelExports = filteredExports.filter(
        (item) => item.modele === model.name && !item.isExcluded
      );

      return (model.commandesWithVariants || []).map((cmd) => {
        const quantityTotal = cmd.variants.reduce((sum, variant) => sum + (variant.qte_variante || 0), 0);
        const quantityReceived = modelImports
          .filter((item) => item.commande === cmd.value)
          .reduce((sum, item) => sum + (item.quantityTotal || 0), 0);
        const quantityDelivered = modelExports
          .filter((item) => item.commande === cmd.value)
          .reduce((sum, item) => sum + (item.quantityDelivered || 0), 0);

        return {
          model: model.name,
          commande: cmd.value,
          quantityTotal,
          quantityReceived,
          quantityDelivered,
        };
      });
    });

  console.log("Commande Summaries:", commandeSummaries);

  const totalQuantity = commandeSummaries.reduce((sum, cmd) => sum + cmd.quantityTotal, 0);
  const totalDelivered = filteredExports
    .filter((item) => !item.isExcluded)
    .reduce((sum, item) => sum + (item.quantityDelivered || 0), 0);

  const handleDownloadPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    let yOffset = 10;

    pdf.setFontSize(20);
    pdf.text(`État des Déclarations pour ${clientName}`, 10, yOffset);
    yOffset += 12;

    pdf.setFontSize(14);
    pdf.text("Résumé", 10, yOffset);
    yOffset += 6;

    if (commandeSummaries.length > 0) {
      commandeSummaries.forEach((cmd, index) => {
        if (index === 0 || cmd.model !== commandeSummaries[index - 1].model) {
          pdf.setFontSize(12);
          pdf.text(`Modèle: ${cmd.model}`, 10, yOffset);
          yOffset += 6;
        }
        pdf.setFontSize(11);
        pdf.text(
          `Commande ${cmd.commande || "N/A"}: Total ${cmd.quantityTotal} / Livré ${cmd.quantityDelivered} / Reçu ${cmd.quantityReceived}`,
          10,
          yOffset
        );
        yOffset += 6;

        if (yOffset > 270) {
          pdf.addPage();
          yOffset = 10;
        }
      });
    } else {
      pdf.setFontSize(11);
      pdf.text("Aucune commande trouvée pour ce client.", 10, yOffset);
      yOffset += 6;
    }

    pdf.setFontSize(12);
    pdf.text(`Total: ${totalQuantity} / Livré: ${totalDelivered}`, 10, yOffset);
    yOffset += 12;

    if (yOffset > 270) {
      pdf.addPage();
      yOffset = 10;
    }

    pdf.setFontSize(14);
    pdf.text("Importations", 10, yOffset);
    yOffset += 6;

    if (groupedImportsArray.length > 0) {
      autoTable(pdf, {
        startY: yOffset,
        head: [["Date Import", "N° Déclaration", "Modèle", "Commande", "Désignation", "Qté Total"]],
        body: groupedImportsArray.map((group) => [
          group.dateImport ? new Date(group.dateImport).toLocaleDateString() : "N/A",
          group.numDecImport || "N/A",
          group.lines.map((line) => line.modele || "N/A").join("\n"),
          group.lines.map((line) => line.commande || "N/A").join("\n"),
          group.lines.map((line) => line.designation || "N/A").join("\n"),
          group.lines.map((line) => (line.quantityTotal ?? 0).toString()).join("\n"),
        ]),
        theme: "striped",
        styles: { fontSize: 10 },
        margin: { left: 10, right: 10 },
      });
      yOffset = (pdf as any).lastAutoTable.finalY + 12;
    } else {
      pdf.setFontSize(11);
      pdf.text("Aucune importation trouvée.", 10, yOffset);
      yOffset += 6;
    }

    if (yOffset > 270) {
      pdf.addPage();
      yOffset = 10;
    }

    pdf.setFontSize(14);
    pdf.text("Exportations", 10, yOffset);
    yOffset += 6;

    if (groupedExportsArray.length > 0) {
      autoTable(pdf, {
        startY: yOffset,
        head: [["Réparation", "Date Export", "N° Déclaration", "Modèle", "Commande", "Désignation", "Qté Livrée"]],
        body: groupedExportsArray.map((group) => [
          group.lines.map((line) => (line.isExcluded ? "Oui" : "Non")).join("\n"),
          group.dateExport ? new Date(group.dateExport).toLocaleDateString() : "N/A",
          group.numDecExport || "N/A",
          group.lines.map((line) => line.modele).join("\n"),
          group.lines.map((line) => line.commande || "N/A").join("\n"),
          group.lines.map((line) => line.designation || "N/A").join("\n"),
          group.lines.map((line) => (line.quantityDelivered ?? 0).toString()).join("\n"),
        ]),
        theme: "striped",
        styles: { fontSize: 10 },
        margin: { left: 10, right: 10 },
      });
    } else {
      pdf.setFontSize(11);
      pdf.text("Aucune exportation trouvée.", 10, yOffset);
    }

    pdf.save(`Etat_des_Declarations_${clientName}.pdf`);
  };

  return (
    <Wrapper>
      <div className="flex flex-col space-y-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-0">
          <h1 className="text-3xl font-bold text-gray-800">
            État des Déclarations pour {clientName}
          </h1>
          <div className="flex flex-col md:flex-row gap-2">
            <div
              className="border border-gray-300 outline outline-1 outline-gray-200 p-4 rounded-lg bg-white shadow-md w-full max-w-md mt-4 md:mt-0"
            >
              <div className="space-y-2">
                {commandeSummaries.length > 0 ? (
                  commandeSummaries.map((cmd, index) => (
                    <div key={`${cmd.model}-${cmd.commande}`}>
                      {index === 0 || cmd.model !== commandeSummaries[index - 1].model ? (
                        <p className="text-sm text-gray-600 font-semibold mt-2">
                          Modèle: {cmd.model}
                        </p>
                      ) : null}
                      <p className="text-sm text-gray-600">
                        Commande {cmd.commande || "N/A"}: Total <span className="font-medium">{cmd.quantityTotal}</span> / Livré <span className="font-medium">{cmd.quantityDelivered}</span> / Reçu <span className="font-medium">{cmd.quantityReceived}</span>
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-600">Aucune commande trouvée pour ce client.</p>
                )}
                <div className="border-t pt-2 mt-2">
                  <p className="text-sm text-gray-600 font-bold">
                    Total: <span className="font-medium">{totalQuantity}</span> / Livré: <span className="font-medium">{totalDelivered}</span>
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="btn btn-accent mt-4 md:mt-0"
            >
              <Printer className="w-5 h-5 mr-2" />
              Télécharger PDF
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2 w-full max-w-md">
            <input
              type="text"
              placeholder="Rechercher par commande ou désignation"
              className="rounded-xl p-2 bg-gray-100 w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <select
              className="select select-bordered"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              <option value="">Tous les modèles</option>
              {allModels.length > 0 ? (
                allModels.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))
              ) : (
                <option value="" disabled>Aucun modèle trouvé</option>
              )}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="date"
              className="input input-bordered"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
            />
            <span className="text-gray-600">à</span>
            <input
              type="date"
              className="input input-bordered"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
            />
            {(dateDebut || dateFin) && (
              <button
                className="btn btn-sm btn-error"
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
        ) : (filteredImports.length > 0 || filteredExports.length > 0) ? (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Import Table (Left) */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4">Importations</h2>
              <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
                <table className="table w-full">
                  <thead className="bg-blue-600 text-white">
                    <tr><th className="p-4 text-left">Date Import</th><th className="p-4 text-left">N° Déclaration</th><th className="p-4 text-left">Modèle</th><th className="p-4 text-left">Commande</th><th className="p-4 text-left">Désignation</th><th className="p-4 text-left">Qté Total</th></tr>
                  </thead>
                  <tbody>
                    {groupedImportsArray.map((group, groupIndex) => (
                      <tr key={group.numDecImport + groupIndex} className="hover:bg-blue-100 transition-colors">
                        <td className="p-4">
                          {group.dateImport ? new Date(group.dateImport).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="p-4">{group.numDecImport || "N/A"}</td>
                        <td className="p-4">
                          {group.lines.map((line, lineIndex) => (
                            <div key={line.id} className={lineIndex > 0 ? "mt-2" : ""}>
                              {line.modele || "N/A"}
                            </div>
                          ))}
                        </td>
                        <td className="p-4">
                          {group.lines.map((line, lineIndex) => (
                            <div key={line.id} className={lineIndex > 0 ? "mt-2" : ""}>
                              {line.commande || "N/A"}
                            </div>
                          ))}
                        </td>
                        <td className="p-4">
                          {group.lines.map((line, lineIndex) => (
                            <div key={line.id} className={lineIndex > 0 ? "mt-2" : ""}>
                              {line.designation || "N/A"}
                            </div>
                          ))}
                        </td>
                        <td className="p-4">
                          {group.lines.map((line, lineIndex) => (
                            <div key={line.id} className={lineIndex > 0 ? "mt-2" : ""}>
                              {line.quantityTotal ?? 0}
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Export Table (Right) */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4">Exportations</h2>
              <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
                <table className="table w-full">
                  <thead className="bg-blue-600 text-white">
                    <tr><th className="p-4 text-left"></th><th className="p-4 text-left">Date Export</th><th className="p-4 text-left">N° Déclaration</th><th className="p-4 text-left">Modèle</th><th className="p-4 text-left">Commande</th><th className="p-4 text-left">Désignation</th><th className="p-4 text-left">Qté Livrée</th></tr>
                  </thead>
                  <tbody>
                    {groupedExportsArray.map((group, groupIndex) => (
                      <tr key={group.numDecExport + groupIndex} className="hover:bg-blue-100 transition-colors">
                        <td className="p-4">
                          {group.lines.map((line, lineIndex) => (
                            <div key={line.id} className={lineIndex > 0 ? "mt-2" : ""}>
                              <input
                                type="checkbox"
                                checked={line.isExcluded}
                                disabled
                              />
                            </div>
                          ))}
                        </td>
                        <td className="p-4">
                          {group.dateExport ? new Date(group.dateExport).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="p-4">{group.numDecExport || "N/A"}</td>
                        <td className="p-4">
                          {group.lines.map((line, lineIndex) => (
                            <div key={line.id} className={lineIndex > 0 ? "mt-2" : ""}>
                              {line.modele}
                            </div>
                          ))}
                        </td>
                        <td className="p-4">
                          {group.lines.map((line, lineIndex) => (
                            <div key={line.id} className={lineIndex > 0 ? "mt-2" : ""}>
                              {line.commande || "N/A"}
                            </div>
                          ))}
                        </td>
                        <td className="p-4">
                          {group.lines.map((line, lineIndex) => (
                            <div key={line.id} className={lineIndex > 0 ? "mt-2" : ""}>
                              {line.designation || "N/A"}
                            </div>
                          ))}
                        </td>
                        <td className="p-4">
                          {group.lines.map((line, lineIndex) => (
                            <div key={line.id} className={lineIndex > 0 ? "mt-2" : ""}>
                              {line.quantityDelivered ?? 0}
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Aucune donnée trouvée
          </div>
        )}
      </div>
    </Wrapper>
  );
}