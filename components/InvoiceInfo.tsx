// components/InvoiceInfo.tsx
import { Invoice } from '@/type';
import { useUser } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';

interface Props {
  invoice: Invoice;
  setInvoice: (invoice: Invoice) => void;
  dateDebut: string;
  dateFin: string;
  onModelsChange: (models: ClientModel[]) => void;
}

interface Client {
  id: string;
  name: string | null;
}

interface ClientModel {
  id: string;
  name: string | null;
  clientId: string;
}

const InvoiceInfo: React.FC<Props> = ({ invoice, setInvoice, dateDebut, dateFin, onModelsChange }) => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/client');
        if (!response.ok) throw new Error('Failed to fetch clients');
        const data = await response.json();
        setClients(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setError('Failed to load clients');
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const fetchClientModels = async () => {
      if (!invoice.clientName || !email) {
        onModelsChange([]);
        return;
      }

      try {
        const params = new URLSearchParams();
        params.append('email', email);
        params.append('client', invoice.clientName);
        if (dateDebut) params.append('dateDebut', dateDebut);
        if (dateFin) params.append('dateFin', dateFin);

        const response = await fetch(`/api/client-model?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch models');
        const data = await response.json();
        onModelsChange(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching client models:', error);
        onModelsChange([]);
        setError('Failed to load models for selected client and dates');
      }
    };
    fetchClientModels();
  }, [invoice.clientName, email, dateDebut, dateFin, onModelsChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    setInvoice({ ...invoice, [field]: e.target.value });
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInvoice({ ...invoice, clientName: e.target.value });
  };

  return (
    <div className="flex flex-col h-fit bg-base-200 p-5 rounded-xl mb-4 md:mb-0">
      {error && <div className="alert alert-error mb-4">{error}</div>}
      <div className="space-y-4">
        <h2 className="badge badge-accent">Client</h2>
        <select
          value={invoice.clientName}
          onChange={handleClientChange}
          className="select select-bordered w-full"
        >
          <option value="">Sélectionner un client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.name || ''}>
              {client.name || 'Unnamed Client'}
            </option>
          ))}
        </select>

        <h2 className="badge badge-accent">Date de la Facture</h2>
        <input
          type="date"
          value={invoice?.invoiceDate}
          className="input input-bordered w-full resize-none"
          required
          onChange={(e) => handleInputChange(e, 'invoiceDate')}
        />

        <h2 className="badge badge-accent">Date d'échéance</h2>
        <input
          type="date"
          value={invoice?.dueDate}
          className="input input-bordered w-full resize-none"
          required
          onChange={(e) => handleInputChange(e, 'dueDate')}
        />

        <h2 className="badge badge-accent">Poids Brut</h2>
        <input
          type="text"
          value={invoice?.poidsBrut}
          className="input input-bordered w-full resize-none"
          required
          onChange={(e) => handleInputChange(e, 'poidsBrut')}
        />

        <h2 className="badge badge-accent">Poids Net</h2>
        <input
          type="text"
          value={invoice?.poidsNet}
          className="input input-bordered w-full resize-none"
          required
          onChange={(e) => handleInputChange(e, 'poidsNet')}
        />

        <h2 className="badge badge-accent">Nbr Colis</h2>
        <input
          type="text"
          value={invoice?.nbrColis}
          className="input input-bordered w-full resize-none"
          required
          onChange={(e) => handleInputChange(e, 'nbrColis')}
        />

        <h2 className="badge badge-accent">Volume</h2>
        <input
          type="text"
          value={invoice?.volume}
          className="input input-bordered w-full resize-none"
          required
          onChange={(e) => handleInputChange(e, 'volume')}
        />

        <h2 className="badge badge-accent">Origine Tissu</h2>
        <input
          type="text"
          value={invoice?.origineTessuto}
          className="input input-bordered w-full resize-none"
          required
          onChange={(e) => handleInputChange(e, 'origineTessuto')}
        />
      </div>
    </div>
  );
};

export default InvoiceInfo;