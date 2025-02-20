import { Invoice, Totals } from '@/type'
import confetti from 'canvas-confetti'
import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'
import { ArrowDownFromLine, Layers } from 'lucide-react'
import React, { useRef } from 'react'

import n2words from 'n2words'

interface FacturePDFProps {
    invoice: Invoice
    totals: Totals
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
}

// Update the convertToFrenchCurrency function
function convertToFrenchCurrency(amount: number): string {
    const whole = Math.floor(amount);
    const cents = Math.round((amount - whole) * 100);
    
    let eurosInWords = n2words(whole, { lang: 'fr' })
        .replace(/-/g, ' ')
        .replace(/,\s/g, ' ')
        .toUpperCase();

    eurosInWords += whole === 1 ? ' EURO' : ' EUROS';

    let centsInWords = '';
    if (cents > 0) {
        centsInWords = n2words(cents, { lang: 'fr' })
            .replace(/-/g, ' ')
            .replace(/,\s/g, ' ')
            .toUpperCase();
        centsInWords += cents === 1 ? ' CENTIME' : ' CENTIMES';
    }

    return cents > 0 
        ? `${eurosInWords} ET ${centsInWords}`
        : eurosInWords;
}


const InvoicePDF: React.FC<FacturePDFProps> = ({ invoice, totals }) => {

    const factureRef = useRef<HTMLDivElement>(null)

    const handleDownloadPdf = async () => {
        const element = factureRef.current
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
                pdf.save(`facture-${invoice.name}.pdf`)

                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    zIndex: 9999
                })

            } catch (error) {
                console.error('Erreur lors de la génération du PDF :', error);
            }
        }
    }
    {
        const invoiceData = [];
        if (invoice.origineTessuto) invoiceData.push({ label: 'Origine TessuTo', value: invoice.origineTessuto });
        if (invoice.poidsBrut) invoiceData.push({ label: 'Poids Brut', value: invoice.poidsBrut });
        if (invoice.poidsNet) invoiceData.push({ label: 'Poids Net', value: invoice.poidsNet });
        if (invoice.nbrColis) invoiceData.push({ label: 'Nombre de Colis', value: invoice.nbrColis });
        if (invoice.volume) invoiceData.push({ label: 'Volume', value: `${invoice.volume} m³` });
        invoiceData.push({ label: 'Mode Paiement', value: invoice.modePaiment === 1 ? 'Virement bancaire' : invoice.modePaiment === 2 ? 'Chèque' : invoice.modePaiment === 3 ? 'Espèce' : 'Non défini' });
        invoiceData.push({ label: 'Banque', value: 'Amen Bank Agence Korba' });
        invoiceData.push({ label: 'RIB', value: '07 304 0056146070418 84' });
        invoiceData.push({ label: 'IBAN', value: 'TN59 07304005614607041884' });
        invoiceData.push({ label: 'SWIFT', value: 'CFCTTNTT' });
      
        const columns = [[], [], []];
        invoiceData.forEach((item, index) => {
          columns[index % 3].push(item);
        });

    return (
        <div className='mt-4 hidden lg:block'>
            <div className='border-base-300 border-2 border-dashed rounded-xl p-5'>

                <button
                    onClick={handleDownloadPdf}
                    className='btn btn-sm btn-accent mb4'>
                    Facture PDF
                    <ArrowDownFromLine className="w-4" />
                </button>

                <div className='p-8' ref={factureRef}>

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
                            <h1 className='text-7xl font-bold uppercase'>Facture</h1>
                        </div>
                        <div className='text-right uppercase'>
                            <p className='badge badge-ghost'>
                                Facture ° {invoice.id}
                            </p>
                            <p className='my-2'>
                                <strong>Date </strong>
                                {formatDate(invoice.invoiceDate)}
                            </p>
                            <p>
                                <strong>{"Date d'échéance"} </strong>
                                {formatDate(invoice.dueDate)}
                            </p>
                        </div>

                    </div>

                    <div className='my-4 flex justify-between'>
                        <div>
                            <p className='badge badge-ghost mb-1'>Émetteur</p>
                            <p className='text-sm font-bold italic'>MS Tailors</p>
                            <p className='text-sm text-gray-500 w-52 break-words'>{"Rue de l'envoronnenment El mida ,8044"}</p>
                            <p className='text-sm text-gray-500 w-52 break-words'>72217400</p>
                            <p className='text-sm text-gray-500 w-52 break-words'>mariemms360@gmail.com</p>
                        </div>
                        <div className='text-right'>
                            <p className='badge badge-ghost mb-1'>Client</p>
                            <p className='text-sm font-bold italic'>{invoice.clientName.toUpperCase()}</p>
                            <p className='text-sm text-gray-500 w-52 break-words'>{invoice.clientAddress}</p>
                            <p className='text-sm text-gray-500 w-52 break-words'>{invoice.phoneclient}</p>
                            <p className='text-sm text-gray-500 w-52 break-words'>{invoice.gmailclient}</p>
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
                                    <th>Prix Unitaire</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.lines.map((ligne, index) => (
                                    <tr key={index + 1}>
                                        <td>{index + 1}</td>
                                        <td>{ligne.reference}</td>
                                        <td>{ligne.description}</td>
                                        <td>{ligne.quantity}</td>
                                        <td>{ligne.unitPrice.toFixed(2)} €</td>
                                        <td>{(ligne.quantity * ligne.unitPrice).toFixed(2)} €</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className='mt-4 space-y-2 text-md'>
                        <div className='flex justify-between'>
                            <div className='font-bold'>
                                Total Hors Taxes
                            </div>
                            <div>
                                {totals.totalHT.toFixed(2)} €
                            </div>
                        </div>

                        {invoice.vatActive && (
                            <div className='flex justify-between'>
                                <div className='font-bold'>
                                    TVA {invoice.vatRate} %
                                </div>
                                <div>
                                    {totals.totalVAT.toFixed(2)} €
                                </div>
                            </div>
                        )}

                        <div className='flex justify-between'>
                            <div className='font-bold'>
                                Total Toutes Taxes Comprises
                            </div>
                            <div className='badge badge-accent'>
                                {totals.totalTTC.toFixed(2)} €
                            </div>
                        </div>
                    </div>

                    <div className="mt-2 border border-gray-300 rounded-lg w-full"> {/* Key change: w-full */}
                        <div className="px-4 py-1"> {/* Added padding for better appearance */}
                            <h2 className="text-sm font-semibold mb-2 text-gray-600">Montant en lettres:</h2>
                            <p className="text-xs font-bold uppercase tracking-wide break-words"> {/* Added break-words */}
                                {convertToFrenchCurrency(totals.totalTTC)}
                            </p>
                        </div>
                    </div>

                    <hr className="border-t-2 border-gray-400 my-2" />

                    <div className="grid grid-cols-3 gap-4 p-2 border border-gray-300 rounded-lg shadow-md text-sm">
                    {columns.map((column, colIndex) => (
                        <div key={colIndex} className="flex flex-col space-y-1">
                        {column.map((item, index) => (
                            <div key={index} className="flex justify-between">
                            <span className='font-bold'>{item.label} :</span> <span>{item.value}</span>
                            </div>
                        ))}
                        </div>
                    ))}
                    </div>

                </div>
            </div>
        </div>
    )
}
}

export default InvoicePDF
