/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Wrapper from '@/components/Wrapper';
import { useAuth, useUser } from "@clerk/nextjs"; // Ensure useUser is included
import { useCallback, useEffect, useState } from 'react';
import { Plus, Search, Eye, Trash, SquareArrowOutUpRight } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import * as Dialog from '@radix-ui/react-dialog';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Client {
  id: string;
  name: string;
}

interface Variant {
  id?: string;
  name: string;
  qte_variante: number;
}

interface Commande {
  value: string;
  variants: Variant[];
}

interface ClientModel {
  id: string;
  name: string;
  commandesWithVariants: Commande[];
  clientId: string;
  client: Client;
  variants: Variant[];
}

interface CoupeEntry {
  day: string;
  category: string;
  week: string;
  quantityCreated: number;
}

interface FicheCoupe {
  id: string;
  clientId: string;
  modelId: string;
  commande: string;
  quantity: number;
  coupe: CoupeEntry[];
  createdAt: string;
}

const FicheCard: React.FC<{
  fiche: FicheCoupe;
  onDetails: (id: string) => void;
  onDelete: (id: string) => void;
  models: ClientModel[];
}> = ({ fiche, onDetails, onDelete, models }) => {
  const model = models.find((m) => m.id === fiche.modelId);
  const totalProcessed = fiche.coupe.reduce((sum, entry) => sum + entry.quantityCreated, 0);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this fiche? This action cannot be undone.')) {
      onDelete(fiche.id);
    }
  };

  return (
    <div className="bg-base-200/90 p-4 rounded-xl shadow space-y-2">
      <div className="flex justify-between items-center">
        <div className="font-bold text-accent">{model?.name || 'Unknown'} ({fiche.commande})</div>
        <div className="flex gap-2">
          <Link href={`/fiche-coupe/${fiche.id}`} className="btn btn-accent btn-sm">
            <SquareArrowOutUpRight className="w-4 h-4" />
          </Link>
          <button className="btn btn-info btn-sm" onClick={() => onDetails(fiche.id)}>
            <Eye className="w-4 h-4" />
          </button>
          <button className="btn btn-error btn-sm" onClick={handleDelete}>
            <Trash className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div>
        <div className="stat-title uppercase text-sm">FICHE-{fiche.id.slice(0, 3)}</div>
        <div className="stat-value">Qte = {fiche.quantity}</div>
        <div className="stat-desc">qte Ordered</div>
      </div>
    </div>
  );
};

