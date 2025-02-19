import { ModelPlan, Planning, Variante } from '@/type'
import { Plus, Trash } from 'lucide-react'
import React from 'react'

interface Props {
    planning: Planning
    setPlanning: (planning: Planning) => void
}

const PlanningLines: React.FC<Props> = ({ planning, setPlanning }) => {
    const addModel = () => {
        const newModel: ModelPlan = {
            id: `${Date.now()}`,
            name: '',
            lotto: '',
            commande: '',
            ordine: '',
            faconner: '',
            designation: '',
            date_import: new Date(),
            date_export: new Date(),
            date_entre_coupe: new Date(),
            date_sortie_coupe: new Date(),
            date_entre_chaine: new Date(),
            date_sortie_chaine: new Date(),
            variantes: [],
            planningId: planning.id,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        setPlanning({
            ...planning,
            models: [...planning.models, newModel]
        })
    }

    const addVariante = (modelIndex: number) => {
        const updatedModels = [...planning.models]
        const newVariante: Variante = {
            id: `${Date.now()}`,
            name: '',
            qte_variante: 0,
            modelId: updatedModels[modelIndex].id,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        updatedModels[modelIndex].variantes.push(newVariante)
        setPlanning({ ...planning, models: updatedModels })
    }

    const handleModelChange = (modelIndex: number, field: string, value: any) => {
        const updatedModels = [...planning.models]
        updatedModels[modelIndex] = { ...updatedModels[modelIndex], [field]: value }
        setPlanning({ ...planning, models: updatedModels })
    }

    const handleVarianteChange = (modelIndex: number, varianteIndex: number, field: string, value: any) => {
        const updatedModels = [...planning.models]
        updatedModels[modelIndex].variantes[varianteIndex] = {
            ...updatedModels[modelIndex].variantes[varianteIndex],
            [field]: value
        }
        setPlanning({ ...planning, models: updatedModels })
    }

    const removeModel = (modelIndex: number) => {
        const updatedModels = planning.models.filter((_, i) => i !== modelIndex)
        setPlanning({ ...planning, models: updatedModels })
    }

    const removeVariante = (modelIndex: number, varianteIndex: number) => {
        const updatedModels = [...planning.models]
        updatedModels[modelIndex].variantes = updatedModels[modelIndex].variantes.filter((_, i) => i !== varianteIndex)
        setPlanning({ ...planning, models: updatedModels })
    }

    return (
        <div className='h-fit bg-base-200 p-5 rounded-xl w-full'>
            <div className='flex justify-between items-center mb-4'>
                <h2 className='badge badge-accent'>Modèles</h2>
                <button
                    className='btn btn-sm btn-accent'
                    onClick={addModel}
                >
                    <Plus className='w-4' />
                </button>
            </div>

            <div className='space-y-4'>
                {planning.models.map((model, modelIndex) => (
                    <div key={model.id} className='border p-4 rounded-lg'>
                        <div className='flex justify-between items-center mb-4'>
                            <h3 className='font-bold'>Modèle {modelIndex + 1}</h3>
                            <button
                                onClick={() => removeModel(modelIndex)}
                                className='btn btn-sm btn-error'
                            >
                                <Trash className="w-4" />
                            </button>
                        </div>

                        <div className='grid grid-cols-2 gap-4 mb-4'>
                            <input
                                type="text"
                                placeholder="Nom du modèle"
                                className='input input-bordered'
                                value={model.name}
                                onChange={(e) => handleModelChange(modelIndex, 'name', e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Lotto"
                                className='input input-bordered'
                                value={model.lotto}
                                onChange={(e) => handleModelChange(modelIndex, 'lotto', e.target.value)}
                            />
                            {/* Add other model fields similarly */}
                        </div>

                        <div className='mb-4'>
                            <div className='flex justify-between items-center mb-2'>
                                <h4 className='text-sm font-semibold'>Variantes</h4>
                                <button
                                    className='btn btn-xs btn-accent'
                                    onClick={() => addVariante(modelIndex)}
                                >
                                    <Plus className='w-3' />
                                </button>
                            </div>
                            
                            {model.variantes.map((variante, varianteIndex) => (
                                <div key={variante.id} className='flex gap-2 mb-2'>
                                    <input
                                        type="text"
                                        placeholder="Nom variante"
                                        className='input input-bordered input-sm flex-1'
                                        value={variante.name}
                                        onChange={(e) => handleVarianteChange(modelIndex, varianteIndex, 'name', e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Quantité"
                                        className='input input-bordered input-sm w-24'
                                        value={variante.qte_variante}
                                        onChange={(e) => handleVarianteChange(modelIndex, varianteIndex, 'qte_variante', parseInt(e.target.value))}
                                    />
                                    <button
                                        onClick={() => removeVariante(modelIndex, varianteIndex)}
                                        className='btn btn-xs btn-error'
                                    >
                                        <Trash className="w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PlanningLines