// app/client/page.tsx
"use client";

import Wrapper from '@/components/Wrapper';
import { Edit, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useOfflineAuth } from '@/lib/useOfflineAuth';
import { getClients, createClient, updateClient, deleteClient, syncClients } from '@/lib/clientApi';

interface Client {
  id: string;
  name?: string | null;
  email?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  fix?: string | null;
  address?: string | null;
  matriculeFiscale?: string | null;
  soumission?: string | null;
  dateDebutSoumission?: string | null;
  dateFinSoumission?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export default function ClientPage() {
  const { userId, isLoaded } = useOfflineAuth(); // Use custom hook for auth
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone1: '',
    phone2: '',
    fix: '',
    address: '',
    matriculeFiscale: '',
    soumission: '',
    dateDebutSoumission: '',
    dateFinSoumission: '',
  });
  const [modalError, setModalError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    fetchClients();

    // Listen for online/offline changes
    const handleOnline = () => {
      setIsOffline(false);
      syncClients().then(fetchClients); // Sync and refresh when back online
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = formData.id ? 'Update' : 'Create';
    setModalError(null);

    try {
      if (method === 'Create') {
        const newClient = await createClient(formData);
        setClients((prev) => [...prev, newClient]);
      } else {
        const updatedClient = await updateClient(formData);
        setClients((prev) =>
          prev.map((client) => (client.id === updatedClient.id ? updatedClient : client))
        );
      }

      setIsModalOpen(false);
      setFormData({
        name: '', email: '', phone1: '', phone2: '', fix: '',
        address: '', matriculeFiscale: '', soumission: '',
        dateDebutSoumission: '', dateFinSoumission: '',
      });
    } catch (error) {
      console.error(`Error ${method.toLowerCase()}ing client:`, error);
      setModalError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteClient(id);
        setClients((prev) => prev.filter((client) => client.id !== id));
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <Wrapper>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Clients {isOffline && '(Offline Mode)'}</h1>
        <button
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
          disabled={!userId && !isOffline} // Disable if no user and not offline
        >
          Add Client
        </button>
      </div>

      <dialog id="client_modal" className="modal" open={isModalOpen}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            {formData.id ? 'Edit Client' : 'Add New Client'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {modalError && (
              <div className="alert alert-error mb-4">{modalError}</div>
            )}
            <input
              type="text"
              placeholder="Name"
              className="input input-bordered w-full"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="input input-bordered w-full"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Phone"
              className="input input-bordered w-full"
              value={formData.phone1 || ''}
              onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Phone2"
              className="input input-bordered w-full"
              value={formData.phone2 || ''}
              onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Fix"
              className="input input-bordered w-full"
              value={formData.fix || ''}
              onChange={(e) => setFormData({ ...formData, fix: e.target.value })}
            />
            <input
              type="text"
              placeholder="Address"
              className="input input-bordered w-full"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <input
              type="text"
              placeholder="Matricule Fiscale"
              className="input input-bordered w-full"
              value={formData.matriculeFiscale || ''}
              onChange={(e) => setFormData({ ...formData, matriculeFiscale: e.target.value })}
            />
            <input
              type="text"
              placeholder="Soumission"
              className="input input-bordered w-full"
              value={formData.soumission || ''}
              onChange={(e) => setFormData({ ...formData, soumission: e.target.value })}
            />
            <input
              type="date"
              placeholder="Date Début Soumission"
              className="input input-bordered w-full"
              value={formData.dateDebutSoumission || ''}
              onChange={(e) => setFormData({ ...formData, dateDebutSoumission: e.target.value })}
            />
            <input
              type="date"
              placeholder="Date Fin Soumission"
              className="input input-bordered w-full"
              value={formData.dateFinSoumission || ''}
              onChange={(e) => setFormData({ ...formData, dateFinSoumission: e.target.value })}
            />
            <div className="modal-action">
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setIsModalOpen(false);
                  setModalError(null);
                  setFormData({
                    name: '', email: '', phone1: '', phone2: '', fix: '',
                    address: '', matriculeFiscale: '', soumission: '',
                    dateDebutSoumission: '', dateFinSoumission: '',
                  });
                }}
              >
                Close
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
              <th>Name</th><th>Email</th><th>Phone1</th><th>Phone2</th><th>Fix</th>
              <th>Address</th><th>Matricule Fiscale</th><th>Soumission</th>
              <th>Date Début Soumission</th><th>Date Fin Soumission</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.name || '-'}</td>
                <td>{client.email || '-'}</td>
                <td>{client.phone1 || '-'}</td>
                <td>{client.phone2 || '-'}</td>
                <td>{client.fix || '-'}</td>
                <td>{client.address || '-'}</td>
                <td>{client.matriculeFiscale || '-'}</td>
                <td>{client.soumission || '-'}</td>
                <td>{client.dateDebutSoumission || '-'}</td>
                <td>{client.dateFinSoumission || '-'}</td>
                <td>
                  <button
                    className="btn btn-sm btn-info mr-2"
                    onClick={() => {
                      setFormData(client);
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit className='w-4'/>
                  </button>
                  <button
                    className="btn btn-sm btn-error"
                    onClick={() => handleDelete(client.id)}
                  >
                    <Trash className='w-4'/>
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