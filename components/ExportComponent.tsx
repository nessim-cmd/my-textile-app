import { DeclarationExport } from "@/type";
import { CheckCircle, Clock, FileText, Shirt, SquareArrowOutUpRight, XCircle } from "lucide-react";
import Link from "next/link";
import React from "react";

type ExportComponentProps = {
  exporte: DeclarationExport;
};

const getStatusBadge = (status: number) => {
  switch (status) {
    case 1:
      return (
        <div className="badge badge-lg flex items-center gap-2">
          <FileText className="w-4" />
          Brouillon
        </div>
      );
    case 2:
      return (
        <div className="badge badge-lg badge-warning flex items-center gap-2">
          <Clock className="w-4" />
          En attente
        </div>
      );
    case 3:
      return (
        <div className="badge badge-lg badge-success flex items-center gap-2">
          <CheckCircle className="w-4" />
          Payée
        </div>
      );
    case 4:
      return (
        <div className="badge badge-lg badge-info flex items-center gap-2">
          <XCircle className="w-4" />
          Annulée
        </div>
      );
    case 5:
      return (
        <div className="badge badge-lg badge-error flex items-center gap-2">
          <XCircle className="w-4" />
          Impayée
        </div>
      );
    default:
      return (
        <div className="badge badge-lg">
          <XCircle className="w-4" />
          Indéfini
        </div>
      );
  }
};

const getModePaiment = (paiment: number) => {
  switch (paiment) {
    case 1:
      return (
        <div className="badge badge-lg flex items-center gap-2">
          <FileText className="w-4" />
          Virement bancaire
        </div>
      );
    case 2:
      return (
        <div className="badge badge-lg badge-warning flex items-center gap-2">
          <Clock className="w-4" />
          Chèque
        </div>
      );
    case 3:
      return (
        <div className="badge badge-lg badge-success flex items-center gap-2">
          <CheckCircle className="w-4" />
          Espèce
        </div>
      );
    default:
      return (
        <div className="badge badge-lg">
          <XCircle className="w-4" />
          Indéfini
        </div>
      );
  }
};

const ExportComponent: React.FC<ExportComponentProps> = ({ exporte }) => {
  const calculateTotalTTC = () => {
    const totalHT = exporte.lines.reduce(
      (acc, line) => acc + (line.quantity || 0) * (line.unitPrice || 0),
      0
    );
    const totalVAT = exporte.vatActive ? totalHT * (exporte.vatRate / 100) : 0;
    return totalHT + totalVAT;
  };

  return (
    <div className="bg-base-200/90 p-5 rounded-xl space-y-2 shadow">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
          <div className="badge badge-lg flex items-center gap-2">
            <Shirt className="w-4" />
            {exporte.lines.length} Lignes
          </div>
        </div>
        <Link
          className="btn btn-accent btn-sm"
          href={`/exporte/${exporte.id}`}
        >
          Détails
          <SquareArrowOutUpRight className="w-4" />
        </Link>
      </div>
      <div className="w-full">
        <div>
          <div className="stat-title">
            <div className="uppercase text-sm">{exporte.num_dec}</div>
          </div>
          <div className="stat-value">{calculateTotalTTC().toFixed(2)} €</div>
          <div className="stat-desc">{exporte.clientName}</div>
          <div className="text-xs text-gray-500">
            {exporte.exportDate
              ? new Date(exporte.exportDate).toLocaleDateString()
              : "N/A"}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div>{getStatusBadge(exporte.status)}</div>
            <div>{getModePaiment(exporte.modePaiment)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportComponent;