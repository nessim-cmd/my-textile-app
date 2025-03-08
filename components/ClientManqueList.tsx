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

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(33, 150, 243);
    doc.text(`Liste des Manques - ${clientName}`, margin, yPosition);
    yPosition += 10;

    // Table Headers
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFillColor(230, 230, 230);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, "F");
    const headers = ["Modèle", "Commande", "Reference", "Qté Reçue", "Qté Trouvée", "Qté Manquante"];
    headers.forEach((header, index) => {
      doc.text(header, margin + 5 + index * 30, yPosition + 6);
    });
    yPosition += 8;

    // Table Rows - Declarations
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

    // Table Rows - Livraisons
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

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, 287);

    doc.save(`liste-manque-${clientName.toLowerCase().replace(/\s+/g, "-")}.pdf`);
  };

  return (
    <div className="card bg-base-200 p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{clientName}</h2>
        <div className="flex items-center gap-4">
          <span className="badge badge-error">{totalMissingItems} items manquants</span>
          <button
            onClick={downloadPDF}
            className="btn btn-sm btn-primary flex items-center gap-1"
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
            className="btn btn-sm btn-accent"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Masquer" : "Détails"}
            <SquareArrowOutUpRight className="w-4 ml-2" />
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="overflow-x-auto">
          <h3 className="text-lg font-bold mb-2">Liste des Manques pour {clientName}</h3>
          <table className="table table-zebra w-full">
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
                      <td>{line.commande  || "N/A"}</td>
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
        </div>
      )}
    </div>
  );
};

export default ClientManqueList;