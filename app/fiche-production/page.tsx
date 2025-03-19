"use client";

import Wrapper from '@/components/Wrapper';
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, Eye, Trash } from 'lucide-react';
import ProductionTable from './ProductionTable';
import { Toaster, toast } from 'react-hot-toast';
import * as Dialog from '@radix-ui/react-dialog';

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

interface ProductionEntry {
  day: string;
  hour: string;
  week: string;
  quantityCreated: number;
}

interface FicheProduction {
  id: string;
  clientId: string;
  modelId: string;
  commande: string;
  quantity: number;
  production: ProductionEntry[];
  createdAt: string;
}

const FicheCard: React.FC<{
  fiche: FicheProduction;
  onSelect: (id: string) => void;
  onDetails: (id: string) => void;
  onDelete: (id: string) => void;
  models: ClientModel[];
}> = ({ fiche, onSelect, onDetails, onDelete, models }) => {
  const model = models.find((m) => m.id === fiche.modelId);
  const totalSewn = fiche.production.reduce((sum, entry) => sum + entry.quantityCreated, 0);

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
          <button className="btn btn-accent btn-sm" onClick={() => onSelect(fiche.id)}>
            Edit
          </button>
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
        <div className="stat-value">{totalSewn} / {fiche.quantity}</div>
        <div className="stat-desc">Total Sewn / Ordered</div>
      </div>
    </div>
  );
};

