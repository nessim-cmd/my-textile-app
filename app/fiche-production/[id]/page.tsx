"use client";

import Wrapper from '@/components/Wrapper';
import { useAuth, useUser } from "@clerk/nextjs"; // Added useUser
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
  const { user } = useUser(); // Added to get email
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
    if (!user?.primaryEmailAddress?.emailAddress) {
      setError("User email not available");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = await getToken();

      // Fetch fiche
      const ficheRes = await fetch(`/api/fiche-production/${ficheId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!ficheRes.ok) {
        const errorData = await ficheRes.json();
        throw new Error(`Failed to fetch fiche: ${errorData.error || ficheRes.statusText}`);
      }
      const data: FicheProduction = await ficheRes.json();
      setFiche(data);

      // Fetch clients
      const clientRes = await fetch(`/api/client`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!clientRes.ok) {
        const errorData = await clientRes.json();
        throw new Error(`Failed to fetch clients: ${errorData.error || clientRes.statusText}`);
      }
      const clients: Client[] = await clientRes.json();
      setClientName(clients.find(c => c.id === data.clientId)?.name || 'Unknown Client');

      // Fetch models with email
      const email = encodeURIComponent(user.primaryEmailAddress.emailAddress);
      const modelRes = await fetch(`/api/client-model?email=${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!modelRes.ok) {
        const errorData = await modelRes.json();
        throw new Error(`Failed to fetch models: ${errorData.error || modelRes.statusText}`);
      }
      const models: ClientModel[] = await modelRes.json();
      setModelName(models.find(m => m.id === data.modelId)?.name || 'Unknown Model');

      // Set production data
      const newProductionData = data.production.reduce((acc, entry) => {
        acc[`${entry.week}-${entry.day}-${entry.hour}`] = entry.quantityCreated;
        return acc;
      }, {} as Record<string, number>);
      setProductionData(newProductionData);
    } catch (err) {
      console.error('Fetch error:', err);
      setError((err as Error).message || 'Failed to fetch fiche details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ficheId) fetchFiche();
  }, [ficheId, user]); // Added user to dependencies

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