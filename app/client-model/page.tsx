"use client";

import Wrapper from '@/components/Wrapper';
import { useAuth } from "@clerk/nextjs";
import { Trash } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

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
  description: string;
  commandes: string;
  commandesWithVariants: Commande[];
  lotto: string;
  ordine: string;
  puht: number;
  fileUrls: string[];
  clientId: string;
  client: Client;
  variants: Variant[];
}

export default function ClientModelPage() {
  const { getToken } = useAuth();
  // Email is no longer needed for API calls as we rely on the token/session
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
    fileUrls: [],
    commandesWithVariants: [],
  });

  const [commandesWithVariants, setCommandesWithVariants] = useState<Commande[]>([{ value: '', variants: [{ name: '', qte_variante: 0 }] }]);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const replaceFilesOnUpload = false;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams(); // Removed email param
    if (dateDebut) params.append('dateDebut', dateDebut);
    if (dateFin) params.append('dateFin', dateFin);
    if (searchTerm) params.append('search', searchTerm);

    try {
      const token = await getToken();
      const res = await fetch(`/api/client-model?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
      setModels(data);
    } catch (err) {
      setError("Failed to fetch client models");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dateDebut, dateFin, searchTerm, getToken]);

  const fetchClients = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch('/api/client', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  }, [getToken]);

  useEffect(() => {
    fetchData(); // Always fetch data on mount/change,auth is handled by token
    fetchClients();
  }, [dateDebut, dateFin, searchTerm, refreshTrigger, fetchData, fetchClients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = formData.id ? 'PUT' : 'POST';
    const url = '/api/client-model';

    setModalError(null);

    const combinedCommandes = commandesWithVariants.map(c => c.value).filter(v => v.trim() !== '').join(',');
    const combinedVariants = commandesWithVariants.flatMap((c: Commande) =>
      c.variants
        .filter((v: Variant) => v.name.trim() !== '')
        .map((v: Variant) => ({
          ...v,
          name: `${c.value}:${v.name}`,
        }))
    );

    try {
      const token = await getToken();
      const payload = {
        ...(formData.id ? { id: formData.id } : {}),
        name: formData.name || null,
        description: formData.description || null,
        commandes: combinedCommandes || null,
        commandesWithVariants: commandesWithVariants.filter(c => c.value.trim() !== ''),
        variants: combinedVariants,
        lotto: formData.lotto || null,
        ordine: formData.ordine || null,
        puht: formData.puht || null,
        fileUrls: formData.fileUrls || [],
        clientId: formData.clientId,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save');
      }

      setTimeout(() => {
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
          fileUrls: [],
        });
        setCommandesWithVariants([{ value: '', variants: [{ name: '', qte_variante: 0 }] }]);
        setUploadProgress(0);
        setUploading(false);
        fetchData();
      }, 500);
    } catch (error) {
      console.error('Submission error:', error);
      setModalError("Failed to save client model");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this model?')) {
      try {
        const token = await getToken();
        await fetch(`/api/client-model`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ id })
        });
        await fetchData();
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
      commandesWithVariants: model.commandesWithVariants || [],
      lotto: model.lotto || '',
      ordine: model.ordine || '',
      puht: model.puht || 0,
      fileUrls: model.fileUrls || [],
      clientId: model.clientId || '',
    });

    const loadedCommandesWithVariants = model.commandesWithVariants && Array.isArray(model.commandesWithVariants)
      ? model.commandesWithVariants
      : [{ value: '', variants: [{ name: '', qte_variante: 0 }] }];

    setCommandesWithVariants(loadedCommandesWithVariants);
    setIsModalOpen(true);
  };

  const handleExternalRefresh = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    (window as Window).refreshClientModelPage = handleExternalRefresh;
    return () => {
      delete (window as Window).refreshClientModelPage;
    };
  }, []);

  const handleDeleteFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      fileUrls: (prev.fileUrls || []).filter((_, i) => i !== index),
    }));
  };

  const uniqueModels = Array.from(
    new Map(
      models.map((model) => [
        `${model.clientId}-${model.name}`,
        model,
      ])
    ).values()
  );

  // Pagination logic
  const totalPages = Math.ceil(uniqueModels.length / itemsPerPage);
  const paginatedModels = uniqueModels.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <Wrapper>
      <div className="flex flex-col gap-4 mb-4 px-4 sm:px-0">
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
          <button
            className="btn btn-primary mb-4 w-full sm:w-auto"
            onClick={() => setIsModalOpen(true)}
          >
            Add Client Model
          </button>

          <div className="flex items-center space-x-2 mb-3.5 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by client or model name"
              className="rounded-xl p-2 bg-gray-100 w-full sm:w-[300px] md:w-[600px] outline"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-center mb-3.5 w-full sm:w-auto">
            <input
              type="date"
              className="input input-bordered w-full sm:w-auto"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
            />
            <span className="hidden sm:inline">to</span>
            <input
              type="date"
              className="input input-bordered w-full sm:w-auto"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
            />
            {(dateDebut || dateFin) && (
              <button
                className="btn btn-error w-full sm:w-auto"
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
          <table className="table table-zebra w-full text-xs sm:text-sm md:text-base">
            <thead>
              <tr>
                <th className="min-w-[100px]">Client</th>
                <th className="min-w-[120px]">Model Name</th>
                <th className="min-w-[100px]">Commande</th>
                <th className="min-w-[150px]">Description</th>
                <th className="min-w-[80px]">PUHT</th>
                <th className="min-w-[150px]">Variants/Qte</th>
                <th className="min-w-[100px]">Files</th>
                <th className="min-w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedModels.map(model => (
                <tr key={model.id}>
                  <td>{model.client?.name || "N/A"}</td>
                  <td>{model.name || "Unnamed"}</td>
                  <td className="flex flex-col">
                    {model.commandesWithVariants && model.commandesWithVariants.length > 0 ? (
                      model.commandesWithVariants.map((cmd, i) => (
                        <div key={i} className="mb-1">
                          {cmd.value || "N/A"}
                          {i < model.commandesWithVariants.length - 1 && (
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
                    {model.commandesWithVariants && model.commandesWithVariants.length > 0 ? (
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
                          {i < model.commandesWithVariants.length - 1 && (
                            <hr className="border-t border-gray-300 my-1 w-12" />
                          )}
                        </div>
                      ))
                    ) : model.variants && model.variants.length > 0 ? (
                      model.variants.map((v, i) => {
                        const [, variantName] = v.name.includes(':') ? v.name.split(':') : ['', v.name];
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
                    {model.fileUrls && model.fileUrls.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {model.fileUrls.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link link-primary"
                          >
                            File {index + 1}
                          </a>
                        ))}
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        className="btn btn-sm btn-info"
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            <button
              className="btn btn-sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="self-center">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}

        <dialog className="modal" open={isModalOpen}>
          <div className="modal-box max-w-3xl w-full sm:max-w-lg md:max-w-3xl relative">
            <h3 className="font-bold text-lg mb-4">
              {formData.id ? 'Edit' : 'New'} Client Model
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {modalError && (
                <div className="alert alert-error mb-4">
                  {modalError}
                </div>
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
                  className="input input-bordered"
                  value={formData.lotto || ''}
                  onChange={e => setFormData({ ...formData, lotto: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Ordine"
                  className="input input-bordered"
                  value={formData.ordine || ''}
                  onChange={e => setFormData({ ...formData, ordine: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="PUHT"
                  className="input input-bordered"
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

              <div>
                <label className="label">Upload Files</label>
                <input
                  type="file"
                  className="file-input file-input-bordered w-full"
                  multiple
                  disabled={uploading}
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      setUploading(true);
                      setUploadProgress(0);
                      const formData = new FormData();
                      Array.from(files).forEach((file) => {
                        formData.append('files', file);
                      });

                      const token = await getToken();
                      const xhr = new XMLHttpRequest();

                      xhr.upload.onprogress = (event) => {
                        if (event.lengthComputable) {
                          const percentComplete = Math.round((event.loaded / event.total) * 100);
                          setUploadProgress(percentComplete);
                        }
                      };

                      xhr.onload = () => {
                        if (xhr.status === 200) {
                          const data = JSON.parse(xhr.responseText);
                          if (data.urls && Array.isArray(data.urls)) {
                            setFormData((prev) => ({
                              ...prev,
                              fileUrls: replaceFilesOnUpload
                                ? data.urls
                                : [...(prev.fileUrls || []), ...data.urls],
                            }));
                          } else {
                            setModalError('Failed to upload files');
                          }
                        } else {
                          setModalError('Failed to upload files');
                        }
                        setUploading(false);
                        setUploadProgress(0);
                      };

                      xhr.onerror = () => {
                        setModalError('Failed to upload files');
                        setUploading(false);
                        setUploadProgress(0);
                      };

                      xhr.open('POST', '/api/upload', true);
                      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                      xhr.send(formData);
                    }
                  }}
                />
                {uploading && (
                  <div className="mt-2">
                    <progress className="progress progress-primary w-full" value={uploadProgress} max="100"></progress>
                    <span>{uploadProgress}%</span>
                  </div>
                )}
                {formData.fileUrls && formData.fileUrls.length > 0 && !uploading && (
                  <div className="mt-2 flex flex-col gap-1">
                    {formData.fileUrls.map((url, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link link-primary"
                        >
                          File {index + 1}
                        </a>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs text-red-500"
                          onClick={() => handleDeleteFile(index)}
                        >
                          <Trash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
                      <div key={varIndex} className="flex flex-col sm:flex-row gap-2 mb-2">
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
                          className="input input-bordered w-full sm:w-20"
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

              <div className="modal-action flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  className="btn w-full sm:w-auto"
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
                      fileUrls: [],
                    });
                    setCommandesWithVariants([{ value: '', variants: [{ name: '', qte_variante: 0 }] }]);
                    setUploadProgress(0);
                    setUploading(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary w-full sm:w-auto"
                  disabled={uploading}
                >
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