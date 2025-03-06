import { Livraison } from '@/type';
import { Plus, Trash } from 'lucide-react';
import React from 'react';

interface Props {
  livraison: Livraison;
  setLivraison: (livraison: Livraison) => void;
  clientModels?: ClientModel[];
}

interface ClientModel {
  id: string;
  name: string | null;
  clientId: string;
  commandes: string | null;
  description: string | null;
}

interface LivraisonLine {
  id: string;
  commande: string | null;
  modele: string;
  description: string | null;
  quantity: number | null;
  livraisonId: string;
  isExcluded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LivraisonLines: React.FC<Props> = ({ livraison, setLivraison, clientModels = [] }) => {
  const handleAddLine = () => {
    const newLine: LivraisonLine = {
      id: `${Date.now()}`,
      commande: null,
      modele: '',
      description: null,
      quantity: 1,
      livraisonId: livraison.id,
      isExcluded: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setLivraison({
      ...livraison,
      lines: [...livraison.lines, newLine],
    });
  };

  const handleCommandeChange = (index: number, value: string) => {
    const updatedLines = [...livraison.lines];
    updatedLines[index].commande = value || null;
    updatedLines[index].updatedAt = new Date();
    setLivraison({ ...livraison, lines: updatedLines });
  };

  const handleModeleChange = (index: number, value: string) => {
    const updatedLines = [...livraison.lines];
    const [modeleName, commande] = value.split('|');
    const selectedModel = clientModels.find(
      (model) => model.name === modeleName && (model.commandes?.split(',') || []).includes(commande)
    );
    updatedLines[index].modele = modeleName || '';
    updatedLines[index].commande = commande || null;
    updatedLines[index].description = selectedModel?.description || null;
    updatedLines[index].updatedAt = new Date();
    setLivraison({ ...livraison, lines: updatedLines });
  };

  const handleQuantityChange = (index: number, value: string) => {
    const updatedLines = [...livraison.lines];
    updatedLines[index].quantity = value === '' ? null : parseFloat(value);
    updatedLines[index].updatedAt = new Date();
    setLivraison({ ...livraison, lines: updatedLines });
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const updatedLines = [...livraison.lines];
    updatedLines[index].description = value || null;
    updatedLines[index].updatedAt = new Date();
    setLivraison({ ...livraison, lines: updatedLines });
  };

  const handleIsExcludedChange = (index: number, checked: boolean) => {
    const updatedLines = [...livraison.lines];
    updatedLines[index].isExcluded = checked;
    updatedLines[index].updatedAt = new Date();
    setLivraison({ ...livraison, lines: updatedLines });
  };

  const handleRemoveLine = (index: number) => {
    const updatedLines = livraison.lines.filter((_, i) => i !== index);
    setLivraison({ ...livraison, lines: updatedLines });
  };

  const modelCommandeOptions = clientModels.flatMap((model) => {
    const commandes = model.commandes ? model.commandes.split(',') : [];
    return commandes.map((cmd) => ({
      modelName: model.name || 'Unnamed Model',
      commande: cmd.trim(),
      description: model.description || null,
      key: `${model.id}|${cmd.trim()}`,
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {livraison.lines.map((line, index) => (
              <tr key={line.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={line.isExcluded || false}
                    onChange={(e) => handleIsExcludedChange(index, e.target.checked)}
                    className="checkbox checkbox-sm"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={line.commande || ''}
                    className="input input-sm input-bordered w-full"
                    onChange={(e) => handleCommandeChange(index, e.target.value)}
                  />
                </td>
                <td>
                  <select
                    value={line.modele && line.commande ? `${line.modele}|${line.commande}` : ''}
                    onChange={(e) => handleModeleChange(index, e.target.value)}
                    className="select select-sm select-bordered w-full max-h-select"
                    disabled={!livraison.clientName || clientModels.length === 0}
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
                    value={line.quantity ?? ''}
                    className="input input-sm input-bordered w-full"
                    min={0}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={line.description || ''}
                    className="input input-sm input-bordered w-full"
                    onChange={(e) => handleDescriptionChange(index, e.target.value)}
                  />
                </td>
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

export default LivraisonLines;