import { Livraison } from "@/type";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface Props {
  livraison: Livraison;
  setLivraison: (livraison: Livraison) => void;
  onModelsChange?: (models: ClientModel[], exports?: ExportEntry[]) => void;
}

interface Client {
  id: string;
  name: string;
}

interface ClientModel {
  id: string;
  name: string | null;
  clientId: string;
  commandes: string | null;
  description: string | null;
  commandesWithVariants: { value: string; variants: { name: string; qte_variante: number }[] }[];
  variants: { id: string; name: string; qte_variante: number }[];
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

const LivraisonInfo: React.FC<Props> = ({ livraison, setLivraison, onModelsChange }) => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const [clients, setClients] = useState<Client[]>([]);
  const [clientModels, setClientModels] = useState<ClientModel[]>([]);
  const [exports, setExports] = useState<ExportEntry[]>([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("/api/client");
        const data = await response.json();
        setClients(data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const fetchClientModelsAndExports = async () => {
      if (!livraison.clientName || !email) {
        setClientModels([]);
        setExports([]);
        onModelsChange?.([], []);
        return;
      }

      try {
        // Fetch client models
        const modelsResponse = await fetch(
          `/api/client-model?email=${encodeURIComponent(email)}&client=${encodeURIComponent(livraison.clientName)}`
        );
        if (!modelsResponse.ok) throw new Error("Failed to fetch models");
        const modelsData: ClientModel[] = await modelsResponse.json();
        setClientModels(modelsData);

        // Fetch export data for quantityDelivered
        const exportsResponse = await fetch(
          `/api/etat-import-export-livraison?email=${encodeURIComponent(email)}`
        );
        if (!exportsResponse.ok) throw new Error("Failed to fetch exports");
        const { exports: exportsData } = await exportsResponse.json();
        const clientExports = exportsData.filter((exp: ExportEntry) => exp.clientSortie === livraison.clientName);
        setExports(clientExports);

        onModelsChange?.(modelsData, clientExports);
      } catch (error) {
        console.error("Error fetching data:", error);
        setClientModels([]);
        setExports([]);
        onModelsChange?.([], []);
      }
    };
    fetchClientModelsAndExports();
  }, [livraison.clientName, email, onModelsChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setLivraison({ ...livraison, [field]: e.target.value });
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLivraison({ ...livraison, clientName: e.target.value });
  };

  return (
    <div className="flex flex-col h-fit bg-base-200 p-5 rounded-xl mb-4 md:mb-0">
      <div className="space-y-4">
        <h2 className="badge badge-accent">Client</h2>
        <select
          value={livraison.clientName}
          onChange={handleClientChange}
          className="select select-bordered w-full"
        >
          <option value="">Sélectionner un client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.name}>
              {client.name}
            </option>
          ))}
        </select>

        <h2 className="badge badge-accent">Date de livraison</h2>
        <input
          type="date"
          value={livraison.livraisonDate}
          className="input input-bordered w-full resize-none"
          required
          onChange={(e) => handleInputChange(e, "livraisonDate")}
        />
      </div>
    </div>
  );
};

export default LivraisonInfo;