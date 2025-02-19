import { LivraisonEntree } from "@/type"
import { LivraisonEntreeLine } from "@prisma/client"
import { Plus, Trash } from "lucide-react"
import React from "react"

interface Props {
    livraisonEntree : LivraisonEntree
    setLivraisonEntree : (livraisonEntree: LivraisonEntree) => void
}

const LivraisonEntreeLines: React.FC<Props> = ({livraisonEntree, setLivraisonEntree}) => {
    const handleAddLine = () => {
        const newLine: LivraisonEntreeLine = {
            id: `${Date.now()}`,
            modele: '',
            commande: '',
            description: '',
            quantityReçu: 1,
            quantityTrouvee: 1,
            createdAt: new Date,
            updatedAt: new Date,
            livraisonEntreeId: ""
        }
        setLivraisonEntree({
            ...livraisonEntree,
            lines: [...livraisonEntree.lines, newLine]
        })
    }

    const handleModeleChange = (index: number, value: string) => {
        const updatedLines = [...livraisonEntree.lines]
        updatedLines[index].modele = value
        setLivraisonEntree({ ...livraisonEntree, lines: updatedLines })
    }

    const handleCommandeChange = (index: number, value: string) => {
        const updatedLines = [...livraisonEntree.lines]
        updatedLines[index].commande = value
        setLivraisonEntree({ ...livraisonEntree, lines: updatedLines })
    }

    const handleDescriptionChange = (index: number, value: string) => {
        const updatedLines = [...livraisonEntree.lines]
        updatedLines[index].description = value
        setLivraisonEntree({ ...livraisonEntree, lines: updatedLines })
    } 

    const handleQuantityReçuChange = (index: number, value: string) => {
        const updatedLines = [...livraisonEntree.lines]
        updatedLines[index].quantityReçu = value === "" ? 0 : parseInt(value)
        setLivraisonEntree({ ...livraisonEntree, lines: updatedLines })
    }
    const handleQuantityTrouveeChange = (index: number, value: string) => {
        const updatedLines = [...livraisonEntree.lines]
        updatedLines[index].quantityTrouvee = value === "" ? 0 : parseInt(value)
        setLivraisonEntree({ ...livraisonEntree, lines: updatedLines })
    }

    const handleRemoveLine = (index: number) => {
        const updatedLines = livraisonEntree.lines.filter((_, i) => i !== index)
        setLivraisonEntree({ ...livraisonEntree, lines: updatedLines })
    }

    return (
        <div className='h-fit bg-base-200 p-5 rounded-xl w-full'>
            <div className='flex justify-between items-center mb-4'>
                <h2 className='badge badge-accent'>Articles or Modéles</h2>
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
                            <th>Modèle</th>
                            <th>Commande</th>
                            <th>Description</th>
                            <th>Quantité Reçu</th>
                            <th>Quantité Trouvée</th>
                            <th>Quantité Manque</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {livraisonEntree.lines.map((line, index) => (
                            <tr key={line.id} >
                                <td>
                                    <input
                                        type="text"
                                        value={line.modele}
                                        className='input input-sm input-bordered w-full'
                                        onChange={(e) => handleModeleChange(index, e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={line.commande}
                                        className='input input-sm input-bordered w-full'
                                        onChange={(e) => handleCommandeChange(index, e.target.value)}
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
                                        value={line.quantityReçu}
                                        className='input input-sm input-bordered w-full'
                                        min={0}
                                        onChange={(e) => handleQuantityReçuChange(index, e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={line.quantityTrouvee}
                                        className='input input-sm input-bordered w-full'
                                        min={0}
                                        onChange={(e) => handleQuantityTrouveeChange(index, e.target.value)}
                                    />
                                </td>
                                <td className="flex items-center justify-center bg-gray-100 rounded-xl h-8 mt-3 text-red-500 font-bold ">
                                {line.quantityTrouvee - line.quantityReçu }
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

export default LivraisonEntreeLines