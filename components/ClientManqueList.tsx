"use client";

import { useState } from "react";
import { DeclarationImport, LivraisonEntree } from "@/type";
import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import jsPDF from "jspdf";

interface ClientManqueListProps {
  clientName: string;
  data: {
    declarations: DeclarationImport[];
    livraisons: LivraisonEntree[];
  };
}

const ClientManqueList: React.FC<ClientManqueListProps> = ({ clientName, data }) => {
  const [showDetails, setShowDetails] = useState(false);

  const totalMissingItems = data.declarations.reduce((sum, dec) => 
    sum + dec.models.reduce((modelSum, model) => 
      modelSum + model.accessories.reduce((accSum, acc) => 
        accSum + (acc.quantity_manque < 0 ? Math.abs(acc.quantity_manque) : 0), 0), 0), 0) +
    data.livraisons.reduce((sum, liv) => 
      sum + liv.lines.reduce((lineSum, line) => 
        lineSum + (line.quantityReçu > line.quantityTrouvee ? line.quantityReçu - line.quantityTrouvee : 0), 0), 0);

  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    let yPosition = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(33, 150, 243);
    doc.text(`Liste des Manques - ${clientName}`, margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFillColor(230, 230, 230);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, "F");
    const headers = ["Modèle", "Commande", "Reference", "Qté Reçue", "Qté Trouvée", "Qté Manquante"];
    headers.forEach((header, index) => {
      doc.text(header, margin + 5 + index * 30, yPosition + 6);
    });
    yPosition += 8;

    doc.setFont("helvetica", "normal");
    data.declarations.forEach(dec => {
      dec.models.forEach(model => {
        model.accessories.forEach(acc => {
          if (acc.quantity_manque < 0) {
            const row = [
              model.name || "N/A",
              dec.num_dec || "N/A",
              acc.reference_accessoire || "N/A",
              acc.quantity_reçu !== null && acc.quantity_reçu !== undefined ? acc.quantity_reçu.toString() : "N/A",
              acc.quantity_trouve !== null && acc.quantity_trouve !== undefined ? acc.quantity_trouve.toString() : "N/A",
              acc.quantity_manque !== null && acc.quantity_manque !== undefined ? Math.abs(acc.quantity_manque).toString() : "N/A",
            ];
            doc.setFillColor(255, 255, 255);
            doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, "F");
            row.forEach((cell, index) => {
              if (index === 5) doc.setTextColor(255, 0, 0);
              else doc.setTextColor(0);
              doc.text(cell.slice(0, 15), margin + 5 + index * 30, yPosition + 6);
            });
            yPosition += 8;
            if (yPosition > 270) {
              doc.addPage();
              yPosition = margin;
            }
          }
        });
      });
    });

    data.livraisons.forEach(liv => {
      liv.lines.forEach(line => {
        if (line.quantityReçu > line.quantityTrouvee) {
          const row = [
            line.modele || "N/A",
            line.commande || "N/A",
            line.description || "N/A",
            line.quantityReçu !== null && line.quantityReçu !== undefined ? line.quantityReçu.toString() : "N/A",
            line.quantityTrouvee !== null && line.quantityTrouvee !== undefined ? line.quantityTrouvee.toString() : "N/A",
            (line.quantityReçu !== null && line.quantityReçu !== undefined && line.quantityTrouvee !== null && line.quantityTrouvee !== undefined) 
              ? (line.quantityReçu - line.quantityTrouvee).toString() : "N/A",
          ];
          doc.setFillColor(255, 255, 255);
          doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, "F");
          row.forEach((cell, index) => {
            if (index === 5) doc.setTextColor(255, 0, 0);
            else doc.setTextColor(0);
            doc.text(cell.slice(0, 15), margin + 5 + index * 30, yPosition + 6);
          });
          yPosition += 8;
          if (yPosition > 270) {
            doc.addPage();
            yPosition = margin;
          }
        }
      });
    });

    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, 287);

    doc.save(`liste-manque-${clientName.toLowerCase().replace(/\s+/g, "-")}.pdf`);
  };

  return (
    <div className="card bg-base-200 p-4 sm:p-6 rounded-xl shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
        <h2 className="text-lg sm:text-xl font-semibold">{clientName}</h2>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <span className="badge badge-error">{totalMissingItems} items manquants</span>
          <button
            onClick={downloadPDF}
            className="btn btn-sm btn-primary flex items-center gap-1 whitespace-nowrap"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            PDF
          </button>
          <button
            className="btn btn-sm btn-accent flex items-center gap-1 whitespace-nowrap"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Masquer" : "Détails"}
            <SquareArrowOutUpRight className="w-4 ml-1" />
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="overflow-x-auto">
          <h3 className="text-md sm:text-lg font-bold mb-2">Liste des Manques pour {clientName}</h3>
          {/* Desktop Table */}
          <table className="table table-zebra w-full hidden sm:table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Modèle</th>
                <th>Commande</th>
                <th>Reference</th>
                <th>Qté Reçue</th>
                <th>Qté Trouvée</th>
                <th>Qté Manquante</th>
                <th>Lien</th>
              </tr>
            </thead>
            <tbody>
              {data.declarations.flatMap(dec =>
                dec.models.flatMap(model =>
                  model.accessories.map(acc =>
                    acc.quantity_manque < 0 ? (
                      <tr key={`${dec.id}-${model.id}-${acc.id}`}>
                        <td>{acc.quantity_manque < 0 ? "Déclaration" : "N/A"}</td>
                        <td>{model.name || "N/A"}</td>
                        <td>{dec.num_dec || "N/A"}</td>
                        <td>{acc.reference_accessoire || "N/A"}</td>
                        <td>{acc.quantity_reçu !== null && acc.quantity_reçu !== undefined ? acc.quantity_reçu : "N/A"}</td>
                        <td>{acc.quantity_trouve !== null && acc.quantity_trouve !== undefined ? acc.quantity_trouve : "N/A"}</td>
                        <td className="text-red-500">
                          {acc.quantity_manque !== null && acc.quantity_manque !== undefined ? Math.abs(acc.quantity_manque) : "N/A"}
                        </td>
                        <td>
                          <Link href={`/import/${dec.id}`} className="btn btn-xs btn-accent">
                            Voir
                          </Link>
                        </td>
                      </tr>
                    ) : null
                  )
                )
              )}
              {data.livraisons.flatMap(liv =>
                liv.lines.map(line =>
                  line.quantityReçu > line.quantityTrouvee ? (
                    <tr key={`${liv.id}-${line.id}`}>
                      <td>{line.quantityReçu > line.quantityTrouvee ? "Livraison" : "N/A"}</td>
                      <td>{line.modele || "N/A"}</td>
                      <td>{line.commande || "N/A"}</td>
                      <td>{line.description || "N/A"}</td>
                      <td>{line.quantityReçu !== null && line.quantityReçu !== undefined ? line.quantityReçu : "N/A"}</td>
                      <td>{line.quantityTrouvee !== null && line.quantityTrouvee !== undefined ? line.quantityTrouvee : "N/A"}</td>
                      <td className="text-red-500">
                        {(line.quantityReçu !== null && line.quantityReçu !== undefined && line.quantityTrouvee !== null && line.quantityTrouvee !== undefined) 
                          ? (line.quantityReçu - line.quantityTrouvee) : "N/A"}
                      </td>
                      <td>
                        <Link href={`/livraisonEntree/${liv.id}`} className="btn btn-xs btn-accent">
                          Voir
                        </Link>
                      </td>
                    </tr>
                  ) : null
                )
              )}
            </tbody>
          </table>

          {/* Mobile Card Layout */}
          <div className="sm:hidden space-y-4">
            {data.declarations.flatMap(dec =>
              dec.models.flatMap(model =>
                model.accessories.map(acc =>
                  acc.quantity_manque < 0 ? (
                    <div key={`${dec.id}-${model.id}-${acc.id}`} className="card bg-base-100 p-4 shadow">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="font-semibold">Type:</span>
                        <span>{acc.quantity_manque < 0 ? "Déclaration" : "N/A"}</span>
                        <span className="font-semibold">Modèle:</span>
                        <span>{model.name || "N/A"}</span>
                        <span className="font-semibold">Commande:</span>
                        <span>{dec.num_dec || "N/A"}</span>
                        <span className="font-semibold">Reference:</span>
                        <span>{acc.reference_accessoire || "N/A"}</span>
                        <span className="font-semibold">Qté Reçue:</span>
                        <span>{acc.quantity_reçu !== null && acc.quantity_reçu !== undefined ? acc.quantity_reçu : "N/A"}</span>
                        <span className="font-semibold">Qté Trouvée:</span>
                        <span>{acc.quantity_trouve !== null && acc.quantity_trouve !== undefined ? acc.quantity_trouve : "N/A"}</span>
                        <span className="font-semibold">Qté Manquante:</span>
                        <span className="text-red-500">
                          {acc.quantity_manque !== null && acc.quantity_manque !== undefined ? Math.abs(acc.quantity_manque) : "N/A"}
                        </span>
                        <span className="font-semibold">Lien:</span>
                        <Link href={`/import/${dec.id}`} className="btn btn-xs btn-accent">Voir</Link>
                      </div>
                    </div>
                  ) : null
                )
              )
            )}
            {data.livraisons.flatMap(liv =>
              liv.lines.map(line =>
                line.quantityReçu > line.quantityTrouvee ? (
                  <div key={`${liv.id}-${line.id}`} className="card bg-base-100 p-4 shadow">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="font-semibold">Type:</span>
                      <span>{line.quantityReçu > line.quantityTrouvee ? "Livraison" : "N/A"}</span>
                      <span className="font-semibold">Modèle:</span>
                      <span>{line.modele || "N/A"}</span>
                      <span className="font-semibold">Commande:</span>
                      <span>{line.commande || "N/A"}</span>
                      <span className="font-semibold">Reference:</span>
                      <span>{line.description || "N/A"}</span>
                      <span className="font-semibold">Qté Reçue:</span>
                      <span>{line.quantityReçu !== null && line.quantityReçu !== undefined ? line.quantityReçu : "N/A"}</span>
                      <span className="font-semibold">Qté Trouvée:</span>
                      <span>{line.quantityTrouvee !== null && line.quantityTrouvee !== undefined ? line.quantityTrouvee : "N/A"}</span>
                      <span className="font-semibold">Qté Manquante:</span>
                      <span className="text-red-500">
                        {(line.quantityReçu !== null && line.quantityReçu !== undefined && line.quantityTrouvee !== null && line.quantityTrouvee !== undefined) 
                          ? (line.quantityReçu - line.quantityTrouvee) : "N/A"}
                      </span>
                      <span className="font-semibold">Lien:</span>
                      <Link href={`/livraisonEntree/${liv.id}`} className="btn btn-xs btn-accent">Voir</Link>
                    </div>
                  </div>
                ) : null
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManqueList;