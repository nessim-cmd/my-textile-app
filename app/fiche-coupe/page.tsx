/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Wrapper from '@/components/Wrapper';
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import CoupeTable from './CoupeTable';
import { Toaster } from 'react-hot-toast';

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

const FicheCard: React.FC<{ fiche: FicheCoupe; onSelect: (id: string) => void; onDetails: (id: string) => void; models: ClientModel[]; coupeData: Record<string, number> }> = ({ fiche, onSelect, onDetails, models, coupeData }) => {
    const model = models.find((m) => m.id === fiche.modelId);
    const totalProcessed = Object.values(coupeData).reduce((sum, qty) => sum + qty, 0); // Use coupeData for consistency
  
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
          </div>
        </div>
        <div>
          <div className="stat-title uppercase text-sm">FICHE-{fiche.id.slice(0, 3)}</div>
          <div className="stat-value">{totalProcessed} / {fiche.quantity}</div>
          <div className="stat-desc">Total Processed / Ordered</div>
        </div>
      </div>
    );
  };

export default function FicheCoupePage() {
  const { getToken } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [models, setModels] = useState<ClientModel[]>([]);
  const [fiches, setFiches] = useState<FicheCoupe[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [selectedCommande, setSelectedCommande] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [coupeData, setCoupeData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFicheId, setSelectedFicheId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDetailsFiche, setSelectedDetailsFiche] = useState<FicheCoupe | null>(null);
  const [currentWeek, setCurrentWeek] = useState<string>('Week 1');
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

  const fetchModels = useCallback(async (clientId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const url = clientId ? `/api/client-model?clientId=${clientId}` : '/api/client-model';
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch models');
      const data = await res.json();
      setModels(Array.isArray(data) ? data : []);
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
      const res = await fetch('/api/fiche-coupe', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch fiches-coupe');
      const data = await res.json();
      setFiches(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch fiches-coupe');
      console.error(err);
      setFiches([]);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchClients();
    fetchFiches();
  }, [fetchClients, fetchFiches]);

  useEffect(() => {
    if (selectedClientId) {
      fetchModels(selectedClientId);
    } else {
      setModels([]);
    }
  }, [selectedClientId, fetchModels]);

  const handleModelChange = (value: string) => {
    const [modelId, commandeValue] = value.split('|');
    const selectedModel = models.find((m) => m.id === modelId);
    if (selectedModel) {
      setSelectedModelId(modelId);
      setSelectedCommande(commandeValue);
      const selectedCmd = selectedModel.commandesWithVariants.find((c) => c.value === commandeValue);
      const totalQuantity = selectedCmd && Array.isArray(selectedCmd.variants)
        ? selectedCmd.variants.reduce((sum, v) => sum + (v.qte_variante || 0), 0)
        : 0;
      setQuantity(totalQuantity);
      setCoupeData({});
      setCurrentWeek('Week 1');

      const existingFiche = fiches.find((f) => f.modelId === modelId && f.commande === commandeValue);
      if (existingFiche) {
        setSelectedFicheId(existingFiche.id);
        const newCoupeData = existingFiche.coupe.reduce((acc, entry) => {
          acc[`${entry.week}-${entry.day}-${entry.category}`] = entry.quantityCreated;
          return acc;
        }, {} as Record<string, number>);
        setCoupeData(newCoupeData);
      } else {
        setSelectedFicheId(null);
      }
    }
  };

  const handleFicheSelect = async (ficheId: string) => {
    console.log('Selecting fiche with ID:', ficheId);
    const fiche = fiches.find((f) => f.id === ficheId);
    if (fiche) {
      setSelectedFicheId(ficheId);
      setSelectedClientId(fiche.clientId);
      setSelectedModelId(fiche.modelId);
      setSelectedCommande(fiche.commande);
      setQuantity(fiche.quantity);
      setCurrentWeek('Week 1');

      try {
        const token = await getToken();
        const res = await fetch(`/api/fiche-coupe/${ficheId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch fiche details');
        const updatedFiche = await res.json();
        const newCoupeData = updatedFiche.coupe.reduce((acc: { [x: string]: any; }, entry: { week: any; day: any; category: any; quantityCreated: any; }) => {
          acc[`${entry.week}-${entry.day}-${entry.category}`] = entry.quantityCreated;
          return acc;
        }, {} as Record<string, number>);
        setCoupeData(newCoupeData);
      } catch (error) {
        console.error('Error fetching fiche details:', error);
        setError('Failed to load fiche details');
      }
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
        coupe: [],
      };
      const res = await fetch('/api/fiche-coupe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create fiche-coupe');
      }
      const newFiche = await res.json();
      setSelectedFicheId(newFiche.id);
      setCoupeData({});
      setCurrentWeek('Week 1');
      await fetchFiches();
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error(err);
      setError('Failed to create fiche-coupe');
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
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Fiche Coupe</h1>

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
                    models={models}
                    coupeData={coupeData} // Pass coupeData here
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
            <button
              className="btn btn-primary w-full flex items-center justify-center gap-2 mt-4"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="w-5 h-5" /> New Fiche
            </button>
          </div>

          <div className="lg:w-2/3 bg-white rounded-xl shadow p-6">
            {selectedFicheId ? (
              <CoupeTable
                ficheId={selectedFicheId}
                clientId={selectedClientId}
                modelId={selectedModelId}
                commande={selectedCommande}
                quantity={quantity}
                coupeData={coupeData}
                setCoupeData={setCoupeData}
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

        <dialog className={`modal ${isCreateModalOpen ? 'modal-open' : ''}`} open={isCreateModalOpen}>
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Create New Fiche Coupe</h3>
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
                  value={selectedModelId && selectedCommande ? `${selectedModelId}|${selectedCommande}` : ''}
                  onChange={(e) => handleModelChange(e.target.value)}
                  disabled={!selectedClientId || loading}
                >
                  <option value="">Select a model</option>
                  {models.slice(0, 5).map((model) =>
                    model.commandesWithVariants.map((cmd) => (
                      <option key={`${model.id}|${cmd.value}`} value={`${model.id}|${cmd.value}`}>
                        {model.name} ({cmd.value})
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block mb-2 font-semibold">Commande</label>
                <input type="text" className="input input-bordered w-full" value={selectedCommande} readOnly />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Quantity</label>
                <input type="number" className="input input-bordered w-full" value={quantity} readOnly />
              </div>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateFiche} disabled={loading}>
                {loading ? <span className="loading loading-spinner"></span> : 'Create'}
              </button>
            </div>
          </div>
        </dialog>

        <dialog className={`modal ${isDetailsModalOpen ? 'modal-open' : ''}`} open={isDetailsModalOpen}>
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4">Fiche Coupe Details</h3>
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
                    <table className="table table-zebra w-full">
                      <thead>
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
            )}
            <div className="modal-action">
              <button className="btn" onClick={() => setIsDetailsModalOpen(false)}>Close</button>
            </div>
          </div>
        </dialog>
      </div>
    </Wrapper>
  );
}