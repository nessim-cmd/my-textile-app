'use client';
import Wrapper from '@/components/Wrapper';
import { Edit, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';

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
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone1: '',
    phone2: '',
    fix: '',          // Was missing in reset
    address: '',
    matriculeFiscale: '',
    soumission: '',
    dateDebutSoumission: '',
    dateFinSoumission: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const response = await fetch('/api/client');
    const data = await response.json();
    setClients(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = formData.id ? 'PUT' : 'POST';
    const response = await fetch('/api/client', {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    if (response.ok) {
      setIsModalOpen(false);
      setFormData({ 
        name: '', 
        email: '', 
        phone1: '',
        phone2: '', 
        fix: '',          // Added missing field
        address: '', 
        matriculeFiscale: '',
        soumission: '',
        dateDebutSoumission: '',
        dateFinSoumission: ''
      });      
      await fetchClients();
    }
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/client', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    await fetchClients();
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
            <input
              type="text"
              placeholder="Name"
              className="input input-bordered w-full"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="input input-bordered w-full"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              className="input input-bordered w-full"
              value={formData.phone1}
              onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
              required
            />
            <input
              type="tel"
              placeholder="Phone2"
              className="input input-bordered w-full"
              value={formData.phone2}
              onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
              required
            />
            <input
              type="tel"
              placeholder="Fix"
              className="input input-bordered w-full"
              value={formData.fix || ''}  // Add fallback
              onChange={(e) => setFormData({ ...formData, fix: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Address"
              className="input input-bordered w-full"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="matriculeFiscale"
              className="input input-bordered w-full"
              value={formData.matriculeFiscale}
              onChange={(e) => setFormData({ ...formData, matriculeFiscale: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="soumission"
              className="input input-bordered w-full"
              value={formData.soumission}
              onChange={(e) => setFormData({ ...formData, soumission: e.target.value })}
              required
            />
            <input
              type="date"
              placeholder="Date debut soumission"
              className="input input-bordered w-full"
              value={formData.dateDebutSoumission}
              onChange={(e) => setFormData({ 
                ...formData, 
                dateDebutSoumission: e.target.value 
              })}
              required
            />
            <input
              type="date"
              placeholder="Date fin soumission"
              className="input input-bordered w-full"
              value={formData.dateFinSoumission}
              onChange={(e) => setFormData({ 
                ...formData, 
                dateFinSoumission: e.target.value 
              })}
              required
            />
            <div className="modal-action">
              <button 
                type="button" 
                className="btn"
                onClick={() => {
                  setIsModalOpen(false);
                  setFormData({
                    name: '', 
                    email: '', 
                    phone1: '',
                    phone2: '', 
                    fix: '',          // Added missing field
                    address: '', 
                    matriculeFiscale: '',
                    soumission: '',
                    dateDebutSoumission: '',
                    dateFinSoumission: ''
                  });                }}
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
              <th>matriculeFiscale</th>
              <th>Soumission</th>
              <th>Date Debut Soumission</th>
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