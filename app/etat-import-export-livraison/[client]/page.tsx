/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import Wrapper from "@/components/Wrapper";
import { Search, Printer, ChevronDown } from "lucide-react";
import { useParams } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import React from "react";

interface EtatLivraisonData {
  imports: ImportEntry[];
  exports: ExportEntry[];
  models: ModelEntry[];
}

interface ImportEntry {
  id: string;
  dateEntree: string | null;
  numLivraisonEntree: string;
  clientEntree: string;
  modele: string;
  commande: string;
  description: string;
  quantityReçu: number;
}

interface ExportEntry {
  id: string;
  dateSortie: string | null;
  numLivraisonSortie: string;
  clientSortie: string;
  modele: string;
  commande: string;
  description: string;
  quantityDelivered: number;
  isExcluded: boolean;
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
  quantityReçu: number;
}

interface GroupedImportEntry {
  dateEntree: string | null;
  numLivraisonEntree: string;
  lines: ImportEntry[];
}

interface GroupedExportEntry {
  dateSortie: string | null;
  numLivraisonSortie: string;
  lines: ExportEntry[];
}

export default function ClientEtatImportExportLivraisonPage() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const { client } = useParams();
  const clientName = decodeURIComponent(client as string);
  const [etatData, setEtatData] = useState<EtatLivraisonData>({ imports: [], exports: [], models: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fetchEtatData = useCallback(async () => {
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/etat-import-export-livraison?email=${encodeURIComponent(email)}`
      );
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data: EtatLivraisonData = await response.json();
      setEtatData(data);
      console.log("Fetched EtatData:", data);
    } catch (err) {
      setError("Failed to load livraison status");
      console.error(err);
      setEtatData({ imports: [], exports: [], models: [] });
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    if (email) fetchEtatData();
  }, [email, clientName, fetchEtatData]);

  const filteredImports = etatData?.imports?.filter((item) => {
    const matchesClient = item.clientEntree === clientName;
    const matchesSearch =
      item.commande.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModel = selectedModels.length > 0
      ? selectedModels.some(m => 
          m.toLowerCase() === item.modele.toLowerCase() || 
          (item.description || "").toLowerCase().includes(m.toLowerCase())
        )
      : true;
    const dateEntree = item.dateEntree ? new Date(item.dateEntree) : null;
    let matchesDate: boolean = true;

    if (dateDebut || dateFin) {
      const start = dateDebut ? new Date(dateDebut) : null;
      const end = dateFin ? new Date(dateFin) : null;

      matchesDate =
        (!start || (dateEntree !== null && dateEntree >= start)) &&
        (!end || (dateEntree !== null && dateEntree <= end));
    }

    return matchesClient && matchesSearch && matchesModel && matchesDate;
  }) || [];

  const filteredExports = etatData?.exports?.filter((item) => {
    const matchesClient = item.clientSortie === clientName;
    const matchesSearch =
      item.commande.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModel = selectedModels.length > 0
      ? selectedModels.some(m => m.toLowerCase() === item.modele.toLowerCase())
      : true;
    const dateSortie = item.dateSortie ? new Date(item.dateSortie) : null;
    let matchesDate: boolean = true;

    if (dateDebut || dateFin) {
      const start = dateDebut ? new Date(dateDebut) : null;
      const end = dateFin ? new Date(dateFin) : null;

      matchesDate =
        (!start || (dateSortie !== null && dateSortie >= start)) &&
        (!end || (dateSortie !== null && dateSortie <= end));
    }

    return matchesClient && matchesSearch && matchesModel && matchesDate;
  }) || [];

  console.log("Filtered Imports:", filteredImports);
  console.log("Filtered Exports:", filteredExports);

  const groupedImports = filteredImports.reduce((acc, item) => {
    const key = `${item.numLivraisonEntree}-${item.dateEntree || 'null'}`;
    if (!acc[key]) {
      acc[key] = {
        dateEntree: item.dateEntree,
        numLivraisonEntree: item.numLivraisonEntree,
        lines: [],
      };
    }
    acc[key].lines.push(item);
    return acc;
  }, {} as Record<string, GroupedImportEntry>);

  const groupedImportsArray = Object.values(groupedImports);
  console.log("Grouped Imports Array:", groupedImportsArray);

  const groupedExports = filteredExports.reduce((acc, item) => {
    const key = `${item.numLivraisonSortie}-${item.dateSortie || 'null'}`;
    if (!acc[key]) {
      acc[key] = {
        dateSortie: item.dateSortie,
        numLivraisonSortie: item.numLivraisonSortie,
        lines: [],
      };
    }
    acc[key].lines.push(item);
    return acc;
  }, {} as Record<string, GroupedExportEntry>);

  const groupedExportsArray = Object.values(groupedExports);
  console.log("Grouped Exports Array:", groupedExportsArray);

  const allModels = Array.from(
    new Set(
      etatData?.models
        ?.filter((model) => model.client === clientName)
        .map((model) => model.name) || []
    )
  );

  console.log("All Models for dropdown:", allModels);

  const commandeSummaries: CommandeSummary[] = (etatData?.models || [])
    .filter((model) => model.client === clientName && (selectedModels.length === 0 || selectedModels.includes(model.name)))
    .flatMap((model) => {
      const modelImports = filteredImports.filter((item) => item.modele === model.name);
      const modelExports = filteredExports.filter(
        (item) => item.modele === model.name && !item.isExcluded
      );

      return (model.commandesWithVariants || []).map((cmd) => {
        const quantityTotal = cmd.variants.reduce((sum, variant) => sum + (variant.qte_variante || 0), 0);
        const quantityReçu = modelImports
          .filter((item) => item.commande === cmd.value)
          .reduce((sum, item) => sum + item.quantityReçu, 0);
        const quantityDelivered = modelExports
          .filter((item) => item.commande === cmd.value)
          .reduce((sum, item) => sum + item.quantityDelivered, 0);

        return {
          model: model.name,
          commande: cmd.value,
          quantityTotal,
          quantityReçu,
          quantityDelivered,
        };
      });
    });

  console.log("Commande Summaries:", commandeSummaries);

  const totalQuantity = commandeSummaries.reduce((sum, cmd) => sum + cmd.quantityTotal, 0);
  const totalDelivered = filteredExports
    .filter((item) => !item.isExcluded && (selectedModels.length === 0 || selectedModels.includes(item.modele)))
    .reduce((sum, item) => sum + item.quantityDelivered, 0);

  const handleDownloadPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    let yOffset = 10;

    pdf.setFontSize(20);
    pdf.text(`État des Livraisons pour ${clientName}`, 10, yOffset);
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
          `Commande ${cmd.commande || "N/A"}: Total ${cmd.quantityTotal} / Livré ${cmd.quantityDelivered} / Reçu ${cmd.quantityReçu}`,
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
        head: [["Date Import", "N° Livraison", "Modèle", "Commande", "Description", "Qté Reçu"]],
        body: groupedImportsArray.flatMap((group) =>
          group.lines.map((line, index) => [
            index === 0 ? (group.dateEntree ? new Date(group.dateEntree).toLocaleDateString() : "N/A") : "",
            index === 0 ? (group.numLivraisonEntree || "N/A") : "",
            line.modele || "N/A",
            line.commande || "N/A",
            line.description || "N/A",
            line.quantityReçu.toString(),
          ])
        ),
        theme: "striped",
        styles: { fontSize: 10 },
        margin: { left: 10, right: 10 },
        didDrawCell: (data) => {
          if (data.row.index > 0 && data.row.index < groupedImportsArray.flatMap(g => g.lines).length) {
            const prevLine = groupedImportsArray.flatMap(g => g.lines)[data.row.index - 1];
            const currentLine = groupedImportsArray.flatMap(g => g.lines)[data.row.index];
            if (prevLine.numLivraisonEntree !== currentLine.numLivraisonEntree) {
              pdf.setDrawColor(200, 200, 200);
              pdf.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y);
            }
          }
        },
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
        head: [["Exclu", "Date Export", "N° Livraison", "Modèle", "Commande", "Description", "Qté Livrée"]],
        body: groupedExportsArray.flatMap((group) =>
          group.lines.map((line, index) => [
            line.isExcluded ? "Oui" : "Non",
            index === 0 ? (group.dateSortie ? new Date(group.dateSortie).toLocaleDateString() : "N/A") : "",
            index === 0 ? (group.numLivraisonSortie || "N/A") : "",
            line.modele,
            line.commande || "N/A",
            line.description || "N/A",
            line.quantityDelivered.toString(),
          ])
        ),
        theme: "striped",
        styles: { fontSize: 10 },
        margin: { left: 10, right: 10 },
        didDrawCell: (data) => {
          if (data.row.index > 0 && data.row.index < groupedExportsArray.flatMap(g => g.lines).length) {
            const prevLine = groupedExportsArray.flatMap(g => g.lines)[data.row.index - 1];
            const currentLine = groupedExportsArray.flatMap(g => g.lines)[data.row.index];
            if (prevLine.numLivraisonSortie !== currentLine.numLivraisonSortie) {
              pdf.setDrawColor(200, 200, 200);
              pdf.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y);
            }
          }
        },
      });
    } else {
      pdf.setFontSize(11);
      pdf.text("Aucune exportation trouvée.", 10, yOffset);
    }

    pdf.save(`Etat_des_Livraisons_${clientName}.pdf`);
  };

  const toggleModelSelection = (model: string) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    );
  };

  return (
    <Wrapper>
      <div className="flex flex-col space-y-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-0">
          <h1 className="text-3xl font-bold text-gray-800 w-full">
            État des Livraisons pour {clientName}
          </h1>
          <div className="flex flex-col md:flex-row gap-2 w-full ">
            <div
              className="border border-gray-300 outline outline-1 outline-gray-200 p-4 rounded-lg bg-white shadow-md w-full max-w-md mt-4 md:mt-0"
            >
              <div className="space-y-2">
                {commandeSummaries.length > 0 ? (
                  commandeSummaries.map((cmd, index) => (
                    <div key={`${cmd.model}-${cmd.commande}`}>
                      {index === 0 || cmd.model !== commandeSummaries[index - 1].model ? (
                        <p className="text-sm text-gray-600 mt-2 font-bold">
                          Modèle: {cmd.model}
                        </p>
                      ) : null}
                      <p className="text-sm text-gray-600">
                        Commande {cmd.commande || "N/A"}: Total <span className="font-medium">{cmd.quantityTotal}</span> / Livré <span className="font-medium">{cmd.quantityDelivered}</span>
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
            
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2 w-full max-w-md">
            <input
              type="text"
              placeholder="Rechercher par commande ou description"
              className="rounded-xl p-2 bg-gray-100 w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <button
              className="btn btn-bordered flex items-center gap-2"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {selectedModels.length > 0
                ? `${selectedModels.length} modèle(s) sélectionné(s)`
                : "Tous les modèles"}
              <ChevronDown className="w-5 h-5" />
            </button>
            {isDropdownOpen && (
              <div className="absolute z-10 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2">
                  {allModels.length > 0 ? (
                    allModels.map((model) => (
                      <label key={model} className="flex items-center space-x-2 p-2 hover:bg-gray-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedModels.includes(model)}
                          onChange={() => toggleModelSelection(model)}
                          className="checkbox checkbox-sm"
                        />
                        <span>{model}</span>
                      </label>
                    ))
                  ) : (
                    <p className="p-2 text-gray-500">Aucun modèle trouvé</p>
                  )}
                </div>
              </div>
            )}
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
          <button
              onClick={handleDownloadPDF}
              className="btn btn-accent mt-4 md:mt-0"
            >
              <Printer className="w-5 h-5 mr-2" />
              Télécharger PDF
            </button>
        </div>

        {loading ? (
          <div className="text-center">
            <span className="loading loading-spinner loading-lg text-blue-500"></span>
          </div>
        ) : error ? (
          <div className="alert alert-error text-center">{error}</div>
        ) : (filteredImports.length > 0 || filteredExports.length > 0) ? (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4">Importations</h2>
              <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
                <table className="table w-full">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="p-4 text-left">Date Import</th>
                      <th className="p-4 text-left">N° Livraison</th>
                      <th className="p-4 text-left">Modèle</th>
                      <th className="p-4 text-left">Commande</th>
                      <th className="p-4 text-left">Description</th>
                      <th className="p-4 text-left">Qté Reçu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedImportsArray.map((group, groupIndex) => (
                      <React.Fragment key={group.numLivraisonEntree + groupIndex}>
                        {group.lines.map((line, lineIndex) => (
                          <tr
                            key={line.id}
                            className="hover:bg-blue-100 transition-colors"
                          >
                            {lineIndex === 0 && (
                              <>
                                <td className="p-4" rowSpan={group.lines.length}>
                                  {group.dateEntree ? new Date(group.dateEntree).toLocaleDateString() : "N/A"}
                                </td>
                                <td className="p-4" rowSpan={group.lines.length}>
                                  {group.numLivraisonEntree || "N/A"}
                                </td>
                              </>
                            )}
                            <td className="p-4">{line.modele || "N/A"}</td>
                            <td className="p-4">{line.commande || "N/A"}</td>
                            <td className="p-4">{line.description || "N/A"}</td>
                            <td className="p-4">{line.quantityReçu}</td>
                          </tr>
                        ))}
                        {groupIndex < groupedImportsArray.length - 1 && (
                          <tr className="border-t border-gray-300">
                            <td colSpan={6} className="p-0 h-px"></td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4">Exportations</h2>
              <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
                <table className="table w-full">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="p-4 text-left"></th>
                      <th className="p-4 text-left">Date Export</th>
                      <th className="p-4 text-left">N° Livraison</th>
                      <th className="p-4 text-left">Modèle</th>
                      <th className="p-4 text-left">Commande</th>
                      <th className="p-4 text-left">Description</th>
                      <th className="p-4 text-left">Qté Livrée</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedExportsArray.map((group, groupIndex) => (
                      <React.Fragment key={group.numLivraisonSortie + groupIndex}>
                        {group.lines.map((line, lineIndex) => (
                          <tr
                            key={line.id}
                            className="hover:bg-blue-100 transition-colors"
                          >
                            <td className="p-4">
                              <input
                                type="checkbox"
                                checked={line.isExcluded}
                                disabled
                              />
                            </td>
                            {lineIndex === 0 && (
                              <>
                                <td className="p-4" rowSpan={group.lines.length}>
                                  {group.dateSortie ? new Date(group.dateSortie).toLocaleDateString() : "N/A"}
                                </td>
                                <td className="p-4" rowSpan={group.lines.length}>
                                  {group.numLivraisonSortie || "N/A"}
                                </td>
                              </>
                            )}
                            <td className="p-4">{line.modele}</td>
                            <td className="p-4">{line.commande || "N/A"}</td>
                            <td className="p-4">{line.description || "N/A"}</td>
                            <td className="p-4">{line.quantityDelivered}</td>
                          </tr>
                        ))}
                        {groupIndex < groupedExportsArray.length - 1 && (
                          <tr className="border-t border-gray-300">
                            <td colSpan={7} className="p-0 h-px"></td>
                          </tr>
                        )}
                      </React.Fragment>
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