"use client";

import Wrapper from '@/components/Wrapper';
import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from 'react';
import ProductionTable from '../ProductionTable';
import { useParams } from 'next/navigation';

interface FicheProduction {
  id: string;
  clientId: string;
  modelId: string;
  commande: string;
  quantity: number;
  production: ProductionEntry[];
}

interface ProductionEntry {
  day: string;
  hour: string;
  week: string;
  quantityCreated: number;
}

interface Client {
  id: string;
  name: string;
}

interface ClientModel {
  id: string;
  name: string;
  clientId: string;
  client: Client;
}

export default function FicheProductionDetailPage() {
  const { getToken } = useAuth();
  const params = useParams();
  const ficheId = params.id as string;
  const [fiche, setFiche] = useState<FicheProduction | null>(null);
  const [clientName, setClientName] = useState<string>('Unknown Client');
  const [modelName, setModelName] = useState<string>('Unknown Model');
  const [productionData, setProductionData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState<string>('Week 1');

  const fetchFiche = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/fiche-production/${ficheId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch fiche');
      const data: FicheProduction = await res.json();
      setFiche(data);

      const clientRes = await fetch(`/api/client`, { headers: { Authorization: `Bearer ${token}` } });
      const clients: Client[] = await clientRes.json();
      setClientName(clients.find(c => c.id === data.clientId)?.name || 'Unknown Client');

      const modelRes = await fetch(`/api/client-model`, { headers: { Authorization: `Bearer ${token}` } });
      const models: ClientModel[] = await modelRes.json();
      setModelName(models.find(m => m.id === data.modelId)?.name || 'Unknown Model');

      const newProductionData = data.production.reduce((acc, entry) => {
        acc[`${entry.week}-${entry.day}-${entry.hour}`] = entry.quantityCreated;
        return acc;
      }, {} as Record<string, number>);
      setProductionData(newProductionData);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch fiche details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ficheId) fetchFiche();
  }, [ficheId]);

  if (loading) return <div className="text-center"><span className="loading loading-dots loading-lg"></span></div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!fiche) return <div className="text-center">Fiche not found</div>;

  return (
    <Wrapper>
      <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Fiche Production - {fiche.id.slice(0, 3)}</h1>
        <div className="bg-white rounded-xl shadow p-6">
          <ProductionTable
            ficheId={fiche.id}
            clientId={fiche.clientId}
            modelId={fiche.modelId}
            commande={fiche.commande}
            quantity={fiche.quantity}
            productionData={productionData}
            setProductionData={setProductionData}
            setError={setError}
            currentWeek={currentWeek}
            setCurrentWeek={setCurrentWeek}
            getToken={getToken}
            modelName={modelName}
            clientName={clientName}
          />
        </div>
      </div>
    </Wrapper>
  );
}