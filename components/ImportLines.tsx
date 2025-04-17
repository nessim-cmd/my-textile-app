import { DeclarationImport, Accessoire } from "@/type";
import { Plus, AlertTriangle, Trash } from "lucide-react";
import React, { useEffect } from "react";

interface Props {
  declaration: DeclarationImport;
  setDeclaration: (declaration: DeclarationImport) => void;
}

const ImportLines: React.FC<Props> = ({ declaration, setDeclaration }) => {
  // Debug declaration prop
  useEffect(() => {
    console.log("ImportLines declaration prop:", JSON.stringify(declaration, null, 2));
  }, [declaration]);

  const updateAccessoire = (modelId: string, accId: string, field: string, value: string | number) => {
    if (!declaration) return;
    setDeclaration({
      ...declaration,
      models: declaration.models.map(model => {
        if (model.id !== modelId) return model;
        return {
          ...model,
          accessories: model.accessories.map(acc =>
            acc.id === accId ? { ...acc, [field]: value } : acc
          ),
        };
      }),
    });
  };

  const addAccessoireToModel = (modelId: string) => {
    if (!declaration) return;
    setDeclaration({
      ...declaration,
      models: declaration.models.map(model => {
        if (model.id !== modelId) return model;
        const newAccessoire: Accessoire = {
          id: `temp-acc-${Date.now()}`,
          reference_accessoire: "",
          description: "",
          quantity_reçu: 0,
          quantity_trouve: 0,
          quantity_sortie: 0,
          quantity_manque: 0,
          modelId: modelId,
          name: ""
        };
        return {
          ...model,
          accessories: [...model.accessories, newAccessoire],
        };
      }),
    });
  };

  const deleteAccessoire = (modelId: string, accId: string) => {
    if (!declaration) return;
    setDeclaration({
      ...declaration,
      models: declaration.models.map(model => {
        if (model.id !== modelId) return model;
        return {
          ...model,
          accessories: model.accessories.filter(acc => acc.id !== accId),
        };
      }),
    });
  };

  const handleQuantityChange = (
    modelId: string,
    accId: string,
    field: "quantity_reçu" | "quantity_trouve",
    value: string
  ) => {
    const parsedValue = value === "" ? 0 : parseFloat(value);
    const newValue = isNaN(parsedValue) ? 0 : parsedValue;

    setDeclaration({
      ...declaration,
      models: declaration.models.map(model => {
        if (model.id !== modelId) return model;
        const updatedAccessories = model.accessories.map(acc => {
          if (acc.id !== accId) return acc;
          const updatedAcc = { ...acc, [field]: newValue };
          const newQuantityManque = updatedAcc.quantity_trouve - updatedAcc.quantity_reçu;
          return { ...updatedAcc, quantity_manque: newQuantityManque };
        });
        return { ...model, accessories: updatedAccessories };
      }),
    });
  };

  return (
    <div className="card bg-base-200 p-4">
      <h3 className="font-bold mb-4">Accessoires</h3>

      {declaration.models.map(model => (
        model.accessories.length > 0 ? (
          <div key={model.id} className="mb-6">
            <h4 className="font-semibold mb-2">{model.name || "Modèle Sans Nom"}</h4>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Description</th>
                    <th>Quantité Reçue</th>
                    <th>Quantité Trouvée</th>
                    <th>Quantité Manquante</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {model.accessories.map(acc => (
                    <tr key={acc.id}>
                      <td>
                        <input
                          type="text"
                          className="input input-bordered input-sm"
                          value={acc.reference_accessoire}
                          onChange={(e) => updateAccessoire(model.id, acc.id, "reference_accessoire", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="input input-bordered input-sm"
                          value={acc.description}
                          onChange={(e) => updateAccessoire(model.id, acc.id, "description", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="input input-bordered input-sm w-20"
                          value={acc.quantity_reçu ?? 0}
                          onChange={(e) => handleQuantityChange(model.id, acc.id, "quantity_reçu", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="input input-bordered input-sm w-20"
                          value={acc.quantity_trouve ?? 0}
                          onChange={(e) => handleQuantityChange(model.id, acc.id, "quantity_trouve", e.target.value)}
                        />
                      </td>
                      <td>
                        <div className="flex items-center">
                          <span>{(acc.quantity_trouve - acc.quantity_reçu).toFixed(2)}</span>
                          {(acc.quantity_trouve - acc.quantity_reçu) < 0 && (
                            <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />
                          )}
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => deleteAccessoire(model.id, acc.id)}
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
              onClick={() => addAccessoireToModel(model.id)}
              className="btn btn-xs btn-accent mt-2"
            >
              <Plus className="w-3 h-3" /> Accessoire
            </button>
          </div>
        ) : (
          <div key={model.id} className="mb-6">
            <h4 className="font-semibold mb-2">{model.name || "Modèle Sans Nom"}</h4>
            <button
              onClick={() => addAccessoireToModel(model.id)}
              className="btn btn-xs btn-accent mt-2"
            >
              <Plus className="w-3 h-3" /> Accessoire
            </button>
          </div>
        )
      ))}
    </div>
  );
};

export default ImportLines;