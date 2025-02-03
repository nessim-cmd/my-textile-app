import { Commande } from '@/type'
import { CommandeLine } from '@prisma/client'
import { Plus, Trash } from 'lucide-react'
import React from 'react'

interface Props {
    commande: Commande
    setCommande: (commande: Commande) => void
}

const CommandeLines: React.FC<Props> = ({ commande, setCommande }) => {
    const handleAddLine = () => {
        const newLine: CommandeLine = {
            id: `${Date.now()}`,
            reference: '',
            description: "",
            quantity: 1,
            commandeId: commande.id,
        }
        setCommande({
            ...commande,
            lines: [...commande.lines, newLine]
        })
    }

    const handleReferenceChange = (index: number, value: string) => {
        const updatedLines = [...commande.lines]
        updatedLines[index].reference = value
        setCommande({ ...commande, lines: updatedLines })
    }


    const handleDescriptionChange = (index: number, value: string) => {
        const updatedLines = [...commande.lines]
        updatedLines[index].description = value
        setCommande({ ...commande, lines: updatedLines })
    }

    const handleQuantityChange = (index: number, value: string) => {
        const updatedLines = [...commande.lines]
        updatedLines[index].quantity = value === "" ? 0 : parseFloat(value)
        setCommande({ ...commande, lines: updatedLines })
    }

    const handleRemoveLine = (index: number) => {
        const updatedLines = commande.lines.filter((_, i) => i !== index)
        setCommande({ ...commande, lines: updatedLines })
    }

    return (
        <div className='h-fit bg-base-200 p-5 rounded-xl w-full'>
            <div className='flex justify-between items-center mb-4'>
                <h2 className='badge badge-accent'>Articles</h2>
                <button
                    className='btn btn-sm btn-accent'
                    onClick={handleAddLine}
                >
                    <Plus className='w-4' />
                </button>
            </div>

            <div className='scrollable'>
                <table className='table w-full'>
                    <thead className='uppercase'>
                        <tr>
                            <th>Réference</th>
                            <th>Description</th>
                            <th>Quantité</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {commande.lines.map((line, index) => (
                            <tr key={line.id} >
                                <td>
                                    <input
                                        type="text"
                                        value={line.reference}
                                        className='input input-sm input-bordered w-full'
                                        onChange={(e) => handleReferenceChange(index, e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={line.description}
                                        className='input input-sm input-bordered w-full'
                                        onChange={(e) => handleDescriptionChange(index, e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={line.quantity}
                                        className='input input-sm input-bordered w-full'
                                        min={0}
                                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                                    />
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleRemoveLine(index)}
                                        className='btn btn-sm btn-circle btn-accent'>
                                        <Trash className="w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CommandeLines