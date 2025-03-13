/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Wrapper from '@/components/Wrapper';
import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { getClientModels, createClientModel, updateClientModel, deleteClientModel, syncClientModels } from '@/lib/clientModelApi';
import { getClients } from '@/lib/clientApi';

interface Client {
  id: string;
  name?: string | null;
}

interface Variant {
  id?: string;
  name?: string | null;
  qte_variante?: number | null;
}

interface ClientModel {
  id: string;
  name?: string | null;
  description?: string | null;
  commandes?: string | null; // Comma-separated string
  lotto?: string | null;
  ordine?: string | null;
  puht?: number | null;
  clientId: string;
  client?: Client;
  variants?: Variant[];
}

export default function ClientModelPage() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress || localStorage.getItem("clerkUserEmail") || '';
  const [models, setModels] = useState<ClientModel[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ClientModel>>({
    name: '',
    description: '',
    commandes: '',
    lotto: '',
    ordine: '',
    puht: 0,
    clientId: '',
  });
  const [variants, setVariants] = useState<Variant[]>([{ name: '', qte_variante: 0 }]);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const itemsPerPage = 8;

  const fetchData = useCallback(async () => {
    if (!email) return;
    setLoading(true);
    setError(null);

    try {
      const params = { email, dateDebut, dateFin, search: searchTerm };
      const data = await getClientModels(params);
      setModels(data);
    } catch (err) {
      setError("Failed to fetch client models");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [email, dateDebut, dateFin, searchTerm]);

  const fetchClients = useCallback(async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  }, []);

  useEffect(() => {
    if (email) {
      fetchData();
      fetchClients();
      localStorage.setItem("clerkUserEmail", email);
    }

    const handleOnline = () => {
      setIsOffline(false);
      syncClientModels(email).then(fetchData);
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [email, dateDebut, dateFin, searchTerm, refreshTrigger, fetchData, fetchClients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const combinedCommandes = formData.commandes?.split(',').filter(c => c.trim() !== '').join(',') || null;
    const filteredVariants = variants.filter(v => v.name && v.name.trim() !== '');

    const payload: Partial<ClientModel> & { email?: string } = {
      ...(formData.id ? { id: formData.id } : { email }),
      name: formData.name || null,
      description: formData.description || null,
      commandes: combinedCommandes,
      variants: filteredVariants,
      lotto: formData.lotto || null,
      ordine: formData.ordine || null,
      puht: formData.puht || null,
      clientId: formData.clientId || '',
    };

    try {
      if (formData.id) {
        const updatedModel = await updateClientModel(payload);
        setModels((prev) =>
          prev.map((m) => (m.id === updatedModel.id ? updatedModel : m))
        );
      } else {
        const newModel = await createClientModel(payload as Partial<ClientModel> & { email: string });
        setModels((prev) => [...prev, newModel]);
      }

      setIsModalOpen(false);
      setFormData({
        name: '',
        description: '',
        commandes: '',
        lotto: '',
        ordine: '',
        puht: 0,
        clientId: '',
      });
      setVariants([{ name: '', qte_variante: 0 }]);
    } catch (error) {
      console.error('Submission error:', error);
      setModalError("Failed to save client model");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this model?')) {
      try {
        await deleteClientModel(id);
        setModels((prev) => prev.filter((m) => m.id !== id));
      } catch (error) {
        console.error('Error deleting:', error);
        setError("Failed to delete client model");
      }
    }
  };

  const handleEdit = (model: ClientModel) => {
    setFormData({
      id: model.id,
      name: model.name || '',
      description: model.description || '',
      commandes: model.commandes || '',
      lotto: model.lotto || '',
      ordine: model.ordine || '',
      puht: model.puht || 0,
      clientId: model.clientId || '',
    });
    setVariants(model.variants && model.variants.length > 0 ? model.variants : [{ name: '', qte_variante: 0 }]);
    setIsModalOpen(true);
  };

  const handleExternalRefresh = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    (window as any).refreshClientModelPage = handleExternalRefresh;
    return () => {
      delete (window as any).refreshClientModelPage;
    };
  }, []);

  const uniqueModels = Array.from(
    new Map(
      models.map((model) => [`${model.clientId}-${model.name || ''}`, model])
    ).values()
  );

  const totalItems = uniqueModels.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedModels = uniqueModels.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Wrapper>
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col gap-4 p-4">
          <h1 className="text-2xl font-bold">Client Models {isOffline && '(Offline Mode)'}</h1>
          <button 
            className="btn btn-primary w-full sm:w-auto"
            onClick={() => setIsModalOpen(true)}
          >
            Add Client Model
          </button>

          <div className="relative flex items-center w-full">
            <input
              type="text"
              placeholder="Search by client or model"
              className="input input-bordered w-full rounded-xl pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 w-5 h-5 text-gray-500" />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
            <input
              type="date"
              className="input input-bordered w-full sm:w-auto"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
            />
            <span className="text-gray-600">to</span>
            <input
              type="date"
              className="input input-bordered w-full sm:w-auto"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
            />
            {(dateDebut || dateFin) && (
              <button 
                className="btn btn-error w-full sm:w-auto mt-2 sm:mt-0"
                onClick={() => {
                  setDateDebut('');
                  setDateFin('');
                  fetchData();
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="text-center">
            <span className="loading loading-dots loading-lg"></span>
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Client</th>
                <th>Model Name</th>
                <th>Commandes</th>
                <th>Description</th>
                <th>PUHT</th>
                <th>Variants/Qte</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedModels.map(model => (
                <tr key={model.id}>
                  <td>{model.client?.name || "N/A"}</td>
                  <td>{model.name || "Unnamed"}</td>
                  <td>{model.commandes || "N/A"}</td>
                  <td>{model.description || "N/A"}</td>
                  <td>{model.puht ? `${model.puht} €` : "N/A"}</td>
                  <td className="flex flex-col">
                    {model.variants && model.variants.length > 0 ? (
                      model.variants.map((v, i) => (
                        <div key={i} className="mb-1">
                          {v.name || "N/A"} ({v.qte_variante ?? "N/A"})
                        </div>
                      ))
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-info mr-2"
                      onClick={() => handleEdit(model)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => handleDelete(model.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <button
              className="btn btn-outline btn-sm flex items-center"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </button>
            <span className="text-sm">Page {currentPage} of {totalPages}</span>
            <button
              className="btn btn-outline btn-sm flex items-center"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        )}

        <dialog className={`modal ${isModalOpen ? 'modal-open' : ''}`} open={isModalOpen}>
          <div className="modal-box max-w-3xl w-full sm:w-11/12 md:w-3/4 lg:w-2/3 transition-all duration-300 ease-in-out transform translate-y-0">
            <h3 className="font-bold text-lg mb-4">
              {formData.id ? 'Edit' : 'New'} Client Model
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {modalError && (
                <div className="alert alert-error mb-4">{modalError}</div>
              )}

              <select
                className="select select-bordered w-full"
                value={formData.clientId || ''}
                onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                required
              >
                <option value="">Select Client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name || "N/A"}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Model Name"
                className="input input-bordered w-full"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required={!formData.id}
              />

              <input
                type="text"
                placeholder="Commandes (comma-separated, e.g., 33, 44)"
                className="input input-bordered w-full"
                value={formData.commandes || ''}
                onChange={e => setFormData({ ...formData, commandes: e.target.value })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Lotto"
                  className="input input-bordered w-full"
                  value={formData.lotto || ''}
                  onChange={e => setFormData({ ...formData, lotto: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Ordine"
                  className="input input-bordered w-full"
                  value={formData.ordine || ''}
                  onChange={e => setFormData({ ...formData, ordine: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="PUHT"
                  className="input input-bordered w-full"
                  value={formData.puht || 0}
                  onChange={e => setFormData({ ...formData, puht: Number(e.target.value) })}
                  step="0.01"
                />
              </div>

              <textarea
                placeholder="Description"
                className="textarea textarea-bordered w-full"
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />

              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold">Variants</h4>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => setVariants([...variants, { name: '', qte_variante: 0 }])}
                  >
                    Add Variant
                  </button>
                </div>
                {variants.map((variant, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Variant Name"
                      className="input input-bordered flex-1"
                      value={variant.name || ''}
                      onChange={e => setVariants(v =>
                        v.map((item, i) =>
                          i === index ? { ...item, name: e.target.value } : item
                        )
                      )}
                    />
                    <input
                      type="number"
                      placeholder="Qte"
                      className="input input-bordered w-20"
                      value={variant.qte_variante || 0}
                      onChange={e => setVariants(v =>
                        v.map((item, i) =>
                          i === index ? { ...item, qte_variante: Number(e.target.value) } : item
                        )
                      )}
                    />
                    <button
                      type="button"
                      className="btn btn-error btn-sm"
                      onClick={() => setVariants(v => v.filter((_, i) => i !== index))}
                      disabled={variants.length === 1}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="modal-action">
                <button 
                  type="button" 
                  className="btn"
                  onClick={() => {
                    setIsModalOpen(false);
                    setModalError(null);
                    setFormData({
                      name: '',
                      description: '',
                      commandes: '',
                      lotto: '',
                      ordine: '',
                      puht: 0,
                      clientId: '',
                    });
                    setVariants([{ name: '', qte_variante: 0 }]);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {formData.id ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      </div>
    </Wrapper>
  );
}