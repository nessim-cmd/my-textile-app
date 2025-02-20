// components/ExportInfo.tsx
import { DeclarationExport } from "@/type";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

interface Props {
  exporte: DeclarationExport;
  setExports: (exporte: DeclarationExport) => void;
  onModelsChange?: (models: ClientModel[]) => void; // Callback to pass models
}

interface Client {
  id: string;
  name: string;
}

interface ClientModel {
  id: string;
  name: string;
  clientId: string;
}

const ExportInfo: React.FC<Props> = ({ exporte, setExports, onModelsChange }) => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const [clients, setClients] = useState<Client[]>([]);
  const [clientModels, setClientModels] = useState<ClientModel[]>([]);

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
    const fetchClientModels = async () => {
      if (exporte.clientName && email) {
        try {
          const response = await fetch(
            `/api/client-model?email=${encodeURIComponent(email)}&client=${encodeURIComponent(exporte.clientName)}`
          );
          if (!response.ok) throw new Error("Failed to fetch models");
          const data = await response.json();
          setClientModels(data);
          onModelsChange?.(data); // Pass models to parent
        } catch (error) {
          console.error("Error fetching client models:", error);
          setClientModels([]);
          onModelsChange?.([]);
        }
      } else {
        setClientModels([]);
        onModelsChange?.([]);
      }
    };
    fetchClientModels();
  }, [exporte.clientName, email, onModelsChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setExports({ ...exporte, [field]: e.target.value });
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setExports({ ...exporte, clientName: e.target.value });
  };

  return (
    <div className="flex flex-col h-fit bg-base-200 p-5 rounded-xl mb-4 md:mb-0">
      <div className="space-y-4">
        <h2 className="badge badge-accent">Client</h2>
        <select
          value={exporte.clientName}
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

        <h2 className="badge badge-accent">Date de la Export</h2>
        <input
          type="date"
          value={exporte.exportDate}
          className="input input-bordered w-full resize-none"
          required
          onChange={(e) => handleInputChange(e, "exportDate")}
        />

        <h2 className="badge badge-accent">{"Date d'échéance"}</h2>
        <input
          type="date"
          value={exporte.dueDate}
          className="input input-bordered w-full resize-none"
          required
          onChange={(e) => handleInputChange(e, "dueDate")}
        />

        <h2 className="badge badge-accent">Poids Brut</h2>
        <input
          type="text"
          value={exporte.poidsBrut}
          className="input input-bordered w-full resize-none"
          required
          onChange={(e) => handleInputChange(e, "poidsBrut")}
        />

        <h2 className="badge badge-accent">Poids Net</h2>
        <input
          type="text"
          value={exporte.poidsNet}
          className="input input-bordered w-full resize-none"
          required
          onChange={(e) => handleInputChange(e, "poidsNet")}
        />

        <h2 className="badge badge-accent">Nbr Colis</h2>
        <input
          type="text"
          value={exporte.nbrColis}
          className="input input-bordered w-full resize-none"
          required
          onChange={(e) => handleInputChange(e, "nbrColis")}
        />

        <h2 className="badge badge-accent">Volume</h2>
        <input
          type="text"
          value={exporte.volume}
          className="input input-bordered w-full resize-none"
          required
          onChange={(e) => handleInputChange(e, "volume")}
        />

        <h2 className="badge badge-accent">Origine Tissu</h2>
        <input
          type="text"
          value={exporte.origineTessuto}
          className="input input-bordered w-full resize-none"
          required
          onChange={(e) => handleInputChange(e, "origineTessuto")}
        />
      </div>
    </div>
  );
};

export default ExportInfo;