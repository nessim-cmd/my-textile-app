import { LivraisonEntree, Model } from "@/type";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

interface Props {
  livraisonEntree: LivraisonEntree;
  setLivraisonEntree: (livraisonEntree: LivraisonEntree) => void;
}

interface Client {
  id: string;
  name: string | null;
}

const LivraisonEntreeInfo: React.FC<Props> = ({ livraisonEntree, setLivraisonEntree }) => {
  const { getToken } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  // State for the formatted date input (dd/mm/yyyy)
  const [displayDate, setDisplayDate] = useState<string>("");

  // Helper function to format date to dd/mm/yyyy
  const formatDateToDDMMYYYY = (dateStr: string | null): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper function to parse dd/mm/yyyy to yyyy-mm-dd for storage
  const parseDDMMYYYYToISO = (dateStr: string): string => {
    if (!dateStr) return "";
    const [day, month, year] = dateStr.split("/");
    if (!day || !month || !year) return "";
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  // Initialize displayDate when livraisonEntree.livraisonDate changes
  useEffect(() => {
    setDisplayDate(formatDateToDDMMYYYY(livraisonEntree.livraisonDate));
  }, [livraisonEntree.livraisonDate]);

  // Fetch clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = await getToken();
        const response = await fetch("/api/client", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setClients(data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchClients();
  }, [getToken]);

  // Handle changes to general information fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: string) => {
    setLivraisonEntree({ ...livraisonEntree, [field]: e.target.value });
  };

  // Handle date input changes
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayDate(inputValue); // Update the display value as the user types

    // Validate and parse the date when it matches dd/mm/yyyy
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (dateRegex.test(inputValue)) {
      const isoDate = parseDDMMYYYYToISO(inputValue);
      if (isoDate && !isNaN(new Date(isoDate).getTime())) {
        setLivraisonEntree({ ...livraisonEntree, livraisonDate: isoDate });
      } else {
        setLivraisonEntree({ ...livraisonEntree, livraisonDate: null }); // Invalid date
      }
    } else {
      setLivraisonEntree({ ...livraisonEntree, livraisonDate: null }); // Incomplete or invalid format
    }
  };

  // Add a new model with a unique ID and empty name
  const addNewModel = () => {
    const newModel: Model = {
      id: `temp-${Date.now()}`,
      name: "",
      commande: "",
      description: "",
      quantityReçu: 0,
      quantityTrouvee: 0,
      livraisonEntreeId: livraisonEntree.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      accessories: [],
      declarationImportId: "",
    };
    setLivraisonEntree({
      ...livraisonEntree,
      models: [...livraisonEntree.models, newModel],
    });
  };

  // Update the name of all models that match the old name
  const updateModelName = (oldName: string, newName: string) => {
    setLivraisonEntree({
      ...livraisonEntree,
      models: livraisonEntree.models.map(model =>
        model.name === oldName ? { ...model, name: newName } : model
      ),
    });
  };

  // Calculate representative models for each unique name
  const uniqueNames = Array.from(new Set(livraisonEntree.models.map(model => model.name)));
  const representativeModels = uniqueNames
    .map(name => livraisonEntree.models.find(model => model.name === name))
    .filter((model): model is Model => model !== undefined);

  return (
    <div className="space-y-4">
      {/* General Information Section */}
      <div className="card bg-base-200 p-4">
        <h3 className="font-bold mb-2">Informations Générales</h3>
        <div className="space-y-2">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Nom</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={livraisonEntree.name || ""}
              onChange={(e) => handleInputChange(e, "name")}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Date de Livraison</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={displayDate}
              placeholder="dd/mm/yyyy"
              onChange={handleDateChange}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Client</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={livraisonEntree.clientName || ""}
              onChange={(e) => handleInputChange(e, "clientName")}
            >
              <option value="">Sélectionner un client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.name || ""}>{client.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Models Section */}
      <div className="card bg-base-200 p-4">
        <h3 className="font-bold mb-2">Modèles</h3>
        <button onClick={addNewModel} className="btn btn-sm btn-accent w-full">
          <Plus className="w-4 mr-2" /> Ajouter Modèle
        </button>
        <div className="mt-4 space-y-2">
          {representativeModels.map(repModel => (
            <div key={repModel.id} className="collapse collapse-arrow bg-base-100">
              <input type="checkbox" />
              <div className="collapse-title font-medium">
                {repModel.name || "Nouveau Modèle"}
              </div>
              <div className="collapse-content">
                <input
                  type="text"
                  placeholder="Nom du modèle"
                  className="input input-bordered w-full min-w-[200px]"
                  value={repModel.name}
                  onChange={(e) => updateModelName(repModel.name, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LivraisonEntreeInfo;