import { LivraisonEntree, Model } from "@/type";
import { Plus, AlertTriangle, Trash } from "lucide-react";
import React from "react";

interface Props {
  livraisonEntree: LivraisonEntree;
  setLivraisonEntree: (livraisonEntree: LivraisonEntree) => void;
}

const LivraisonEntreeLines: React.FC<Props> = ({ livraisonEntree, setLivraisonEntree }) => {
  const updateModel = (modelId: string, field: string, value: string | number) => {
    setLivraisonEntree({
      ...livraisonEntree,
      models: livraisonEntree.models.map(model =>
        model.id === modelId ? { ...model, [field]: value } : model
      ),
    });
  };

  const deleteModel = (modelId: string) => {
    setLivraisonEntree({
      ...livraisonEntree,
      models: livraisonEntree.models.filter(model => model.id !== modelId),
    });
  };

  const addLineToModel = (modelName: string) => {
    const newModel: Model = {
      id: `temp-${Date.now()}`,
      name: modelName, // Keep the same name for grouping
      commande: "",
      description: "",
      quantityReçu: 0,
      quantityTrouvee: 0,
      livraisonEntreeId: livraisonEntree.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      accessories: []
    };
    setLivraisonEntree({
      ...livraisonEntree,
      models: [...livraisonEntree.models, newModel],
    });
  };

  const handleQuantityChange = (
    modelId: string,
    field: "quantityReçu" | "quantityTrouvee",
    value: string
  ) => {
    const parsedValue = value === "" ? 0 : parseFloat(value);
    const newValue = isNaN(parsedValue) ? 0 : parsedValue;

    setLivraisonEntree({
      ...livraisonEntree,
      models: livraisonEntree.models.map(model =>
        model.id === modelId ? { ...model, [field]: newValue } : model
      ),
    });
  };

  // Group models by name
  const groupedModels: { [key: string]: Model[] } = {};
  livraisonEntree.models.forEach(model => {
    const name = model.name || "Modèle Sans Nom";
    if (!groupedModels[name]) {
      groupedModels[name] = [];
    }
    groupedModels[name].push(model);
  });

  return (
    <div className="card bg-base-200 p-4">
      <h3 className="font-bold mb-4">Détails des Modèles</h3>

      {Object.entries(groupedModels).map(([modelName, models]) => (
        <div key={modelName} className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">{modelName}</h4>
            {/* Delete button removed from here since we have per-line deletion */}
          </div>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Commande</th>
                  <th>Description</th>
                  <th>Quantité Reçue</th>
                  <th>Quantité Trouvée</th>
                  <th>Quantité Manquante</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {models.map(model => (
                  <tr key={model.id}>
                    <td>
                      <input
                        type="text"
                        className="input input-bordered input-sm"
                        value={model.commande || ""}
                        onChange={(e) => updateModel(model.id, "commande", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="input input-bordered input-sm"
                        value={model.description || ""}
                        onChange={(e) => updateModel(model.id, "description", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="input input-bordered input-sm w-20"
                        value={model.quantityReçu ?? 0}
                        onChange={(e) => handleQuantityChange(model.id, "quantityReçu", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="input input-bordered input-sm w-20"
                        value={model.quantityTrouvee ?? 0}
                        onChange={(e) => handleQuantityChange(model.id, "quantityTrouvee", e.target.value)}
                      />
                    </td>
                    <td>
                      <div className="flex items-center">
                        <span>{((model.quantityTrouvee || 0) - (model.quantityReçu || 0)).toFixed(2)}</span>
                        {((model.quantityTrouvee || 0) - (model.quantityReçu || 0)) < 0 && (
                          <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => deleteModel(model.id)}
                        className="btn btn-sm btn-circle btn-accent"
                      >
                        <Trash className="w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={() => addLineToModel(modelName)}
            className="btn btn-xs btn-accent mt-2"
          >
            <Plus className="w-3 h-3" /> Ligne
          </button>
        </div>
      ))}
    </div>
  );
};

export default LivraisonEntreeLines;