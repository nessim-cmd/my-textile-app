import { Planning } from '@/type'
import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'
import { ArrowDownFromLine } from 'lucide-react'
import React, { useRef } from 'react'

const PlanningPDF: React.FC<{ planning: Planning }> = ({ planning }) => {
    const pdfRef = useRef<HTMLDivElement>(null)

    const handleDownloadPdf = async () => {
        const element = pdfRef.current
        if (element) {
            try {
                const canvas = await html2canvas(element, { scale: 3, useCORS: true })
                const imgData = canvas.toDataURL('image/png')

                const pdf = new jsPDF({
                    orientation: "landscape",
                    unit: "mm",
                    format: "A4"
                })

                const pdfWidth = pdf.internal.pageSize.getWidth()
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
                pdf.save(`planning-${planning.name}.pdf`)

            } catch (error) {
                console.error('Erreur lors de la génération du PDF :', error);
            }
        }
    }

    return (
        <div className='mt-4 hidden lg:block'>
            <div className='border-base-300 border-2 border-dashed rounded-xl p-5'>
                <button
                    onClick={handleDownloadPdf}
                    className='btn btn-sm btn-accent mb-4'>
                    Télécharger PDF
                    <ArrowDownFromLine className="w-4" />
                </button>

                <div className='p-8' ref={pdfRef}>
                    <div className='flex justify-between items-center mb-8'>
                        <div className='flex items-center'>
                            <div className='bg-accent-content text-accent rounded-full p-2'>
                                <span className='text-2xl font-bold'>MS</span>
                            </div>
                            <span className='ml-3 font-bold text-2xl italic'>
                                Tailors
                            </span>
                        </div>
                        <h1 className='text-3xl font-bold'>PLANNING : {planning.name}</h1>
                        <div className='badge badge-lg'>
                            {planning.status}
                        </div>
                    </div>

                    <table className='table w-full'>
                        <thead>
                            <tr>
                                <th>Modèle</th>
                                <th>Lotto</th>
                                <th>Dates Import/Export</th>
                                <th>Dates Coupe</th>
                                <th>Dates Chaîne</th>
                                <th>Variantes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {planning.models.map((model) => (
                                <tr key={model.id}>
                                    <td>{model.name}</td>
                                    <td>{model.lotto}</td>
                                    <td>
                                        {new Date(model.date_import).toLocaleDateString()} - 
                                        {new Date(model.date_export).toLocaleDateString()}
                                    </td>
                                    <td>
                                        {new Date(model.date_entre_coupe).toLocaleDateString()} - 
                                        {new Date(model.date_sortie_coupe).toLocaleDateString()}
                                    </td>
                                    <td>
                                        {new Date(model.date_entre_chaine).toLocaleDateString()} - 
                                        {new Date(model.date_sortie_chaine).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <ul>
                                            {model.variantes.map(variante => (
                                                <li key={variante.id}>
                                                    {variante.name} ({variante.qte_variante})
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default PlanningPDF