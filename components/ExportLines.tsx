import { DeclarationExport } from "@/type"
import { ExportLine } from "@prisma/client"
import { Plus, Trash } from "lucide-react"


interface Props {
    exporte: DeclarationExport
    setExports: (exporte: DeclarationExport) => void
}

const ExportLines: React.FC<Props> = ({ exporte, setExports }) => {

    const handleAddLine = () => {
        const newLine: ExportLine = {
            id: `${Date.now()}`,
            commande: '',
            modele:'',
            description: "",
            quantity: 1,
            unitPrice: 0,
            exportId: exporte.id,
            
        }
        setExports({
            ...exporte,
            lines: [...exporte.lines, newLine]
        })
    }

    const handleCommandeChange = (index: number, value: string) => {
        const updatedLines = [...exporte.lines]
        updatedLines[index].commande = value
        setExports({ ...exporte, lines: updatedLines })
    }

    const handleModeleChange = (index: number, value: string) => {
        const updatedLines = [...exporte.lines]
        updatedLines[index].modele = value
        setExports({ ...exporte, lines: updatedLines })
    }

    const handleQuantityChange = (index: number, value: string) => {
        const updatedLines = [...exporte.lines]
        updatedLines[index].quantity = value === "" ? 0 : parseInt(value)
        setExports({ ...exporte, lines: updatedLines })
    }

    const handleDescriptionChange = (index: number, value: string) => {
        const updatedLines = [...exporte.lines]
        updatedLines[index].description = value
        setExports({ ...exporte, lines: updatedLines })
    }

    const handleUnitPriceChange = (index: number, value: string) => {
        const updatedLines = [...exporte.lines]
        updatedLines[index].unitPrice = value === "" ? 0 : parseFloat(value)
        setExports({ ...exporte, lines: updatedLines })
    }

    const handleRemoveLine = (index: number) => {
        const updatedLines = exporte.lines.filter((_, i) => i !== index)
        setExports({ ...exporte, lines: updatedLines })
    }

    return (
        <div className='h-fit bg-base-200 p-5 rounded-xl w-full'>
            <div className='flex justify-between items-center mb-4'>
                <h2 className='badge badge-accent'>Produits </h2>
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
                            <th>Commande</th>
                            <th>Modéle</th>
                            <th>Description</th>
                            <th>Quantité</th>
                            
                            <th>Prix Unitaire (HT)</th>
                            <th>Montant (HT)</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {exporte.lines.map((line, index) => (
                            <tr key={line.id} >
                                <td>
                                    <input
                                        type="text"
                                        value={line.commande}
                                        className='input input-sm input-bordered w-full'
                                        min={0}
                                        onChange={(e) => handleCommandeChange(index, e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={line.modele}
                                        className='input input-sm input-bordered w-full'
                                        min={0}
                                        onChange={(e) => handleModeleChange(index, e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={line.description}
                                        className='input input-sm input-bordered w-full'
                                        min={0}
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
                                    <input
                                        type="number"
                                        value={line.unitPrice}
                                        className='input input-sm input-bordered w-full'
                                        min={0}
                                        step={0.01}
                                        onChange={(e) => handleUnitPriceChange(index, e.target.value)}
                                    />
                                </td>
                                <td className='font-bold'>
                                    {(line.quantity * line.unitPrice).toFixed(2)} €
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleRemoveLine(index) }
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

export default ExportLines