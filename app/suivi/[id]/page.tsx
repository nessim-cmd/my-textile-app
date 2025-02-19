"use client"

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Save, Trash, Plus } from 'lucide-react'
import { SuiviProduction, SuiviProductionLine } from '@/type'
import Wrapper from '@/components/Wrapper'

export default function SuiviDetailsPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [suivi, setSuivi] = useState<SuiviProduction | null>(null)
  const [initialSuivi, setInitialSuivi] = useState<SuiviProduction | null>(null)
  const [isSaveDisabled, setIsSaveDisabled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const fetchSuivi = async () => {
    try {
      const response = await fetch(`/api/suivi/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch suivi')
      const data = await response.json()
      setSuivi(data)
      setInitialSuivi(data)
    } catch (error) {
      console.error('Error fetching suivi:', error)
    }
  }

  useEffect(() => {
    if (params.id) fetchSuivi()
  }, [params.id])

  useEffect(() => {
    setIsSaveDisabled(JSON.stringify(suivi) === JSON.stringify(initialSuivi))
  }, [suivi, initialSuivi])

  const handleSave = async () => {
    if (!suivi) return
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/suivi/${suivi.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suivi)
      })

      if (!response.ok) throw new Error('Failed to update suivi')
      
      await fetchSuivi()
    } catch (error) {
      console.error('Error saving suivi:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ce suivi ?")
    if (confirmed && suivi?.id) {
      try {
        await fetch(`/api/suivi/${suivi.id}`, { method: 'DELETE' })
        router.push('/suivi')
      } catch (error) {
        console.error('Error deleting suivi:', error)
      }
    }
  }

  const addNewLine = () => {
    if (!suivi) return
    const newLine: SuiviProductionLine = {
      id: `temp-${Date.now()}`,
      commande: '',
      qte_livree: 0,
      qte_reparation: 0,
      numero_livraison: '',
      date_export: new Date(),
      suiviId: suivi.id
    }
    setSuivi({
      ...suivi,
      lines: [...suivi.lines, newLine]
    })
  }

  const updateLine = (lineId: string, field: string, value: any) => {
    if (!suivi) return
    setSuivi({
      ...suivi,
      lines: suivi.lines.map(line => 
        line.id === lineId ? { ...line, [field]: value } : line
      )
    })
  }

  if (!suivi) return (
    <div className='flex justify-center items-center h-screen w-full'>
      <span className='font-bold'>Chargement du suivi...</span>
    </div>
  )

  const adjustedTotalLivree = suivi.lines.reduce((sum, line) => 
    sum + Math.max(0, line.qte_livree - line.qte_reparation), 0)
  const progress = suivi.qte_total > 0 
    ? (adjustedTotalLivree / suivi.qte_total) * 100 
    : 0

  return (
    <Wrapper>
      <div>
        <div className='flex flex-col md:flex-row md:justify-between md:items-center mb-4'>
          <p className='badge badge-ghost badge-lg uppercase'>
            {suivi.model_name} - {suivi.client}
          </p>
          
          <div className='flex md:mt-0 mt-4 '>
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

        <div className='flex flex-col md:flex-row w-full gap-4'>
          <div className='w-full md:w-1/3 space-y-4'>
            <div className='card bg-base-200 p-4'>
              <h3 className='font-bold mb-2'>Informations Générales</h3>
              <div className='space-y-2'>
                <div className='form-control'>
                  <label className='label'>
                    <span className='label-text'>Modèle</span>
                  </label>
                  <input
                    type="text"
                    className='input input-bordered'
                    value={suivi.model_name}
                    onChange={(e) => setSuivi({...suivi, model_name: e.target.value})}
                  />
                </div>
                
                <div className='form-control'>
                  <label className='label'>
                    <span className='label-text'>Quantité Totale</span>
                  </label>
                  <input
                    type="number"
                    className='input input-bordered'
                    value={suivi.qte_total}
                    onChange={(e) => setSuivi({...suivi, qte_total: parseInt(e.target.value)})}
                  />
                </div>
                
                <div className='form-control'>
                  <label className='label'>
                    <span className='label-text'>Client</span>
                  </label>
                  <input
                    type="text"
                    className='input input-bordered'
                    value={suivi.client}
                    onChange={(e) => setSuivi({...suivi, client: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className='card bg-base-200 p-4'>
              <h3 className='font-bold mb-2'>Progression</h3>
              <div className='mt-2'>
                <div className='flex justify-between mb-1'>
                    <span>Livraison: {adjustedTotalLivree}/{suivi.qte_total}</span>
                    <span>{progress.toFixed(1)}%</span>
                </div>
                <progress 
                    className='progress progress-accent w-full' 
                    value={adjustedTotalLivree} 
                    max={suivi.qte_total}
                />
                </div>
            </div>
          </div>

          <div className='w-full md:w-2/3'>
            <div className='card bg-base-200 p-4'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='font-bold'>Lignes de Commande</h3>
                <button onClick={addNewLine} className='btn btn-sm btn-accent'>
                  <Plus className='w-4 mr-2' /> Ajouter Ligne
                </button>
              </div>
              
              <div className='overflow-x-auto'>
                <table className='table table-zebra'>
                  <thead>
                    <tr>
                      <th>Commande</th>
                      <th>Qté Livrée</th>
                      <th>N° Livraison</th>
                      <th>Date Export</th>
                      <th>Qté Réparation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suivi.lines.map(line => (
                      <tr key={line.id}>
                        <td>
                          <input
                            type="text"
                            className='input input-bordered input-sm'
                            value={line.commande}
                            onChange={(e) => updateLine(line.id, 'commande', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className='input input-bordered input-sm w-20'
                            value={line.qte_livree}
                            onChange={(e) => updateLine(line.id, 'qte_livree', parseInt(e.target.value))}
                          />
                        </td>
                       
                        <td>
                          <input
                            type="text"
                            className='input input-bordered input-sm'
                            value={line.numero_livraison}
                            onChange={(e) => updateLine(line.id, 'numero_livraison', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="date"
                            className='input input-bordered input-sm'
                            value={new Date(line.date_export).toISOString().split('T')[0]}
                            onChange={(e) => updateLine(line.id, 'date_export', new Date(e.target.value))}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className='input input-bordered input-sm w-20'
                            value={line.qte_reparation}
                            onChange={(e) => updateLine(line.id, 'qte_reparation', parseInt(e.target.value))}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  )
}