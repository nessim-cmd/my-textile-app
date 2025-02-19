"use client"

import Wrapper from '@/components/Wrapper';

import { useEffect, useState } from 'react';

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
  name: string;
  description: string;
  commandes: string;
  lotto: string;
  ordine: string;
  puht: number;
  clientId: string;
  client: Client;
  variants: Variant[];
}

export default function ClientModelPage() {
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
    clientId: ''
  });
  const [variants, setVariants] = useState<Variant[]>([{ name: '', qte_variante: 0 }]);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
    fetchClients();
  }, [dateDebut, dateFin, searchTerm]);

  

  const fetchData = async () => {
    const params = new URLSearchParams();
    if (dateDebut) params.append('dateDebut', dateDebut);
    if (dateFin) params.append('dateFin', dateFin);
    if (searchTerm) params.append('search', searchTerm);

    const res = await fetch(`/api/client-model?${params.toString()}`);
    const data = await res.json();
    setModels(data);
  };

  const fetchClients = async () => {
    const res = await fetch('/api/client');
    const data = await res.json();
    setClients(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id ? '/api/client-model' : '/api/client-model';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          variants: variants.filter(v => v.name.trim() !== '')
        })
      });

      if (response.ok) {
        setIsModalOpen(false);
        setFormData({
          name: '',
          description: '',
          commandes: '',
          lotto: '',
          ordine: '',
          puht: 0,
          clientId: ''
        });
        setVariants([{ name: '', qte_variante: 0 }]);
        await fetchData();
      }
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this model?')) {
      await fetch('/api/client-model', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      await fetchData();
    }
  };

  const handleEdit = (model: ClientModel) => {
    setFormData(model);
    setVariants(model.variants);
    setIsModalOpen(true);
  };

  return (
    <Wrapper>
      <div className="flex flex-col gap-4 mb-4">
      <div className="flex gap-2 items-center justify-between">
      
            
         
      <button 
        className="btn btn-primary mb-4"
        onClick={() => setIsModalOpen(true)}
      >
        Add Client Model
      </button>

      <div className="flex items-center space-x-2 mb-3.5">
            <input
              type="text"
              placeholder="Search by client or model name"
              className="rounded-xl p-2 bg-gray-100 w-[600px] outline"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
          </div>

      <div className="flex gap-2 items-center mb-3.5 mr-24">
            <input
              type="date"
              className="input input-bordered"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
            />
            <span>to</span>
            <input
              type="date"
              className="input input-bordered"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
            />
            
            {(dateDebut || dateFin) && (
              <button 
                className="btn btn-error"
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
              </div>
      <dialog className="modal" open={isModalOpen}>
        <div className="modal-box max-w-3xl">
          <h3 className="font-bold text-lg mb-4">
            {formData.id ? 'Edit' : 'New'} Client Model
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
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
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Commandes"
                className="input input-bordered"
                value={formData.commandes}
                onChange={e => setFormData({ ...formData, commandes: e.target.value })}
              />
              <input
                type="text"
                placeholder="Lotto"
                className="input input-bordered"
                value={formData.lotto}
                onChange={e => setFormData({ ...formData, lotto: e.target.value })}
              />
              <input
                type="text"
                placeholder="Ordine"
                className="input input-bordered"
                value={formData.ordine}
                onChange={e => setFormData({ ...formData, ordine: e.target.value })}
              />
              <input
                type="number"
                placeholder="PUHT"
                className="input input-bordered"
                value={formData.puht}
                onChange={e => setFormData({ ...formData, puht: Number(e.target.value) })}
                step="0.01"
              />
            </div>

            <textarea
              placeholder="Description"
              className="textarea textarea-bordered w-full"
              value={formData.description}
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
                    value={variant.name}
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
                    value={variant.qte_variante}
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
                  setFormData({
                    name: '',
                    description: '',
                    commandes: '',
                    lotto: '',
                    ordine: '',
                    puht: 0,
                    clientId: ''
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

      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>Client</th>
              <th>Model Name</th>
              <th>Description</th>
              <th>PUHT</th>
              <th>Variants</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {models.map(model => (
              <tr key={model.id}>
                <td>{model.client.name}</td>
                <td>{model.name}</td>
                <td>{model.description}</td>
                <td>{model.puht} €</td>
                <td className='flex flex-col '>
                  {model.variants.map((v, i) => (
                    <div key={i} className="  mr-1">
                      {v.name} ({v.qte_variante})
                    </div>
                  ))}
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
    </Wrapper>
  );
}