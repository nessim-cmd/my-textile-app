/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Wrapper from '@/components/Wrapper';
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Client {
  id: string;
  name: string;
}

interface Variant {
  id?: string;
  name: string;
  qte_variante: number;
}

interface ClientModel {
  id: string;
  name: string | null;
  description: string | null;
  commandes: string | null;
  commandesWithVariants: { value: string; variants: Variant[] }[] | null;
  lotto: string | null;
  ordine: string | null;
  puht: number | null;
  clientId: string;
  client: Client;
  variants: Variant[];
  files: string[];
}

export default function ClientModelPage() {
  const { getToken } = useAuth();
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
    commandesWithVariants: [],
    files: [],
  });
  const [commandesWithVariants, setCommandesWithVariants] = useState<{ value: string; variants: Variant[] }[]>([{ value: '', variants: [{ name: '', qte_variante: 0 }] }]);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsPerPage = 8;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
  
    const params = new URLSearchParams();
    if (dateDebut) params.append('dateDebut', dateDebut);
    if (dateFin) params.append('dateFin', dateFin);
    if (searchTerm) params.append('search', searchTerm);
  
    try {
      const token = await getToken();
      console.log("Fetching client models, Token:", token);
      const res = await fetch(`/api/client-model?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 404) {
          setModels([]);
          console.log("No client models found (404)");
          return;
        }
        throw new Error(`Failed to fetch: ${res.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
      }
      const data = await res.json();
      console.log("Fetched client models:", data);
      setModels(data);
    } catch (err: any) {
      setError(`Failed to fetch client models: ${err.message}`);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [dateDebut, dateFin, searchTerm, getToken]);
  const fetchClients = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch('/api/client', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch clients: ${res.status}`);
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  }, [getToken]);

  useEffect(() => {
    fetchData();
    fetchClients();
  }, [dateDebut, dateFin, searchTerm, refreshTrigger, fetchData, fetchClients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = formData.id ? 'PUT' : 'POST';
    const url = '/api/client-model';
  
    setModalError(null);
  
    try {
      const combinedCommandes = commandesWithVariants
        .map(c => c.value)
        .filter(v => v.trim() !== '')
        .join(',');
      const combinedVariants = commandesWithVariants.flatMap((c) =>
        c.variants
          .filter((v) => v.name.trim() !== '')
          .map((v) => ({
            ...v,
            name: `${c.value}:${v.name}`,
          }))
      );
  
      const token = await getToken();
      if (!token) throw new Error('Authentication token not found');
  
      const formDataToSend = new FormData();
      
      formDataToSend.append('id', formData.id || '');
      formDataToSend.append('name', formData.name || '');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('commandes', combinedCommandes || '');
      formDataToSend.append('commandesWithVariants', JSON.stringify(commandesWithVariants.filter(c => c.value.trim() !== '')));
      formDataToSend.append('lotto', formData.lotto || '');
      formDataToSend.append('ordine', formData.ordine || '');
      formDataToSend.append('puht', formData.puht?.toString() || '0');
      formDataToSend.append('clientId', formData.clientId || '');
      formDataToSend.append('variants', JSON.stringify(combinedVariants));
  
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      uploadedFiles.forEach((file, index) => {
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(`File ${file.name} exceeds maximum size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        }
        if (file.size === 0) {
          throw new Error(`File ${file.name} is empty`);
        }
        formDataToSend.append('files', file);
        console.log(`Appending file ${index}:`, file.name, file.size);
      });
  
      console.log('Submitting:', { method, url, id: formData.id, name: formData.name, filesCount: uploadedFiles.length });
  
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });
  
      const responseText = await response.text();
      console.log('Response:', response.status, responseText);
  
      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
          throw new Error(errorData.error || errorData.details || `HTTP ${response.status}`);
        } catch {
          throw new Error(responseText || `HTTP ${response.status}`);
        }
      }
  
      const responseData = JSON.parse(responseText);
      console.log('Success:', responseData);
  
      setIsModalOpen(false);
      setFormData({
        name: '',
        description: '',
        commandes: '',
        commandesWithVariants: [],
        lotto: '',
        ordine: '',
        puht: 0,
        clientId: '',
        files: [],
      });
      setCommandesWithVariants([{ value: '', variants: [{ name: '', qte_variante: 0 }] }]);
      setUploadedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchData();
    } catch (error: any) {
      console.error('Submission error:', error);
      setModalError(`Failed to save client model: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this model?')) {
      try {
        const token = await getToken();
        const res = await fetch(`/api/client-model`, {
          method: 'DELETE',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id }),
        });
        if (!res.ok) throw new Error('Failed to delete');
        await fetchData();
      } catch (error) {
        console.error('Delete error:', error);
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
      commandesWithVariants: model.commandesWithVariants || [],
      lotto: model.lotto || '',
      ordine: model.ordine || '',
      puht: model.puht || 0,
      clientId: model.clientId,
      files: model.files || [],
    });

    const loadedCommandesWithVariants = model.commandesWithVariants && Array.isArray(model.commandesWithVariants)
      ? model.commandesWithVariants
      : [{ value: '', variants: [{ name: '', qte_variante: 0 }] }];

    setCommandesWithVariants(loadedCommandesWithVariants);
    setUploadedFiles([]);
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
      models.map((model) => [`${model.clientId}-${model.name}`, model])
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
                <th>Commande</th>
                <th>Description</th>
                <th>PUHT</th>
                <th>Variants/Qte</th>
                <th>Files</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedModels.map(model => (
                <tr key={model.id}>
                  <td>{model.client?.name || "N/A"}</td>
                  <td>{model.name || "Unnamed"}</td>
                  <td className="flex flex-col">
                    {model.commandesWithVariants != null && Array.isArray(model.commandesWithVariants) && model.commandesWithVariants.length > 0 ? (
                      model.commandesWithVariants.map((cmd, i) => (
                        <div key={i} className="mb-1">
                          {cmd.value || "N/A"}
                          {i < model.commandesWithVariants!.length - 1 && (
                            <hr className="border-t border-gray-300 my-1 w-12" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div>{model.commandes || "N/A"}</div>
                    )}
                  </td>
                  <td>{model.description || "N/A"}</td>
                  <td>{model.puht ? `${model.puht} €` : "N/A"}</td>
                  <td className="flex flex-col">
                    {model.commandesWithVariants != null && Array.isArray(model.commandesWithVariants) && model.commandesWithVariants.length > 0 ? (
                      model.commandesWithVariants.map((cmd, i) => (
                        <div key={i} className="mb-1">
                          {cmd.variants && cmd.variants.length > 0 ? (
                            cmd.variants.map((v, j) => (
                              <span key={j} className="mr-2">
                                {v.name} ({v.qte_variante})
                              </span>
                            ))
                          ) : (
                            "N/A"
                          )}
                          {i < model.commandesWithVariants!.length - 1 && (
                            <hr className="border-t border-gray-300 my-1 w-12" />
                          )}
                        </div>
                      ))
                    ) : model.variants && model.variants.length > 0 ? (
                      model.variants.map((v, i) => {
                        const variantName = v.name.includes(':') ? v.name.split(':')[1] : v.name;
                        return (
                          <div key={i} className="mr-1">
                            {variantName} ({v.qte_variante})
                          </div>
                        );
                      })
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>
                    {model.files && model.files.length > 0 ? (
                      <ul className="list-disc pl-5">
                        {model.files.map((file, i) => (
                          <li key={i}>
                            <a href={file} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                              {file.split('/').pop()}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "No files"
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
                  <option key={client.id} value={client.id}>{client.name}</option>
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
                  <h4 className="font-bold">Commandes & Variants</h4>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => setCommandesWithVariants([...commandesWithVariants, { value: '', variants: [{ name: '', qte_variante: 0 }] }])}
                  >
                    Add Commande
                  </button>
                </div>
                {commandesWithVariants.map((cmd, cmdIndex) => (
                  <div key={cmdIndex} className="mb-4 border-b pb-2">
                    <div className="flex gap-2 items-center mb-2">
                      <input
                        type="text"
                        placeholder="Commande (e.g., 33)"
                        className="input input-bordered w-full"
                        value={cmd.value}
                        onChange={(e) => setCommandesWithVariants(v =>
                          v.map((item, i) =>
                            i === cmdIndex ? { ...item, value: e.target.value } : item
                          )
                        )}
                      />
                      <button
                        type="button"
                        className="btn btn-error btn-sm"
                        onClick={() => setCommandesWithVariants(v => v.filter((_, i) => i !== cmdIndex))}
                        disabled={commandesWithVariants.length === 1}
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold">Variants for {cmd.value || 'this commande'}</span>
                      <button
                        type="button"
                        className="btn btn-xs btn-secondary"
                        onClick={() => setCommandesWithVariants(v =>
                          v.map((item, i) =>
                            i === cmdIndex
                              ? { ...item, variants: [...item.variants, { name: '', qte_variante: 0 }] }
                              : item
                          )
                        )}
                      >
                        Add Variant
                      </button>
                    </div>
                    {cmd.variants.map((variant, varIndex) => (
                      <div key={varIndex} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Variant Name"
                          className="input input-bordered flex-1"
                          value={variant.name}
                          onChange={e => setCommandesWithVariants(v =>
                            v.map((item, i) =>
                              i === cmdIndex
                                ? {
                                    ...item,
                                    variants: item.variants.map((v, j) =>
                                      j === varIndex ? { ...v, name: e.target.value } : v
                                    )
                                  }
                                : item
                            )
                          )}
                        />
                        <input
                          type="number"
                          placeholder="Qte"
                          className="input input-bordered w-20"
                          value={variant.qte_variante}
                          onChange={e => setCommandesWithVariants(v =>
                            v.map((item, i) =>
                              i === cmdIndex
                                ? {
                                    ...item,
                                    variants: item.variants.map((v, j) =>
                                      j === varIndex ? { ...v, qte_variante: Number(e.target.value) } : v
                                    )
                                  }
                                : item
                            )
                          )}
                        />
                        <button
                          type="button"
                          className="btn btn-error btn-sm"
                          onClick={() => setCommandesWithVariants(v =>
                            v.map((item, i) =>
                              i === cmdIndex
                                ? {
                                    ...item,
                                    variants: item.variants.filter((_, j) => j !== varIndex)
                                  }
                                : item
                            )
                          )}
                          disabled={cmd.variants.length === 1}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-bold mb-2">Files</h4>
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  className="file-input file-input-bordered w-full"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setUploadedFiles(files);
                  }}
                />
                {uploadedFiles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Selected files:</p>
                    <ul className="list-disc pl-5">
                      {uploadedFiles.map((file, index) => (
                        <li key={index} className="text-sm">{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {formData.id && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Existing files:</p>
                    <ul className="list-disc pl-5">
                      {(models.find(m => m.id === formData.id)?.files || []).map((file, index) => (
                        <li key={index} className="text-sm">
                          <a href={file} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            {file.split('/').pop()}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
                      commandesWithVariants: [],
                      lotto: '',
                      ordine: '',
                      puht: 0,
                      clientId: '',
                      files: [],
                    });
                    setCommandesWithVariants([{ value: '', variants: [{ name: '', qte_variante: 0 }] }]);
                    setUploadedFiles([]);
                    if (fileInputRef.current) fileInputRef.current.value = '';
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