export default function FicheProductionPage() {
  const { getToken } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [models, setModels] = useState<ClientModel[]>([]);
  const [fiches, setFiches] = useState<FicheProduction[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [selectedCommande, setSelectedCommande] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [productionData, setProductionData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFicheId, setSelectedFicheId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDetailsFiche, setSelectedDetailsFiche] = useState<FicheProduction | null>(null);
  const [currentWeek, setCurrentWeek] = useState<string>('Week 1');
  const [availableCommandes, setAvailableCommandes] = useState<Commande[]>([]);
  const itemsPerPage = 3;

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
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const url = clientName ? `/api/client-model?client=${clientName}` : '/api/client-model';
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch models');
      const data = await res.json();
      setModels(Array.isArray(data) ? data : []);
      setSelectedModelId(''); // Reset model selection
      setAvailableCommandes([]); // Reset commandes
    } catch (err) {
      setError('Failed to fetch models');
      console.error(err);
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const fetchFiches = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/fiche-production', {
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
      const res = await fetch('/api/fiche-production', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: ficheId }),
      });
      if (!res.ok) throw new Error('Failed to delete fiche');
      await fetchFiches();
      toast.success('Fiche deleted successfully!');
      if (selectedFicheId === ficheId) {
        setSelectedFicheId(null);
        setSelectedClientId('');
        setSelectedModelId('');
        setSelectedCommande('');
        setQuantity(0);
        setProductionData({});
      }
    } catch (error) {
      console.error('Error deleting fiche:', error);
      toast.error('Failed to delete fiche');
    }
  };

  useEffect(() => {
    fetchClients();
    fetchFiches();
  }, [fetchClients, fetchFiches]);

  useEffect(() => {
    if (selectedClientId) {
      const selectedClient = clients.find(c => c.id === selectedClientId);
      if (selectedClient) {
        fetchModels(selectedClient.name); // Pass client name instead of clientId
      }
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
      setAvailableCommandes(selectedModel.commandesWithVariants); // Set commandes for the selected model
      setSelectedCommande(''); // Reset commande selection
      setQuantity(0); // Reset quantity until a commande is selected
      setProductionData({});
      setCurrentWeek('Week 1');

      const existingFiche = fiches.find((f) => f.modelId === modelId && f.commande === selectedCommande);
      if (existingFiche) {
        setSelectedFicheId(existingFiche.id);
        const newProductionData = existingFiche.production.reduce((acc, entry) => {
          acc[`${entry.week}-${entry.day}-${entry.hour}`] = entry.quantityCreated;
          return acc;
        }, {} as Record<string, number>);
        setProductionData(newProductionData);
      } else {
        setSelectedFicheId(null);
      }
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
      setProductionData({});
      setCurrentWeek('Week 1');

      const existingFiche = fiches.find((f) => f.modelId === selectedModelId && f.commande === value);
      if (existingFiche) {
        setSelectedFicheId(existingFiche.id);
        const newProductionData = existingFiche.production.reduce((acc, entry) => {
          acc[`${entry.week}-${entry.day}-${entry.hour}`] = entry.quantityCreated;
          return acc;
        }, {} as Record<string, number>);
        setProductionData(newProductionData);
      } else {
        setSelectedFicheId(null);
      }
    }
  };

  const handleFicheSelect = (ficheId: string) => {
    const fiche = fiches.find((f) => f.id === ficheId);
    if (fiche) {
      setSelectedFicheId(ficheId);
      setSelectedClientId(fiche.clientId);
      setSelectedModelId(fiche.modelId);
      setSelectedCommande(fiche.commande);
      setQuantity(fiche.quantity);
      setCurrentWeek('Week 1');
      const newProductionData = fiche.production.reduce((acc, entry) => {
        acc[`${entry.week}-${entry.day}-${entry.hour}`] = entry.quantityCreated;
        return acc;
      }, {} as Record<string, number>);
      setProductionData(newProductionData);
      const selectedClient = clients.find(c => c.id === fiche.clientId);
      if (selectedClient) fetchModels(selectedClient.name); // Fetch models for the fiche's client
      const selectedModel = models.find((m) => m.id === fiche.modelId);
      if (selectedModel) setAvailableCommandes(selectedModel.commandesWithVariants);
    }
  };

  const handleFicheDetails = (ficheId: string) => {
    const fiche = fiches.find((f) => f.id === ficheId);
    if (fiche) {
      setSelectedDetailsFiche(fiche);
      setIsDetailsModalOpen(true);
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
        production: [],
      };
      const res = await fetch('/api/fiche-production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create fiche');
      }
      const newFiche = await res.json();
      setSelectedFicheId(newFiche.id);
      setProductionData({});
      setCurrentWeek('Week 1');
      await fetchFiches();
      setIsCreateModalOpen(false);
      toast.success('Fiche created successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to create fiche');
      toast.error('Failed to create fiche');
    } finally {
      setLoading(false);
    }
  };

  const filteredFiches = fiches.filter((fiche) => {
    const modelName = models.find((m) => m.id === fiche.modelId)?.name || '';
    return (
      modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fiche.commande.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fiche.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  const totalPages = Math.ceil(filteredFiches.length / itemsPerPage);
  const paginatedFiches = filteredFiches.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <Wrapper>
      <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { zIndex: 9999 } }} />
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Fiche Production</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/3 space-y-4">
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
              ) : paginatedFiches.length > 0 ? (
                paginatedFiches.map((fiche) => (
                  <FicheCard
                    key={fiche.id}
                    fiche={fiche}
                    onSelect={handleFicheSelect}
                    onDetails={handleFicheDetails}
                    onDelete={handleDeleteFiche}
                    models={models}
                  />
                ))
              ) : (
                <div className="text-center">No fiches found</div>
              )}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <button
                  className="btn btn-outline btn-sm flex items-center"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  className="btn btn-outline btn-sm flex items-center"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            )}
            <Dialog.Root open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <Dialog.Trigger asChild>
                <button
                  className="btn btn-primary w-full flex items-center justify-center gap-2 mt-4"
                >
                  <Plus className="w-5 h-5" /> New Fiche
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md">
                  <Dialog.Title className="font-bold text-lg mb-4">Create New Fiche</Dialog.Title>
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
                        className="select select-bordered w-full max-h-40 overflow-y-auto"
                        value={selectedModelId}
                        onChange={(e) => handleModelChange(e.target.value)}
                        disabled={!selectedClientId || loading || !models.length}
                      >
                        <option value="">Select a model</option>
                        {models.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name} ({model.commandesWithVariants[0]?.value || 'No Commande'})
                          </option>
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
                          <option key={cmd.value} value={cmd.value}>
                            {cmd.value}
                          </option>
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
          </div>

          <div className="lg:w-2/3 bg-white rounded-xl shadow p-6">
            {selectedFicheId ? (
              <ProductionTable
                ficheId={selectedFicheId}
                clientId={selectedClientId}
                modelId={selectedModelId}
                commande={selectedCommande}
                quantity={quantity}
                productionData={productionData}
                setProductionData={setProductionData}
                fetchFiches={fetchFiches}
                setError={setError}
                currentWeek={currentWeek}
                setCurrentWeek={setCurrentWeek}
                getToken={getToken}
                modelName={models.find((m) => m.id === selectedModelId)?.name}
                clientName={clients.find((c) => c.id === selectedClientId)?.name}
              />
            ) : (
              <div className="text-center text-gray-500">Select a fiche to edit or create a new one</div>
            )}
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
                  <p><strong>Total Sewn:</strong> {selectedDetailsFiche.production.reduce((sum, entry) => sum + entry.quantityCreated, 0)}</p>
                  <div>
                    <h4 className="font-semibold">Production Entries:</h4>
                    <div className="overflow-x-auto">
                      <div className="max-h-[300px] overflow-y-auto">
                        <table className="table table-zebra w-full">
                          <thead className="sticky top-0 bg-white">
                            <tr>
                              <th>Week</th>
                              <th>Day</th>
                              <th>Hour</th>
                              <th>Quantity Created</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedDetailsFiche.production.map((entry, index) => (
                              <tr key={index}>
                                <td>{entry.week}</td>
                                <td>{entry.day}</td>
                                <td>{entry.hour}</td>
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