import { DeclarationExport, ExportLine } from "@/type";
import { Plus, Trash } from "lucide-react";
import React from "react";

interface Props {
  declaration: DeclarationExport;
  setDeclaration: (declaration: DeclarationExport) => void;
  clientModels?: ClientModel[];
}

interface ClientModel {
  id: string;
  name: string | null;
  clientId: string;
  commandes: string; // Comma-separated string, e.g., "com11,com22"
  description: string;
}

const ExportLines: React.FC<Props> = ({ declaration, setDeclaration, clientModels = [] }) => {
  const handleAddLine = () => {
    const newLine: ExportLine = {
      id: `${Date.now()}`,
      commande: "",
      modele: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      isExcluded: false,
      exportId: declaration.id,
    };
    setDeclaration({
      ...declaration,
      lines: [...declaration.lines, newLine],
    });
  };

  const handleCommandeChange = (index: number, value: string) => {
    const updatedLines = [...declaration.lines];
    updatedLines[index].commande = value;
    setDeclaration({ ...declaration, lines: updatedLines });
  };

  const handleModeleChange = (index: number, value: string) => {
    const updatedLines = [...declaration.lines];
    const [modeleName, commande] = value.split('|'); // e.g., "mod123|com11"
    const selectedModel = clientModels.find(
      (model) => model.name === modeleName && (model.commandes?.split(',') || []).includes(commande)
    );
    updatedLines[index].modele = modeleName || '';
    updatedLines[index].commande = commande || ''; // Set only the selected commande
    updatedLines[index].description = selectedModel?.description || '';
    setDeclaration({ ...declaration, lines: updatedLines });
  };

  const handleQuantityChange = (index: number, value: string) => {
    const updatedLines = [...declaration.lines];
    updatedLines[index].quantity = value === "" ? 0 : parseInt(value);
    setDeclaration({ ...declaration, lines: updatedLines });
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const updatedLines = [...declaration.lines];
    updatedLines[index].description = value;
    setDeclaration({ ...declaration, lines: updatedLines });
  };

  const handleUnitPriceChange = (index: number, value: string) => {
    const updatedLines = [...declaration.lines];
    updatedLines[index].unitPrice = value === "" ? 0 : parseFloat(value);
    setDeclaration({ ...declaration, lines: updatedLines });
  };

  const handleExcludeChange = (index: number, checked: boolean) => {
    const updatedLines = [...declaration.lines];
    updatedLines[index].isExcluded = checked;
    setDeclaration({ ...declaration, lines: updatedLines });
  };

  const handleRemoveLine = (index: number) => {
    const updatedLines = declaration.lines.filter((_, i) => i !== index);
    setDeclaration({ ...declaration, lines: updatedLines });
  };

  // Generate model-commande pairs for the dropdown
  const modelCommandeOptions = clientModels.flatMap((model) => {
    const commandes = model.commandes ? model.commandes.split(',') : [];
    return commandes.map((cmd) => ({
      modelName: model.name || 'Unnamed Model',
      commande: cmd.trim(),
      description: model.description || '',
      key: `${model.id}|${cmd.trim()}`, // Unique key for each pair
    }));
  });

  return (
    <div className="h-fit bg-base-200 p-5 rounded-xl w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="badge badge-accent">Produits</h2>
        <button className="btn btn-sm btn-accent" onClick={handleAddLine}>
          <Plus className="w-4" />
        </button>
      </div>
      <div className="scrollable">
        <table className="table w-full">
          <thead className="uppercase">
            <tr>
              <th>Exclure</th>
              <th>Commande</th>
              <th>Modèle</th>
              <th>Quantité</th>
              <th>Description</th>
              <th>Prix Unitaire (HT)</th>
              <th>Montant (HT)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {declaration.lines.map((line, index) => (
              <tr key={line.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={line.isExcluded}
                    onChange={(e) => handleExcludeChange(index, e.target.checked)}
                    className="checkbox checkbox-sm"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={line.commande}
                    className="input input-sm input-bordered w-full"
                    onChange={(e) => handleCommandeChange(index, e.target.value)}
                  />
                </td>
                <td>
                  <select
                    value={line.modele && line.commande ? `${line.modele}|${line.commande}` : ''}
                    onChange={(e) => handleModeleChange(index, e.target.value)}
                    className="select select-sm select-bordered w-full max-h-40"
                    disabled={!declaration.clientName || clientModels.length === 0}
                  >
                    <option value="">Sélectionner un modèle</option>
                    {modelCommandeOptions.map((option) => (
                      <option 
                        key={option.key} 
                        value={`${option.modelName}|${option.commande}`}
                      >
                        {option.modelName} ({option.commande})
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    value={line.quantity}
                    className="input input-sm input-bordered w-full"
                    min={0}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={line.description}
                    className="input input-sm input-bordered w-full"
                    onChange={(e) => handleDescriptionChange(index, e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={line.unitPrice}
                    className="input input-sm input-bordered w-full"
                    min={0}
                    step={0.01}
                    onChange={(e) => handleUnitPriceChange(index, e.target.value)}
                  />
                </td>
                <td className="font-bold">{(line.quantity * line.unitPrice).toFixed(2)} €</td>
                <td>
                  <button
                    onClick={() => handleRemoveLine(index)}
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
    </div>
  );
};

export default ExportLines;