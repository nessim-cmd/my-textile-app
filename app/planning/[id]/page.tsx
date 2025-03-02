"use client";

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Save, Trash } from 'lucide-react';

import { Planning } from '@/type';
import Wrapper from '@/components/Wrapper';
import PlanningLines from '@/components/PlanningLines';
import PlanningPDF from '@/components/PlanningPDF';

export default function PlanningDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [planning, setPlanning] = useState<Planning | null>(null);
  const [initialPlanning, setInitialPlanning] = useState<Planning | null>(null);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPlanning = useCallback(async () => {
    try {
      const response = await fetch(`/api/planning/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch planning');
      const data = await response.json();
      setPlanning(data);
      setInitialPlanning(data);
    } catch (error) {
      console.error('Error fetching planning:', error);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) fetchPlanning();
  }, [params.id, fetchPlanning]);

  useEffect(() => {
    setIsSaveDisabled(JSON.stringify(planning) === JSON.stringify(initialPlanning));
  }, [planning, initialPlanning]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!planning) return;
    setPlanning({ ...planning, status: e.target.value as 'EN_COURS' | 'EN_PAUSE' | 'EN_ATTENTE' | 'FINI' });
  };

  const handleSave = async () => {
    if (!planning) return;
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/planning/${planning.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planning),
      });

      if (!response.ok) throw new Error('Failed to update planning');
      
      await fetchPlanning();
    } catch (error) {
      console.error('Error saving planning:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ce planning ?");
    if (confirmed && planning?.id) {
      try {
        await fetch(`/api/planning/${planning.id}`, { method: 'DELETE' });
        router.push('/planning');
      } catch (error) {
        console.error('Error deleting planning:', error);
      }
    }
  };

  if (!planning) return (
    <div className='flex justify-center items-center h-screen w-full'>
      <span className='font-bold'>Chargement du planning...</span>
    </div>
  );

  return (
    <Wrapper>
      <div>
        <div className='flex flex-col md:flex-row md:justify-between md:items-center mb-4'>
          <p className='badge badge-ghost badge-lg uppercase'>
            <span>Planning-</span>{planning.id}
          </p>
          
          <div className='flex md:mt-0 mt-4 gap-2'>
            <select
              className='select select-sm select-bordered w-full'
              value={planning.status}
              onChange={handleStatusChange}
            >
              <option value="EN_COURS">En Cours</option>
              <option value="EN_PAUSE">En Pause</option>
              <option value="EN_ATTENTE">En Attente</option>
              <option value="FINI">Terminé</option>
            </select>

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

        <div className='flex flex-col w-full'>
          <div className='w-full'>
            <input
              type="text"
              value={planning.name}
              onChange={(e) => setPlanning({ ...planning, name: e.target.value })}
              className='input input-ghost text-2xl font-bold mb-4 w-full'
            />
            
            <PlanningLines planning={planning} setPlanning={setPlanning} />
            <PlanningPDF planning={planning} />
          </div>
        </div>
      </div>
    </Wrapper>
  );
}