export default function FicheCoupePage() {
  const { getToken } = useAuth();
  const { user } = useUser(); // Added to get the user's email
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [models, setModels] = useState<ClientModel[]>([]);
  const [fiches, setFiches] = useState<FicheCoupe[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [selectedCommande, setSelectedCommande] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDetailsFiche, setSelectedDetailsFiche] = useState<FicheCoupe | null>(null);
  const [availableCommandes, setAvailableCommandes] = useState<Commande[]>([]);

  const fetchClients = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch('/api/client', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch clients');
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      setError('Failed to fetch clients');
      console.error(error);
      setClients([]);
    }
  }, [getToken]);

  const fetchModels = useCallback(async (clientName?: string) => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      setError("User email not available");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const email = encodeURIComponent(user.primaryEmailAddress.emailAddress);
      const url = clientName 
        ? `/api/client-model?email=${email}&client=${encodeURIComponent(clientName)}` 
        : `/api/client-model?email=${email}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to fetch models: ${errorData.error || res.statusText}`);
      }
      const data = await res.json();
      setModels(Array.isArray(data) ? data : []);
      setSelectedModelId('');
      setAvailableCommandes([]);
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch models');
      console.error(err);
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, [getToken, user]); // Added user to dependencies

  const fetchFiches = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/fiche-coupe', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch fiches');
      const data = await res.json();
      setFiches(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch fiches');
      console.error(err);
      setFiches([]);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const handleDeleteFiche = async (ficheId: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/fiche-coupe/${ficheId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to delete fiche: ${errorData.error || res.statusText}`);
      }
      await fetchFiches();
      toast.success('Fiche deleted successfully!');
    } catch (error) {
      console.error('Error deleting fiche:', error);
      toast.error(`Failed to delete fiche: ${(error as Error).message}`);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchFiches();
  }, [fetchClients, fetchFiches]);

  useEffect(() => {
    if (selectedClientId) {
      const selectedClient = clients.find(c => c.id === selectedClientId);
      if (selectedClient) fetchModels(selectedClient.name);
    } else {
      setModels([]);
      setSelectedModelId('');
      setAvailableCommandes([]);
    }
  }, [selectedClientId, fetchModels, clients]);

  const handleModelChange = (value: string) => {
    const modelId = value;
    const selectedModel = models.find((m) => m.id === modelId);
    if (selectedModel) {
      setSelectedModelId(modelId);
      setAvailableCommandes(selectedModel.commandesWithVariants);
      setSelectedCommande('');
      setQuantity(0);
    }
  };

  const handleCommandeChange = (value: string) => {
    setSelectedCommande(value);
    const selectedModel = models.find((m) => m.id === selectedModelId);
    if (selectedModel) {
      const selectedCmd = selectedModel.commandesWithVariants.find((c) => c.value === value);
      const totalQuantity = selectedCmd && Array.isArray(selectedCmd.variants)
        ? selectedCmd.variants.reduce((sum, v) => sum + (v.qte_variante || 0), 0)
        : 0;
      setQuantity(totalQuantity);
    }
  };

  const handleCreateFiche = async () => {
    if (!selectedClientId || !selectedModelId || !selectedCommande) {
      setError('Please select a client, model, and commande');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const payload = {
        clientId: selectedClientId,
        modelId: selectedModelId,
        commande: selectedCommande,
        quantity,
        coupe: [],
      };
      const res = await fetch('/api/fiche-coupe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create fiche');
      }
      const newFiche = await res.json();
      await fetchFiches();
      setIsCreateModalOpen(false);
      toast.success('Fiche created successfully!');
      router.push(`/fiche-coupe/${newFiche.id}`); // Redirect to detail page
    } catch (err) {
      console.error(err);
      setError('Failed to create fiche');
      toast.error('Failed to create fiche');
    } finally {
      setLoading(false);
    }
  };

  const handleFicheDetails = (ficheId: string) => {
    const fiche = fiches.find((f) => f.id === ficheId);
    if (fiche) {
      setSelectedDetailsFiche(fiche);
      setIsDetailsModalOpen(true);
    }
  };

  return (
    <Wrapper>
      <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { zIndex: 9999 } }} />
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Fiche Coupe</h1>

        <div className="flex flex-col gap-6">
          <div className="space-y-4">
            <Dialog.Root open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <Dialog.Trigger asChild>
                <button className="btn btn-primary flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" /> New Fiche
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md">
                  <Dialog.Title className="font-bold text-lg mb-4 text-center">Create New Fiche</Dialog.Title>
                  {error && <div className="alert alert-error mb-4">{error}</div>}
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 font-semibold">Client</label>
                      <select
                        className="select select-bordered w-full"
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                      >
                        <option value="">Select a client</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2 font-semibold">Model</label>
                      <select
                        className="select select-bordered w-full"
                        value={selectedModelId}
                        onChange={(e) => handleModelChange(e.target.value)}
                        disabled={!selectedClientId || loading || !models.length}
                      >
                        <option value="">Select a model</option>
                        {models.map((model) => (
                          <option key={model.id} value={model.id}>{model.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2 font-semibold">Commande</label>
                      <select
                        className="select select-bordered w-full"
                        value={selectedCommande}
                        onChange={(e) => handleCommandeChange(e.target.value)}
                        disabled={!selectedModelId || !availableCommandes.length}
                      >
                        <option value="">Select a commande</option>
                        {availableCommandes.map((cmd) => (
                          <option key={cmd.value} value={cmd.value}>{cmd.value}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2 font-semibold">Quantity</label>
                      <input type="number" className="input input-bordered w-full" value={quantity} readOnly />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <Dialog.Close asChild>
                      <button className="btn">Cancel</button>
                    </Dialog.Close>
                    <button className="btn btn-primary" onClick={handleCreateFiche} disabled={loading}>
                      {loading ? <span className="loading loading-spinner"></span> : 'Create'}
                    </button>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search fiches by model or commande"
                className="rounded-xl p-2 bg-gray-200 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-primary btn-sm">
                <Search className="w-5 h-5" />
              </button>
            </div>

            <div className="grid gap-4">
              {loading && !fiches.length ? (
                <div className="text-center"><span className="loading loading-dots loading-lg"></span></div>
              ) : fiches.length > 0 ? (
                fiches.filter((fiche) => {
                  const modelName = models.find((m) => m.id === fiche.modelId)?.name || '';
                  return (
                    modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    fiche.commande.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    fiche.id.toLowerCase().includes(searchTerm.toLowerCase())
                  );
                }).map((fiche) => (
                  <FicheCard
                    key={fiche.id}
                    fiche={fiche}
                    onDetails={handleFicheDetails}
                    onDelete={handleDeleteFiche}
                    models={models}
                  />
                ))
              ) : (
                <div className="text-center">No fiches found</div>
              )}
            </div>
          </div>
        </div>

        {/* Details Modal */}
        <Dialog.Root open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-4xl">
              <Dialog.Title className="font-bold text-lg mb-4">Fiche Details</Dialog.Title>
              {selectedDetailsFiche && (
                <div className="space-y-4">
                  <p><strong>ID:</strong> {selectedDetailsFiche.id}</p>
                  <p><strong>Client:</strong> {clients.find(c => c.id === selectedDetailsFiche.clientId)?.name || 'Unknown'}</p>
                  <p><strong>Model:</strong> {models.find(m => m.id === selectedDetailsFiche.modelId)?.name || 'Unknown'}</p>
                  <p><strong>Commande:</strong> {selectedDetailsFiche.commande}</p>
                  <p><strong>Quantity Ordered:</strong> {selectedDetailsFiche.quantity}</p>
                  <p><strong>Total Processed:</strong> {selectedDetailsFiche.coupe.reduce((sum, entry) => sum + entry.quantityCreated, 0)}</p>
                  <div>
                    <h4 className="font-semibold">Coupe Entries:</h4>
                    <div className="overflow-x-auto">
                      <div className="max-h-[300px] overflow-y-auto">
                        <table className="table table-zebra w-full">
                          <thead className="sticky top-0 bg-white">
                            <tr>
                              <th>Week</th>
                              <th>Day</th>
                              <th>Category</th>
                              <th>Quantity Created</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedDetailsFiche.coupe.map((entry, index) => (
                              <tr key={index}>
                                <td>{entry.week}</td>
                                <td>{entry.day}</td>
                                <td>{entry.category}</td>
                                <td>{entry.quantityCreated}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-6 flex justify-end">
                <Dialog.Close asChild>
                  <button className="btn">Close</button>
                </Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </Wrapper>
  );
}