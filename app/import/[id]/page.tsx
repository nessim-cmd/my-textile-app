"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Save, Trash, Plus } from "lucide-react";
import { DeclarationImport, Model } from "@/type";
import Wrapper from "@/components/Wrapper";
import ImportLines from "@/components/ImportLines";
import { useAuth } from "@clerk/nextjs";

interface Client {
  id: string;
  name: string;
}

export default function ImportDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { getToken } = useAuth();
  const [declaration, setDeclaration] = useState<DeclarationImport | null>(null);
  const [initialDeclaration, setInitialDeclaration] = useState<DeclarationImport | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchDeclaration = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const token = await getToken();
      const response = await fetch(`/api/import/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Failed to fetch declaration: ${response.status}`);
      const data: DeclarationImport = await response.json();
      setDeclaration(data);
      setInitialDeclaration(data);
    } catch (error) {
      console.error("Error fetching declaration:", error);
      setErrorMessage("Failed to fetch declaration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [params.id, getToken]);

  const fetchClients = useCallback(async () => {
    try {
      const token = await getToken();
      const response = await fetch("/api/client", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data: Client[] = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setErrorMessage("Failed to fetch clients. Please try again.");
    }
  }, [getToken]);

  useEffect(() => {
    if (params.id) {
      fetchDeclaration();
      fetchClients();
    }
  }, [params.id, fetchDeclaration, fetchClients]);

  useEffect(() => {
    setIsSaveDisabled(JSON.stringify(declaration) === JSON.stringify(initialDeclaration));
  }, [declaration, initialDeclaration]);

  const handleSave = async () => {
    if (!declaration) return;
    setIsLoading(true);
    setErrorMessage(null);

    const declarationToSend = {
      ...declaration,
      models: declaration.models.map((model) => ({
        ...model,
        id: model.id.startsWith("temp-") ? undefined : model.id,
        accessories: model.accessories.map((acc) => ({
          ...acc,
          id: acc.id.startsWith("temp-") ? undefined : acc.id,
          modelId: model.id,
          quantity_manque: (acc.quantity_trouve || 0) - (acc.quantity_reçu || 0),
        })),
      })),
    };

    try {
      const token = await getToken();
      const response = await fetch(`/api/import/${declaration.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(declarationToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update declaration");
      }

      await fetchDeclaration();
    } catch (error) {
      console.error("Error saving declaration:", error);
      setErrorMessage(`Failed to save declaration: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    // Escaped quotes in the confirmation message
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette déclaration ?");
    if (confirmed && declaration?.id) {
      setErrorMessage(null);
      try {
        const token = await getToken();
        const response = await fetch(`/api/import/${declaration.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to delete declaration");
        router.push("/import");
      } catch (error) {
        console.error("Error deleting declaration:", error);
        setErrorMessage("Failed to delete declaration. Please try again.");
      }
    }
  };

  const addNewModel = () => {
    if (!declaration) return;
    const newModel: Model = {
      id: `temp-${Date.now()}`,
      name: "",
      declarationImportId: declaration.id,
      livraisonEntreeId: "",
      commande: "",
      description: "",
      quantityReçu: 0,
      quantityTrouvee: 0,
      accessories: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDeclaration({
      ...declaration,
      models: [...declaration.models, newModel],
    });
  };

  const updateModel = (modelId: string, field: keyof Model, value: string) => {
    if (!declaration) return;
    setDeclaration({
      ...declaration,
      models: declaration.models.map((model) =>
        model.id === modelId ? { ...model, [field]: value } : model
      ),
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof DeclarationImport
  ) => {
    if (!declaration) return;
    const value = field === "valeur" ? parseFloat(e.target.value) || 0 : e.target.value;
    setDeclaration({ ...declaration, [field]: value });
  };

  if (isLoading || !declaration) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <span className="font-bold">Chargement de la déclaration...</span>
      </div>
    );
  }

  return (
    <Wrapper>
      <div>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          <p className="badge badge-ghost badge-lg uppercase">
            <span>DEC-</span>
            {declaration.num_dec}
          </p>
          <div className="flex md:mt-0 mt-4 gap-4">
            <button
              className="btn btn-sm btn-accent flex items-center gap-2"
              disabled={isSaveDisabled || isLoading}
              onClick={handleSave}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  Sauvegarder
                  <Save className="w-4" />
                </>
              )}
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-sm btn-accent flex items-center gap-2"
            >
              <Trash className="w-4" />
              Supprimer
            </button>
          </div>
        </div>

        {errorMessage && <div className="alert alert-error mb-4">{errorMessage}</div>}

        <div className="flex flex-col md:flex-row w-full gap-4">
          <div className="w-full md:w-1/3 space-y-4">
            <div className="card bg-base-200 p-4">
              <h3 className="font-bold mb-2">Informations Générales</h3>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Numéro DEC</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={declaration.num_dec}
                    onChange={(e) => handleInputChange(e, "num_dec")}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Date d'Import</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered"
                    value={
                      declaration.date_import
                        ? new Date(declaration.date_import).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setDeclaration({ ...declaration, date_import: e.target.value })
                    }
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Client</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={declaration.client}
                    onChange={(e) => handleInputChange(e, "client")}
                  >
                    <option value="">Sélectionner un client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.name}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Valeur (€)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input input-bordered"
                    value={declaration.valeur}
                    onChange={(e) => handleInputChange(e, "valeur")}
                  />
                </div>
              </div>
            </div>
            <div className="card bg-base-200 p-4">
              <h3 className="font-bold mb-2">Modèles</h3>
              <button
                onClick={addNewModel}
                className="btn btn-sm btn-accent w-full flex items-center gap-2"
              >
                <Plus className="w-4" />
                Ajouter Modèle
              </button>
              <div className="mt-4 space-y-2">
                {declaration.models.map((model) => (
                  <div key={model.id} className="collapse collapse-arrow bg-base-100">
                    <input type="checkbox" />
                    <div className="collapse-title font-medium">
                      {model.name || "Nouveau Modèle"}
                    </div>
                    <div className="collapse-content">
                      <input
                        type="text"
                        placeholder="Nom du modèle"
                        className="input input-bordered w-full"
                        value={model.name}
                        onChange={(e) => updateModel(model.id, "name", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full md:w-2/3">
            <ImportLines
              key={declaration.id}
              declaration={declaration}
              setDeclaration={setDeclaration}
            />
          </div>
        </div>
      </div>
    </Wrapper>
  );
}