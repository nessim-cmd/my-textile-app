/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import Wrapper from "@/components/Wrapper";
import { Search, ChevronDown, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";


interface VariantEntry {
  name: string;
  qte_variante: number;
}

interface CommandeEntry {
  value: string;
  variants: VariantEntry[];
}

interface PlanningEntry {
  clientName: string;
  modele: string;
  commande: CommandeEntry;
  designation: string;
  qteTotal: number;
  qteLivree: number;
  dateImport: string;
  dateExport: string;
  entreeCoupe: string;
  entreeChaine: string;
}

export default function PlanningPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [planningData, setPlanningData] = useState<PlanningEntry[]>([]);
  const [filteredData, setFilteredData] = useState<PlanningEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [dateDebut, setDateDebut] = useState<string>("");
  const [dateFin, setDateFin] = useState<string>("");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState<boolean>(false);

  // Function to format date to DD/MM/YYYY
  const formatDate = (dateInput: string | Date | undefined): string => {
    if (!dateInput) return " ";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return " ";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const fetchPlanningData = useCallback(async () => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      setError("User email not available");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const email = user.primaryEmailAddress.emailAddress;

      const clientModelResponse = await fetch(`/api/client-model?email=${encodeURIComponent(email)}`, { headers });
      if (!clientModelResponse.ok) {
        const errorData = await clientModelResponse.json();
        throw new Error(`Client Model API Error: ${clientModelResponse.status} - ${errorData.error || "Unknown error"}`);
      }
      const clientModelData = await clientModelResponse.json();

      const ficheCoupeResponse = await fetch("/api/fiche-coupe", { headers });
      if (!ficheCoupeResponse.ok) throw new Error(`Fiche Coupe API Error: ${ficheCoupeResponse.status}`);
      const ficheCoupeData = await ficheCoupeResponse.json();

      const ficheProductionResponse = await fetch("/api/fiche-production", { headers });
      if (!ficheProductionResponse.ok) throw new Error(`Fiche Production API Error: ${ficheProductionResponse.status}`);
      const ficheProductionData = await ficheProductionResponse.json();

      const [exports1Response, exports2Response] = await Promise.all([
        fetch("/api/etat-import-export-livraison", { headers }),
        fetch("/api/etat-import-export", { headers }),
      ]);

      if (!exports1Response.ok) throw new Error(`Etat Import-Export-Livraison API Error: ${exports1Response.status}`);
      const { exports: exports1 } = await exports1Response.json();

      if (!exports2Response.ok) throw new Error(`Etat Import-Export API Error: ${exports2Response.status}`);
      const { exports: exports2 } = await exports2Response.json();

      const allExports = [...exports1, ...exports2];
      const deliveredMap = new Map<string, number>();
      const exportDateMap = new Map<string, string>();

      allExports.forEach((exp: any) => {
        if (exp.isExcluded) return;

        const client = (exp.clientSortie || exp.clientExport || "").trim().toLowerCase();
        const modele = (exp.modele || "").trim().toLowerCase();
        const commande = (exp.commande || "").trim().toLowerCase();
        const quantity = exp.quantityDelivered || 0;
        const exportDate = exp.dateExport || exp.updatedAt || exp.createdAt;

        const key = `${client}-${modele}-${commande}`;
        deliveredMap.set(key, (deliveredMap.get(key) || 0) + quantity);
        
        if (exportDate) {
          exportDateMap.set(key, formatDate(exportDate));
        }
      });

      const coupeMap = new Map<string, string>();
      ficheCoupeData.forEach((fiche: any) => {
        const key = `${fiche.clientId}-${fiche.modelId}-${fiche.commande.toLowerCase()}`;
        if (fiche.createdAt) {
          coupeMap.set(key, formatDate(fiche.createdAt));
        }
      });

      const chaineMap = new Map<string, string>();
      ficheProductionData.forEach((fiche: any) => {
        const key = `${fiche.clientId}-${fiche.modelId}-${fiche.commande.toLowerCase()}`;
        if (fiche.createdAt) {
          chaineMap.set(key, formatDate(fiche.createdAt));
        }
      });

      const planningEntries: PlanningEntry[] = clientModelData.flatMap((model: any) => {
        const allVariants = (model.variants || []).map((v: any) => ({
          name: v.name || " ",
          qte_variante: v.qte_variante || 0,
        }));

        const commandes = (model.commandesWithVariants || []).length > 0
          ? model.commandesWithVariants
          : [{ value: " " }];

        const variantsPerCommande = commandes.length > 0 ? Math.ceil(allVariants.length / commandes.length) : 0;

        return commandes.map((commande: any, cmdIndex: number) => {
          const startIdx = cmdIndex * variantsPerCommande;
          const endIdx = Math.min(startIdx + variantsPerCommande, allVariants.length);
          const commandeVariants = allVariants.slice(startIdx, endIdx);
          const qteTotal = commandeVariants.reduce((sum: number, v: VariantEntry) => sum + v.qte_variante, 0);

          const clientName = (model.client?.name || " ").trim().toLowerCase();
          const modeleName = (model.name || " ").trim().toLowerCase();
          const commandeValue = (commande.value || " ").trim().toLowerCase();

          const key = `${clientName}-${modeleName}-${commandeValue}`;
          const qteLivree = deliveredMap.get(key) || 0;
          const dateExport = exportDateMap.get(key) || " ";

          const coupeKey = `${model.clientId}-${model.id}-${commandeValue}`;
          const entreeCoupe = coupeMap.get(coupeKey) || " ";
          const entreeChaine = chaineMap.get(coupeKey) || " ";

          return qteLivree < qteTotal ? {
            clientName: model.client?.name || " ",
            modele: model.name || " ",
            commande: {
              value: commande.value || " ",
              variants: commandeVariants,
            },
            designation: model.description || " ",
            qteTotal,
            qteLivree,
            dateImport: model.createdAt ? formatDate(model.createdAt) : " ",
            dateExport,
            entreeCoupe,
            entreeChaine,
          } : null;
        }).filter(Boolean) as PlanningEntry[];
      });

      // Sort planningEntries by dateImport chronologically
      planningEntries.sort((a, b) => {
        const dateA = new Date(a.dateImport.split("/").reverse().join("-"));
        const dateB = new Date(b.dateImport.split("/").reverse().join("-"));
        return dateA.getTime() - dateB.getTime();
      });

      setPlanningData(planningEntries);
      setFilteredData(planningEntries);
    } catch (err: any) {
      setError(`Failed to load planning data: ${err.message}`);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [getToken, user]);

  useEffect(() => {
    fetchPlanningData();
  }, [fetchPlanningData]);

  useEffect(() => {
    const filtered = planningData.filter((entry: PlanningEntry) => {
      const matchesSearch =
        entry.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.commande.value.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesModel =
        selectedModels.length === 0 || selectedModels.includes(entry.modele);
      const dateImport = new Date(entry.dateImport.split("/").reverse().join("-"));
      const start = dateDebut ? new Date(dateDebut) : null;
      const end = dateFin ? new Date(dateFin) : null;
      const matchesDate =
        (!start || dateImport >= start) && (!end || dateImport <= end);

      return matchesSearch && matchesModel && matchesDate;
    });
    setFilteredData(filtered);
  }, [searchTerm, selectedModels, dateDebut, dateFin, planningData]);

  const allModels = Array.from(new Set(planningData.map((entry: PlanningEntry) => entry.modele)));

  const toggleModelSelection = (model: string) => {
    setSelectedModels((prev: string[]) =>
      prev.includes(model) ? prev.filter((m: string) => m !== model) : [...prev, model]
    );
  };

  const groupIntoClusters = (data: PlanningEntry[]) => {
    const clusters = new Map<string, PlanningEntry[]>();
    data.forEach((entry: PlanningEntry) => {
      const key = `${entry.clientName}-${entry.modele}-${entry.designation}-${entry.dateImport}`;
      if (!clusters.has(key)) {
        clusters.set(key, []);
      }
      clusters.get(key)?.push(entry);
    });
    return Array.from(clusters.entries()).map(([key, entries]) => ({
      key,
      entries,
    }));
  };

  const downloadPDF = () => {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    let yOffset = 10;
    pdf.setFontSize(20);
    const title = "PLANNING";
    const titleWidth = pdf.getTextWidth(title);
    const pageWidth = 297;
    const titleX = (pageWidth - titleWidth) / 2;
    pdf.text(title, titleX, yOffset);
    yOffset += 12;

    if (filteredData.length > 0) {
      const tableData: string[][] = [];
      const clusters = groupIntoClusters(filteredData);

      clusters.forEach((cluster: { key: string; entries: PlanningEntry[] }) => {
        cluster.entries.forEach((entry: PlanningEntry, entryIndex: number) => {
          const commandeVariants = entry.commande.variants?.length > 0 
            ? entry.commande.variants 
            : [{ name: " ", qte_variante: 0 }];

          commandeVariants.forEach((variant: VariantEntry, vIndex: number) => {
            const row: string[] = [];
            if (entryIndex === 0 && vIndex === 0) {
              row.push(entry.clientName);
              row.push(entry.modele);
            } else {
              row.push("");
              row.push("");
            }

            if (vIndex === 0) {
              row.push(entry.commande.value);
            } else {
              row.push("");
            }

            if (entryIndex === 0 && vIndex === 0) {
              row.push(entry.designation);
            } else {
              row.push("");
            }

            row.push(variant.name);
            row.push(variant.qte_variante.toString());

            if (vIndex === 0) {
              row.push(entry.qteTotal.toString());
              row.push(entry.qteLivree.toString());
            } else {
              row.push("");
              row.push("");
            }

            if (entryIndex === 0 && vIndex === 0) {
              row.push(entry.dateImport);
              row.push(entry.dateExport);
              row.push(entry.entreeCoupe);
              row.push(entry.entreeChaine);
            } else {
              row.push("");
              row.push("");
              row.push("");
              row.push("");
            }

            tableData.push(row);
          });
        });
      });

      autoTable(pdf, {
        startY: yOffset,
        head: [["Client", "Modèle", "Commande", "Désignation", "Variant", "Qté Variant", "Qté Total", "Qté Livrée", "Date Import", "Entrée Coupe", "Entrée Chaîne", "Date Export"]],
        body: tableData,
        theme: "plain",
        styles: { fontSize: 10, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.1, halign: "center" },
        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontSize: 10, lineColor: [0, 0, 0], lineWidth: 0.1, halign: "center" },
        margin: { left: 10, right: 10 },
        didDrawPage: (data) => {
          const pageNumber = data.pageNumber;
          pdf.setFontSize(10);
          pdf.setTextColor(150);
          pdf.text(`Page ${pageNumber}`, 277, 200, { align: "right" });
        },
      });
    } else {
      pdf.setFontSize(11);
      pdf.text("Aucune donnée trouvée", 10, yOffset);
    }

    pdf.save("planning.pdf");
  };

  const downloadExcel = () => {
    const excelData = filteredData.flatMap((entry: PlanningEntry) => {
      const commandeVariants = entry.commande.variants?.length > 0
        ? entry.commande.variants
        : [{ name: " ", qte_variante: 0 }];

      return commandeVariants.map((variant: VariantEntry) => ({
        Client: entry.clientName,
        Modèle: entry.modele,
        Commande: entry.commande.value,
        Désignation: entry.designation,
        Variant: variant.name,
        "Qté Variant": variant.qte_variante,
        "Qté Total": entry.qteTotal,
        "Qté Livrée": entry.qteLivree,
        "Date Import": entry.dateImport,
        "Entrée Coupe": entry.entreeCoupe,
        "Entrée Chaîne": entry.entreeChaine,
        "Date Export": entry.dateExport,
      }));
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Planning");

    // Set column widths
    worksheet["!cols"] = [
      { wch: 20 }, // Client
      { wch: 15 }, // Modèle
      { wch: 15 }, // Commande
      { wch: 25 }, // Désignation
      { wch: 15 }, // Variant
      { wch: 12 }, // Qté Variant
      { wch: 12 }, // Qté Total
      { wch: 12 }, // Qté Livrée
      { wch: 12 }, // Date Import
      { wch: 12 }, // Entrée Coupe
      { wch: 12 }, // Entrée Chaîne
      { wch: 12 }, // Date Export
    ];

    XLSX.writeFile(workbook, "planning.xlsx");
  };

  return (
    <Wrapper>
      <div className="flex flex-col space-y-6 py-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">Planning</h1>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2 w-full max-w-md">
            <input
              type="text"
              placeholder="Rechercher par client ou commande"
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
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            >
              {selectedModels.length > 0 ? `${selectedModels.length} modèle(s) sélectionné(s)` : "Tous les modèles"}
              <ChevronDown className="w-5 h-5" />
            </button>
            {isModelDropdownOpen && (
              <div className="absolute z-10 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2">
                  {allModels.length > 0 ? (
                    allModels.map((model: string, mIndex: number) => (
                      <label key={mIndex} className="flex items-center space-x-2 p-2 hover:bg-gray-100 cursor-pointer">
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

          <button onClick={downloadPDF} className="btn btn-primary flex items-center gap-2">
            <Download className="w-5 h-5" />
            Télécharger PDF
          </button>
          <button onClick={downloadExcel} className="btn bg-green-600 text-white flex items-center gap-2">
            <Download className="w-5 h-5" />
            
            Télécharger Excel
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
            <table className="table w-full border-collapse">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-4 text-center align-middle">Client</th>
                  <th className="p-4 text-center align-middle">Modèle</th>
                  <th className="p-4 text-center align-middle">Commande</th>
                  <th className="p-4 text-center align-middle">Désignation</th>
                  <th className="p-4 text-center align-middle">Variant</th>
                  <th className="p-4 text-center align-middle">Qté Variant</th>
                  <th className="p-4 text-center align-middle">Qté Total</th>
                  <th className="p-4 text-center align-middle">Qté Livrée</th>
                  <th className="p-4 text-center align-middle">Date Import</th>
                  <th className="p-4 text-center align-middle">Entrée Coupe</th>
                  <th className="p-4 text-center align-middle">Entrée Chaîne</th>
                  <th className="p-4 text-center align-middle">Date Export</th>
                </tr>
              </thead>
              <tbody>
                {groupIntoClusters(filteredData).map((cluster: { key: string; entries: PlanningEntry[] }, clusterIndex: number) => {
                  const totalVariants = cluster.entries.reduce(
                    (sum: number, entry: PlanningEntry) => sum + (entry.commande.variants?.length || 1),
                    0
                  );

                  return cluster.entries.flatMap((entry: PlanningEntry, entryIndex: number) => {
                    const commandeVariants = entry.commande.variants?.length > 0
                      ? entry.commande.variants
                      : [{ name: " ", qte_variante: 0 }];

                    return commandeVariants.map((variant: VariantEntry, variantIndex: number) => {
                      const isFirstInCluster = entryIndex === 0 && variantIndex === 0;
                      const isFirstInCommande = variantIndex === 0;

                      return (
                        <tr
                          key={`${clusterIndex}-${entryIndex}-${variantIndex}`}
                          className="hover:bg-blue-100 transition-colors"
                        >
                          {isFirstInCluster && (
                            <td
                              className="p-4 text-center align-middle border"
                              rowSpan={totalVariants}
                              style={{ verticalAlign: "middle", backgroundColor: "#f0f0f0" }}
                            >
                              {entry.clientName}
                            </td>
                          )}
                          {isFirstInCluster && (
                            <td className="p-4 text-center align-middle border" rowSpan={totalVariants}>
                              {entry.modele}
                            </td>
                          )}
                          {isFirstInCommande && (
                            <td className="p-4 text-center align-middle border" rowSpan={commandeVariants.length}>
                              {entry.commande.value}
                            </td>
                          )}
                          {isFirstInCluster && (
                            <td className="p-4 text-center align-middle border" rowSpan={totalVariants}>
                              {entry.designation}
                            </td>
                          )}
                          <td className="p-4 border">{variant.name}</td>
                          <td className="p-4 border">{variant.qte_variante}</td>
                          {isFirstInCommande && (
                            <td className="p-4 text-center align-middle border" rowSpan={commandeVariants.length}>
                              {entry.qteTotal}
                            </td>
                          )}
                          {isFirstInCommande && (
                            <td className="p-4 text-center align-middle border" rowSpan={commandeVariants.length}>
                              {entry.qteLivree}
                            </td>
                          )}
                          {isFirstInCluster && (
                            <td className="p-4 text-center align-middle border" rowSpan={totalVariants}>
                              {entry.dateImport}
                            </td>
                          )}
                          {isFirstInCluster && (
                            <td className="p-4 text-center align-middle border" rowSpan={totalVariants}>
                              {entry.entreeCoupe}
                            </td>
                          )}
                          {isFirstInCluster && (
                            <td className="p-4 text-center align-middle border" rowSpan={totalVariants}>
                              {entry.entreeChaine}
                            </td>
                          )}
                          {isFirstInCluster && (
                            <td className="p-4 text-center align-middle border" rowSpan={totalVariants}>
                              {entry.dateExport}
                            </td>
                          )}
                        </tr>
                      );
                    });
                  });
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500">Aucune donnée trouvée</div>
        )}
      </div>

      <style jsx global>{`
        table {
          border: 1px solid #000 !important;
          border-collapse: collapse !important;
        }
        th, td {
          border: 1px solid #000 !important;
          padding: 8px !important;
          vertical-align: middle !important;
          text-align: center !important;
        }
        .border {
          border: 1px solid #000 !important;
        }
        .align-middle {
          vertical-align: middle !important;
        }
        .text-center {
          text-align: center !important;
        }
        .bg-blue-600 {
          background-color: #2563eb !important;
        }
        .hover\\:bg-blue-100:hover {
          background-color: #dbeafe !important;
        }
      `}</style>
    </Wrapper>
  );
}