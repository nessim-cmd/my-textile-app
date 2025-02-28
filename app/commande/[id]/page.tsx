"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Save, Trash } from "lucide-react";
import { Commande } from "@/type";
import Wrapper from "@/components/Wrapper";
import CommandeInfo from "@/components/CommandeInfo";
import CommandeLines from "@/components/CommandeLines";
import CommandePDF from "@/components/CommandePDF";
import { useAuth } from "@clerk/nextjs"; // Add Clerk auth hook

export default function CommandePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { getToken } = useAuth(); // Get Clerk auth token
  const [commande, setCommande] = useState<Commande | null>(null);
  const [initialCommande, setInitialCommande] = useState<Commande | null>(null);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Add error state

  const fetchCommande = async () => {
    try {
      const token = await getToken(); // Get fresh token
      const response = await fetch(`/api/commande/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch commande');
      const data = await response.json();
      setCommande(data);
      setInitialCommande(data);
    } catch (error) {
      console.error('Error fetching commande:', error);
    }
  };

  useEffect(() => {
    if (params.id) fetchCommande();
  }, [params.id]);

  useEffect(() => {
    setIsSaveDisabled(JSON.stringify(commande) === JSON.stringify(initialCommande));
  }, [commande, initialCommande]);

  const handleSave = async () => {
    if (!commande) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const token = await getToken(); // Get fresh token for each request
      const response = await fetch(`/api/commande/${commande.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` // Add auth header
        },
        body: JSON.stringify(commande),
        signal: AbortSignal.timeout(30000) // 30-second timeout
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update commande');
      }

      await fetchCommande(); // Refresh data after save
    } catch (error) {
      console.error('Error saving commande:', error);
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette commande ?");
    if (confirmed && commande?.id) {
      try {
        const token = await getToken();
        await fetch(`/api/commande/${commande.id}`, { 
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        router.push('/commande');
      } catch (error) {
        console.error('Error deleting commande:', error);
        setErrorMessage("Failed to delete commande. Please try again.");
      }
    }
  };

  if (!commande) return (
    <div className='flex justify-center items-center h-screen w-full'>
      <span className='font-bold'>Chargement de la Commande...</span>
    </div>
  );

  return (
    <Wrapper>
      <div>
        <div className='flex flex-col md:flex-row md:justify-between md:items-center mb-4'>
          <p className='badge badge-ghost badge-lg uppercase'>
            <span>Commande-</span>{commande.id}
          </p>
          
          <div className='flex md:mt-0 mt-4'>
            <button
              className='btn btn-sm btn-accent ml-4'
              disabled={isSaveDisabled || isLoading}
              onClick={handleSave}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  Sauvegarder
                  <Save className="w-4 ml-2" />
                </>
              )}
            </button>

            <button
              onClick={handleDelete}
              className='btn btn-sm btn-accent ml-4'
            >
              <Trash className='w-4' />
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="alert alert-error mb-4">
            {errorMessage}
          </div>
        )}

        <div className='flex flex-col md:flex-row w-full'>
          <div className='flex w-full md:w-1/3 flex-col'>
            <CommandeInfo commande={commande} setCommande={setCommande} />
          </div>

          <div className='flex w-full md:w-2/3 flex-col md:ml-4'>
            <CommandeLines commande={commande} setCommande={setCommande} />
            <CommandePDF commande={commande} />
          </div>
        </div>
      </div>
    </Wrapper>
  );
}