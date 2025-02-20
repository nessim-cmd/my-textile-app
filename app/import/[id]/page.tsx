"use client"

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Save, Trash, Plus, AlertTriangle } from 'lucide-react'
import { DeclarationImport, Model, Accessoire } from '@/type'
import Wrapper from '@/components/Wrapper'

interface Client {
  id: string
  name: string
}

export default function ImportDetailsPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [declaration, setDeclaration] = useState<DeclarationImport | null>(null)
  const [initialDeclaration, setInitialDeclaration] = useState<DeclarationImport | null>(null)
  const [clients, setClients] = useState<Client[]>([]) // Add clients state
  const [isSaveDisabled, setIsSaveDisabled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const fetchDeclaration = async () => {
    try {
      const response = await fetch(`/api/import/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch declaration')
      const data = await response.json()
      setDeclaration(data)
      setInitialDeclaration(data)
    } catch (error) {
      console.error('Error fetching declaration:', error)
    }
  }

  const fetchClients = async () => {
    const res = await fetch('/api/client')
    const data = await res.json()
    setClients(data)
  }

  useEffect(() => {
    if (params.id) fetchDeclaration()
      fetchClients()
  }, [params.id])

  useEffect(() => {
    setIsSaveDisabled(JSON.stringify(declaration) === JSON.stringify(initialDeclaration))
  }, [declaration, initialDeclaration])

  const handleSave = async () => {
    if (!declaration) return
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/import/${declaration.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(declaration)
      })

      if (!response.ok) throw new Error('Failed to update declaration')
      
      await fetchDeclaration()
    } catch (error) {
      console.error('Error saving declaration:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette déclaration ?")
    if (confirmed && declaration?.id) {
      try {
        await fetch(`/api/import/${declaration.id}`, { method: 'DELETE' })
        router.push('/import')
      } catch (error) {
        console.error('Error deleting declaration:', error)
      }
    }
  }

  const addNewModel = () => {
    if (!declaration) return
    const newModel: Model = {
      id: `temp-${Date.now()}`,
      name: '',
      declarationImportId: declaration.id,
      accessories: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setDeclaration({
      ...declaration,
      models: [...declaration.models, newModel]
    })
  }

  const updateModel = (modelId: string, field: string, value: string) => {
    if (!declaration) return
    setDeclaration({
      ...declaration,
      models: declaration.models.map(model => 
        model.id === modelId ? { ...model, [field]: value } : model
      )
    })
  }

  const updateAccessoire = (modelId: string, accId: string, field: string, value: string | number) => {
    if (!declaration) return
    setDeclaration({
      ...declaration,
      models: declaration.models.map(model => {
        if (model.id !== modelId) return model
        return {
          ...model,
          accessories: model.accessories.map(acc => 
            acc.id === accId ? { ...acc, [field]: value } : acc
          )
        }
      })
    })
  }

  const addAccessoireToModel = (modelId: string) => {
    if (!declaration) return
    setDeclaration({
      ...declaration,
      models: declaration.models.map(model => {
        if (model.id !== modelId) return model
        const newAccessoire: Accessoire = {
          id: `temp-acc-${Date.now()}`,
          reference_accessoire: '',
          quantity_reçu: 0,
          quantity_trouve: 0,
          quantity_manque: 0,
          modelId: modelId,
        
         
        }
        return {
          ...model,
          accessories: [...model.accessories, newAccessoire]
        }
      })
    })
  }

  if (!declaration) return (
    <div className='flex justify-center items-center h-screen w-full'>
      <span className='font-bold'>Chargement de la déclaration...</span>
    </div>
  )

  return (
    <Wrapper>
      <div>
        <div className='flex flex-col md:flex-row md:justify-between md:items-center mb-4'>
          <p className='badge badge-ghost badge-lg uppercase'>
            <span>DEC-</span>{declaration.num_dec}
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
          {/* Left Side - Declaration Info */}
          <div className='w-full md:w-1/3 space-y-4'>
            <div className='card bg-base-200 p-4'>
              <h3 className='font-bold mb-2'>Informations Générales</h3>
              <div className='space-y-2'>
                <div className='form-control'>
                  <label className='label'>
                    <span className='label-text'>Numéro DEC</span>
                  </label>
                  <input
                    type="text"
                    className='input input-bordered'
                    value={declaration.num_dec}
                    onChange={(e) => setDeclaration({...declaration, num_dec: e.target.value})}
                  />
                </div>
                
                <div className='form-control'>
                  <label className='label'>
                    <span className='label-text'>{"Date d'Import"}</span>
                  </label>
                  <input
                    type="date"
                    className='input input-bordered'
                    value={new Date(declaration.date_import).toISOString().split('T')[0]}
                    onChange={(e) => setDeclaration({...declaration, date_import: new Date(e.target.value)})}
                  />
                </div>
                
                <div className='form-control'>
                  <label className='label'>
                    <span className='label-text'>Client</span>
                  </label>
                  <select
                    className='select select-bordered w-full'
                    value={declaration.client}
                    onChange={(e) => setDeclaration({...declaration, client: e.target.value})}
                    required
                  >
                    <option value=''>Select Client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.name}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className='form-control'>
                  <label className='label'>
                    <span className='label-text'>Valeur (€)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className='input input-bordered'
                    value={declaration.valeur}
                    onChange={(e) => setDeclaration({...declaration, valeur: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
            </div>

            <div className='card bg-base-200 p-4'>
              <h3 className='font-bold mb-2'>Modèles</h3>
              <button onClick={addNewModel} className='btn btn-sm btn-accent w-full'>
                <Plus className='w-4 mr-2' /> Ajouter Modèle
              </button>
              
              <div className='mt-4 space-y-2'>
                {declaration.models.map(model => (
                  <div key={model.id} className='collapse collapse-arrow bg-base-100'>
                    <input type="checkbox" />
                    <div className='collapse-title font-medium'>
                      {model.name || "Nouveau Modèle"}
                    </div>
                    <div className='collapse-content'>
                      <input
                        type="text"
                        placeholder="Nom du modèle"
                        className='input input-bordered w-full'
                        value={model.name}
                        onChange={(e) => updateModel(model.id, 'name', e.target.value)}
                      />
                      <button 
                        onClick={() => addAccessoireToModel(model.id)}
                        className='btn btn-xs btn-accent mt-2'
                      >
                        <Plus className='w-3 h-3' /> Accessoire
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Accessories Table */}
          <div className='w-full md:w-2/3'>
            <div className='card bg-base-200 p-4'>
              <h3 className='font-bold mb-4'>Accessoires</h3>
              
              {declaration.models.map(model => (
                model.accessories.length > 0 && (
                  <div key={model.id} className='mb-6'>
                    <h4 className='font-semibold mb-2'>{model.name || "Modèle Sans Nom"}</h4>
                    <div className='overflow-x-auto'>
                      <table className='table table-zebra'>
                        <thead>
                          <tr>
                            <th>Référence</th>
                            <th>Quantité Reçue</th>
                            <th>Quantité Trouvée</th>
                            <th>Quantité Manquante</th>
                          </tr>
                        </thead>
                        <tbody>
                          {model.accessories.map(acc => (
                            <tr key={acc.id}>
                              <td>
                                <input
                                  type="text"
                                  className='input input-bordered input-sm'
                                  value={acc.reference_accessoire}
                                  onChange={(e) => updateAccessoire(model.id, acc.id, 'reference_accessoire', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className='input input-bordered input-sm w-20'
                                  value={acc.quantity_reçu}
                                  onChange={(e) => updateAccessoire(model.id, acc.id, 'quantity_reçu', parseInt(e.target.value))}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className='input input-bordered input-sm w-20'
                                  value={acc.quantity_trouve}
                                  onChange={(e) => updateAccessoire(model.id, acc.id, 'quantity_trouve', parseInt(e.target.value))}
                                />
                              </td>
                              <td>
                                <div className="flex items-center">
                                  <span>{acc.quantity_trouve - acc.quantity_reçu}</span>
                                  {(acc.quantity_trouve - acc.quantity_reçu) < 0 && (
                                    <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  )
}