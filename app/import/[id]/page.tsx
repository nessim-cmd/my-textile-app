"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchDeclaration = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/import/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`Failed to fetch declaration: ${response.statusText}`);
      const data = await response.json();
      console.log("Fetched declaration:", JSON.stringify(data, null, 2));
      setDeclaration(data);
      setInitialDeclaration(data);
    } catch (error) {
      console.error("Error fetching declaration:", error);
      setErrorMessage("Failed to fetch declaration. Please try again.");
    }
  };

  const fetchClients = async () => {
    try {
      const token = await getToken();
      const response = await fetch("/api/client", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setErrorMessage("Failed to fetch clients. Please try again.");
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchDeclaration();
      fetchClients();
    }
  }, [params.id]);

  useEffect(() => {
    setIsSaveDisabled(JSON.stringify(declaration) === JSON.stringify(initialDeclaration));
  }, [declaration, initialDeclaration]);

  useEffect(() => {
    console.log("Declaration state updated:", JSON.stringify(declaration, null, 2));
  }, [declaration]);

  const handleSave = async () => {
    if (!declaration) return;
    setIsLoading(true);
    setErrorMessage(null);

    // Prepare the declaration data, filtering out invalid accessories
    const declarationToSend = {
      ...declaration,
      valeur: Number(declaration.valeur) || 0,
      models: declaration.models
        .filter(model => model.name && typeof model.name === "string")
        .map(model => ({
          ...model,
          id: model.id.startsWith('temp-') ? undefined : model.id,
          name: model.name || "",
          commande: model.commande || "",
          description: model.description || "",
          quantityReçu: Number(model.quantityReçu) || 0,
          quantityTrouvee: Number(model.quantityTrouvee) || 0,
          accessories: model.accessories
            .filter(
              acc =>
                acc.reference_accessoire?.trim() &&
                acc.description?.trim() &&
                !isNaN(Number(acc.quantity_reçu)) &&
                !isNaN(Number(acc.quantity_trouve)) &&
                !isNaN(Number(acc.quantity_sortie))
            )
            .map(acc => {
              console.log("Preparing accessory for model", model.name, ":", JSON.stringify(acc, null, 2));
              return {
                ...acc,
                id: acc.id.startsWith('temp-') ? undefined : acc.id,
                reference_accessoire: acc.reference_accessoire || "",
                description: acc.description || "",
                quantity_reçu: Number(acc.quantity_reçu) || 0,
                quantity_trouve: Number(acc.quantity_trouve) || 0,
                quantity_sortie: Number(acc.quantity_sortie) || 0,
                quantity_manque: (Number(acc.quantity_trouve) || 0) - (Number(acc.quantity_reçu) || 0),
              };
            }),
        })),
    };

    console.log("Sending data to server:", JSON.stringify(declarationToSend, null, 2));

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

      // Log raw response for debugging
      const responseText = await response.text();
      console.log("Raw server response:", responseText, "Status:", response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (jsonError) {
          console.error("Failed to parse error response:", jsonError, "Raw text:", responseText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      let updatedData;
      try {
        updatedData = JSON.parse(responseText);
      } catch (jsonError) {
        console.error("Failed to parse response JSON:", jsonError, "Raw text:", responseText);
        throw new Error("Invalid server response: Unexpected end of JSON input");
      }

      console.log("Server response after save:", JSON.stringify(updatedData, null, 2));

      // Update state with server response
      setDeclaration(updatedData);
      setInitialDeclaration(updatedData);

      // Re-fetch to ensure consistency
      await fetchDeclaration();

      // Trigger refresh for Accessoires page
      window.dispatchEvent(new Event('declarationUpdated'));
    } catch (error) {
      console.error("Error saving declaration:", error);
      setErrorMessage("Failed to save declaration: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette déclaration ?");
    if (confirmed && declaration?.id) {
      try {
        const token = await getToken();
        await fetch(`/api/import/${declaration.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
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
      accessories: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      commande: "",
      description: "",
      quantityReçu: 0,
      quantityTrouvee: 0,
      livraisonEntreeId: "",
    };
    setDeclaration({
      ...declaration,
      models: [...declaration.models, newModel],
    });
  };

  const updateModel = (modelId: string, field: string, value: string) => {
    if (!declaration) return;
    setDeclaration({
      ...declaration,
      models: declaration.models.map(model =>
        model.id === modelId ? { ...model, [field]: value } : model
      ),
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: string) => {
    if (!declaration) return;
    const value = field === "valeur" ? parseFloat(e.target.value) || 0 : e.target.value;
    setDeclaration({ ...declaration, [field]: value });
  };

  if (!declaration)
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <span className="font-bold">Chargement de la déclaration...</span>
      </div>
    );

  return (
    <Wrapper>
      <div>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          <p className="badge badge-ghost badge-lg uppercase">
            <span>DEC-</span>{declaration.num_dec}
          </p>

          <div className="flex md:mt-0 mt-4">
            <button
              className="btn btn-sm btn-accent ml-4"
              disabled={isSaveDisabled || isLoading}
              onClick={handleSave}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  Sauvegarder
                  <Save className="w-4 ml-2" />
                </>
              )}
            </button>

            <button
              onClick={handleDelete}
              className="btn btn-sm btn-accent ml-4"
            >
              <Trash className="w-4" />
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="alert alert-error mb-4">{errorMessage}</div>
        )}

        <div className="flex flex-col md:flex-row w-full gap-4">
          <div className="w-full md:w-1/3 space-y-4">
            <div className="card bg-base-200 p-4">
              <h3 className="font-bold mb-2">Informations Générales</h3>
              <div className="space-y-2">
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
                    value={declaration.date_import ? new Date(declaration.date_import).toISOString().split("T")[0] : ""}
                    onChange={(e) => setDeclaration({ ...declaration, date_import: e.target.value })}
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
              <button onClick={addNewModel} className="btn btn-sm btn-accent w-full">
                <Plus className="w-4 mr-2" /> Ajouter Modèle
              </button>

              <div className="mt-4 space-y-2">
                {declaration.models.map(model => (
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
            <ImportLines declaration={declaration} setDeclaration={setDeclaration} />
          </div>
        </div>
      </div>
    </Wrapper>
  );
}