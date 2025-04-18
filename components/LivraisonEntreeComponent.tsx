import { LivraisonEntree } from "@/type";
import { FileText, SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import React from "react";

type LivraisonEntreeComponentProps = {
  livraisonEntree: LivraisonEntree;
  index: number;
};

const LivraisonEntreeComponent: React.FC<LivraisonEntreeComponentProps> = ({ livraisonEntree }) => {
  return (
    <div className="bg-base-200/90 p-5 rounded-xl space-y-2 shadow">
      <div className="flex justify-between items-center w-full">
        <div className="badge badge-lg flex items-center gap-2">
          <FileText className="w-4" />
          {livraisonEntree.models.length} Modèles
        </div>
        <Link className="btn btn-accent btn-sm" href={`/livraisonEntree/${livraisonEntree.id}`}>
          Détails
          <SquareArrowOutUpRight className="w-4" />
        </Link>
      </div>
      <div className="w-full">
        <div>
          <div className="stat-title">
            <div className="uppercase text-sm">{livraisonEntree.id}</div>
          </div>
          <div className="stat-desc">{livraisonEntree.clientName}</div>
          <div className="text-xs text-gray-500">
            {livraisonEntree.livraisonDate
              ? new Date(livraisonEntree.livraisonDate).toLocaleDateString()
              : "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivraisonEntreeComponent;