// components/LivraisonComponent.tsx
import { Livraison } from "@/type";
import { FileText, SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";

type LivraisonComponentProps = {
  livraison: Livraison;
  index: number;
};

const LivraisonComponent: React.FC<LivraisonComponentProps> = ({ livraison }) => {
  const totalQuantity = livraison?.lines?.reduce((acc, line) => {
    const quantity = line.quantity ?? 0;
    return acc + quantity;
  }, 0);

  return (
    <div className="bg-base-200/90 p-5 rounded-xl space-y-2 shadow">
      <div className="flex justify-between items-center w-full">
        <div className="badge badge-lg flex items-center gap-2">
          <FileText className="w-4" />
          Livraison
        </div>
        <Link className="btn btn-accent btn-sm" href={`/livraison/${livraison.id}`}>
          Plus
          <SquareArrowOutUpRight className="w-4" />
        </Link>
      </div>

      <div className="w-full">
        <div>
          <div className="stat-title">
            <div className="uppercase text-sm">
              <span className="font-bold">Livraison N°</span> {livraison.id}
            </div>
          </div>
          <div>
            <div className="stat-value">{totalQuantity} unités</div>
          </div>
          <div className="stat-desc">{livraison.name}</div>
        </div>
      </div>
    </div>
  );
};

export default LivraisonComponent;