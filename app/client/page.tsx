"use client";

import Wrapper from '@/components/Wrapper';
import { Edit, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from "@clerk/nextjs"; // Add Clerk auth hook

interface Client {
  id: string;
  name: string;
  email: string;
  phone1: string;
  phone2: string;
  fix: string;
  address: string;
  matriculeFiscale: string;
  soumission: string;
  dateDebutSoumission: string;
  dateFinSoumission: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function ClientPage() {
  const { getToken } = useAuth(); // Get Clerk auth token
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
    dateFinSoumission: ''
  });
  const [modalError, setModalError] = useState<string | null>(null); // Add error state for modal

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const token = await getToken(); // Get fresh token
      const response = await fetch('/api/client', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch clients');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = formData.id ? 'PUT' : 'POST';
    setModalError(null); // Reset modal error

    try {
      const token = await getToken(); // Get fresh token
      const response = await fetch('/api/client', {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` // Add auth header
        },
        body: JSON.stringify(formData),
        signal: AbortSignal.timeout(30000) // 30-second timeout
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save client');
      }

      setIsModalOpen(false);
      setFormData({ 
        name: '', 
        email: '', 
        phone1: '',
        phone2: '', 
        fix: '',
        address: '', 
        matriculeFiscale: '',
        soumission: '',
        dateDebutSoumission: '',
        dateFinSoumission: ''
      });
      await fetchClients();
    } catch (error) {
      console.error('Error saving client:', error);
     
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        const token = await getToken(); // Get fresh token
        await fetch('/api/client', {
          method: 'DELETE',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ id })
        });
        await fetchClients();
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  return (
    <Wrapper>
      <button 
        className="btn btn-primary mb-4"
        onClick={() => setIsModalOpen(true)}
      >
        Add Client
      </button>

      <dialog id="client_modal" className="modal" open={isModalOpen}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            {formData.id ? 'Edit Client' : 'Add New Client'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {modalError && (
              <div className="alert alert-error mb-4">
                {modalError}
              </div>
            )}

            <input
              type="text"
              placeholder="Name"
              className="input input-bordered w-full"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="input input-bordered w-full"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              className="input input-bordered w-full"
              value={formData.phone1 || ''}
              onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
              required
            />
            <input
              type="tel"
              placeholder="Phone2"
              className="input input-bordered w-full"
              value={formData.phone2 || ''}
              onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
              required
            />
            <input
              type="tel"
              placeholder="Fix"
              className="input input-bordered w-full"
              value={formData.fix || ''}
              onChange={(e) => setFormData({ ...formData, fix: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Address"
              className="input input-bordered w-full"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Matricule Fiscale"
              className="input input-bordered w-full"
              value={formData.matriculeFiscale || ''}
              onChange={(e) => setFormData({ ...formData, matriculeFiscale: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Soumission"
              className="input input-bordered w-full"
              value={formData.soumission || ''}
              onChange={(e) => setFormData({ ...formData, soumission: e.target.value })}
              required
            />
            <input
              type="date"
              placeholder="Date Début Soumission"
              className="input input-bordered w-full"
              value={formData.dateDebutSoumission || ''}
              onChange={(e) => setFormData({ ...formData, dateDebutSoumission: e.target.value })}
              required
            />
            <input
              type="date"
              placeholder="Date Fin Soumission"
              className="input input-bordered w-full"
              value={formData.dateFinSoumission || ''}
              onChange={(e) => setFormData({ ...formData, dateFinSoumission: e.target.value })}
              required
            />
            <div className="modal-action">
              <button 
                type="button" 
                className="btn"
                onClick={() => {
                  setIsModalOpen(false);
                  setModalError(null); // Clear error on close
                  setFormData({
                    name: '', 
                    email: '', 
                    phone1: '',
                    phone2: '', 
                    fix: '',
                    address: '', 
                    matriculeFiscale: '',
                    soumission: '',
                    dateDebutSoumission: '',
                    dateFinSoumission: ''
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
              <th>Name</th>
              <th>Email</th>
              <th>Phone1</th>
              <th>Phone2</th>
              <th>Fix</th>
              <th>Address</th>
              <th>Matricule Fiscale</th>
              <th>Soumission</th>
              <th>Date Début Soumission</th>
              <th>Date Fin Soumission</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.name}</td>
                <td>{client.email}</td>
                <td>{client.phone1}</td>
                <td>{client.phone2}</td>
                <td>{client.fix}</td>
                <td>{client.address}</td>
                <td>{client.matriculeFiscale}</td>
                <td>{client.soumission}</td>
                <td>{new Date(client.dateDebutSoumission).toLocaleDateString()}</td>
                <td>{new Date(client.dateFinSoumission).toLocaleDateString()}</td>
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