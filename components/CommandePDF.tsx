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
    const headerRef = useRef<HTMLDivElement>(null)
    const tableHeaderRef = useRef<HTMLTableSectionElement>(null)

    const handleDownloadPdf = async () => {
        const element = commandeRef.current
        const header = headerRef.current
        const tableHeader = tableHeaderRef.current
        if (!element || !header || !tableHeader) return

        try {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'A4',
                compress: true,
            })

            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = pdf.internal.pageSize.getHeight()
            const margin = 10
            const maxContentHeight = pdfHeight - 2 * margin

            // Capture header (logo, title, issuer/client info)
            const headerCanvas = await html2canvas(header, {
                scale: 5, // Increased scale for sharper, larger output
                useCORS: true,
                logging: false,
            })
            const headerImgData = headerCanvas.toDataURL('image/jpeg', 0.95)
            const headerHeight = (headerCanvas.height * (pdfWidth - 2 * margin)) / headerCanvas.width

            // Capture table header
            const tableHeaderCanvas = await html2canvas(tableHeader, {
                scale: 5,
                useCORS: true,
                logging: false,
            })
            const tableHeaderImgData = tableHeaderCanvas.toDataURL('image/jpeg', 0.95)
            const tableHeaderHeight = (tableHeaderCanvas.height * (pdfWidth - 2 * margin)) / tableHeaderCanvas.width

            let currentY = margin
            let pageNumber = 1

            // Add header on first page
            pdf.addImage(headerImgData, 'JPEG', margin, currentY, pdfWidth - 2 * margin, headerHeight)
            currentY += headerHeight + 5

            // Add table header on first page
            pdf.addImage(tableHeaderImgData, 'JPEG', margin, currentY, pdfWidth - 2 * margin, tableHeaderHeight)
            currentY += tableHeaderHeight

            // Process table rows
            const tableRows = element.querySelectorAll('tbody tr') as NodeListOf<HTMLTableRowElement>
            const rowHeight = 15 // Increased row height for larger text
            const rowsPerPage = Math.floor((maxContentHeight - headerHeight - tableHeaderHeight - 10) / rowHeight)

            for (let i = 0; i < tableRows.length; i++) {
                const row = tableRows[i]

                // Check if we need a new page
                if (currentY + rowHeight > maxContentHeight && i > 0) {
                    pdf.addPage()
                    pageNumber++
                    currentY = margin

                    // Add header on new page
                    pdf.addImage(headerImgData, 'JPEG', margin, currentY, pdfWidth - 2 * margin, headerHeight)
                    currentY += headerHeight + 5

                    // Add table header on new page
                    pdf.addImage(tableHeaderImgData, 'JPEG', margin, currentY, pdfWidth - 2 * margin, tableHeaderHeight)
                    currentY += tableHeaderHeight
                }

                // Capture individual row
                const rowCanvas = await html2canvas(row, {
                    scale: 5,
                    useCORS: true,
                    logging: false,
                })
                const rowImgData = rowCanvas.toDataURL('image/jpeg', 0.95)
                const rowHeightActual = (rowCanvas.height * (pdfWidth - 2 * margin)) / rowCanvas.width

                pdf.addImage(rowImgData, 'JPEG', margin, currentY, pdfWidth - 2 * margin, rowHeightActual)
                currentY += rowHeightActual
            }

            // Add page numbers
            pdf.setFontSize(12)
            for (let i = 1; i <= pageNumber; i++) {
                pdf.setPage(i)
                pdf.text(`Page ${i} of ${pageNumber}`, pdfWidth - margin - 20, pdfHeight - margin)
            }

            pdf.save(`commande-${commande.name}.pdf`)
        } catch (error) {
            console.error('Erreur lors de la génération du PDF :', error)
        }
    }

    return (
        <div className='mt-4 hidden lg:block'>
            <div className='border-base-300 border-2 border-dashed rounded-xl p-5'>
                <button
                    onClick={handleDownloadPdf}
                    className='btn btn-sm btn-accent mb-4'>
                    Bon de Commande
                    <ArrowDownFromLine className='w-4' />
                </button>

                <div className='p-8 text-base' ref={commandeRef}>
                    <div ref={headerRef}>
                        <div className='flex justify-between items-center text-base'>
                            <div className='flex flex-col'>
                                <div>
                                    <div className='flex items-center'>
                                        <div className='bg-accent-content text-accent rounded-full p-3'>
                                            <Layers className='h-8 w-8' />
                                        </div>
                                        <span className='ml-3 font-bold text-3xl italic'>
                                            MS<span className='text-accent'>Tailors</span>
                                        </span>
                                    </div>
                                </div>
                                <h1 className='text-8xl font-bold uppercase'>Commande</h1>
                            </div>
                            <div className='text-right uppercase'>
                                <p className='badge badge-ghost text-base'>
                                    Commande ° {commande.id}
                                </p>
                                <p className='my-2 text-base'>
                                    <strong>Date </strong>
                                    {formatDate(commande.commandeDate)}
                                </p>
                            </div>
                        </div>

                        <div className='my-4 flex justify-between text-base'>
                            <div>
                                <p className='badge badge-ghost mb-1 text-base'>Émetteur</p>
                                <p className='font-bold italic'>{commande.issuerName.toUpperCase()}</p>
                                <p className='text-gray-500 w-60 break-words'>{commande.issuerAddress}</p>
                            </div>
                            <div className='text-right'>
                                <p className='badge badge-ghost mb-1 text-base'>Client</p>
                                <p className='font-bold italic'>{commande.clientName.toUpperCase()}</p>
                                <p className='text-gray-500 w-60 break-words'>{commande.clientAddress}</p>
                            </div>
                        </div>
                    </div>

                    <div className='scrollable'>
                        <table className='table table-zebra text-base'>
                            <thead ref={tableHeaderRef}>
                                <tr>
                                    <th></th>
                                   
                                    <th>Description</th>
                                    <th>Quantité</th>
                                </tr>
                            </thead>
                            <tbody>
                                {commande.lines.map((ligne, index) => (
                                    <tr key={index + 1}>
                                        <td>{index + 1}</td>
                                        
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