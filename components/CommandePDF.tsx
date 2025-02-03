import { Commande } from '@/type'
import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'
import { ArrowDownFromLine, Layers } from 'lucide-react'
import React, { useRef } from 'react'

function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }
    return date.toLocaleDateString('fr-FR', options)
}

const CommandePDF: React.FC<{ commande: Commande }> = ({ commande }) => {
    const commandeRef = useRef<HTMLDivElement>(null)

    const handleDownloadPdf = async () => {
        const element = commandeRef.current
        if (element) {
            try {
                const canvas = await html2canvas(element, { scale: 3, useCORS: true })
                const imgData = canvas.toDataURL('image/png')

                const pdf = new jsPDF({
                    orientation: "portrait",
                    unit: "mm",
                    format: "A4"
                })

                const pdfWidth = pdf.internal.pageSize.getWidth()
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
                pdf.save(`commande-${commande.name}.pdf`)

            } catch (error) {
                console.error('Erreur lors de la génération du PDF :', error)
            }
        }
    }

    return (
        <div className='mt-4 hidden lg:block'>
            <div className='border-base-300 border-2 border-dashed rounded-xl p-5'>
                <button
                    onClick={handleDownloadPdf}
                    className='btn btn-sm btn-accent mb4'>
                    Bon de Commande
                    <ArrowDownFromLine className="w-4" />
                </button>

                <div className='p-8' ref={commandeRef}>
                    <div className='flex justify-between items-center text-sm'>
                        <div className='flex flex-col'>
                            <div>
                                <div className='flex items-center'>
                                    <div className='bg-accent-content text-accent rounded-full p-2'>
                                        <Layers className='h-6 w-6' />
                                    </div>
                                    <span className='ml-3 font-bold text-2xl italic'>
                                        MS<span className='text-accent'>Tailors</span>
                                    </span>
                                </div>
                            </div>
                            <h1 className='text-7xl font-bold uppercase'>Commande</h1>
                        </div>
                        <div className='text-right uppercase'>
                            <p className='badge badge-ghost'>
                                Commande ° {commande.id}
                            </p>
                            <p className='my-2'>
                                <strong>Date </strong>
                                {formatDate(commande.commandeDate)}
                            </p>
                        </div>
                    </div>

                    <div className='my-4 flex justify-between'>
                        <div>
                            <p className='badge badge-ghost mb-1'>Émetteur</p>
                            <p className='text-sm font-bold italic'>{commande.issuerName.toUpperCase()}</p>
                            <p className='text-sm text-gray-500 w-52 break-words'>{commande.issuerAddress}</p>
                        </div>
                        <div className='text-right'>
                            <p className='badge badge-ghost mb-1'>Client</p>
                            <p className='text-sm font-bold italic'>{commande.clientName.toUpperCase()}</p>
                            <p className='text-sm text-gray-500 w-52 break-words'>{commande.clientAddress}</p>
                        </div>
                    </div>

                    <div className='scrollable'>
                        <table className='table table-zebra'>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Réference</th>
                                    <th>Description</th>
                                    <th>Quantité</th>
                                </tr>
                            </thead>
                            <tbody>
                                {commande.lines.map((ligne, index) => (
                                    <tr key={index + 1}>
                                        <td>{index + 1}</td>
                                        <td>{ligne.reference}</td>
                                        <td>{ligne.description}</td>
                                        <td>{ligne.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CommandePDF