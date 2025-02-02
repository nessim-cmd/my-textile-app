'use client';
import Wrapper from '@/components/Wrapper';
import { useEffect, useState } from 'react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function ClientPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    address: '',
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
      setFormData({ name: '', email: '', phone: '', address: '' });
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
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
            <div className="modal-action">
              <button 
                type="button" 
                className="btn"
                onClick={() => {
                  setIsModalOpen(false);
                  setFormData({ name: '', email: '', phone: '', address: '' });
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
              <th>Phone</th>
              <th>Address</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.name}</td>
                <td>{client.email}</td>
                <td>{client.phone}</td>
                <td>{client.address}</td>
                <td>{new Date(client.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-sm btn-info mr-2"
                    onClick={() => {
                      setFormData(client);
                      setIsModalOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-error"
                    onClick={() => handleDelete(client.id)}
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