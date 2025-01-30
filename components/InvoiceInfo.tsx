import { Invoice } from '@/type'
import React from 'react'

interface Props {
    invoice: Invoice 
    setInvoice: (invoice: Invoice) => void
}

const InvoiceInfo: React.FC<Props> = ({ invoice, setInvoice }) => {

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
        setInvoice({ ...invoice, [field]: e.target.value });
    };

    console.log(invoice)

    return (
        <div className='flex flex-col h-fit bg-base-200 p-5 rounded-xl mb-4 md:mb-0'>
            <div className='space-y-4'>
                <h2 className='badge badge-accent'>Émetteur</h2>
                <input
                    type="text"
                    value={invoice?.issuerName}
                    placeholder="Nom de l'entreprise émettrice"
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e , 'issuerName')}
                />
                <h2 className='badge badge-accent'>Adresse Émetteur</h2>
                <input
                    type="text"
                    value={invoice?.issuerAddress}
                    placeholder="Adresse de l'émettrice"
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e , 'issuerAddress')}
                />
                <h2 className='badge badge-accent'>Télephone </h2>
                <input
                    type="text"
                    value={invoice?.phoneemetteur}
                    placeholder="Numéro Télephone d'émettrice"
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e , 'phoneemetteur')}
                />
                <h2 className='badge badge-accent'>Email Émetteur </h2>
                <input
                    type="text"
                    value={invoice?.gmailemetteur}
                    placeholder="Email de l'émettrice"
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e , 'gmailemetteur')}
                />

                

                <h2 className='badge badge-accent'>Client</h2>
                <input
                    type="text"
                    value={invoice?.clientName}
                    placeholder="Nom de l'entreprise cliente"
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e , 'clientName')}
                    
                />
                <h2 className='badge badge-accent'>Adresse de Client </h2>
                <input
                    type="text"
                    value={invoice?.clientAddress}
                    placeholder="Adresse de Client"
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e , 'clientAddress')}
                    
                />
                <h2 className='badge badge-accent'>Télephone de Client</h2>
                <input
                    type="text"
                    value={invoice?.phoneclient}
                    placeholder="Numéro Télephone de Client"
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e , 'phoneclient')}
                    
                />
                <h2 className='badge badge-accent'>Email de Client</h2>
                <input
                    type="text"
                    value={invoice?.gmailclient}
                    placeholder="Email de Client"
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e , 'gmailclient')}
                    
                />

               

                <h2 className='badge badge-accent'>Date de la Facture</h2>
                <input
                    type="date"
                    value={invoice?.invoiceDate}
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e , 'invoiceDate')}
                />

                <h2 className='badge badge-accent'>{"Date d'échéance"}</h2>
                <input
                    type="date"
                    value={invoice?.dueDate}
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e , 'dueDate')}
                />

                <h2 className='badge badge-accent'>Poids Brut</h2>
                <input
                    type="text"
                    value={invoice?.poidsBrut}
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e , 'poidsBrut')}
                />

                <h2 className='badge badge-accent'>Poids Net </h2>
                <input
                    type="text"
                    value={invoice?.poidsNet}
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e , 'poidsNet')}
                />

<h2 className='badge badge-accent'>Nbr Colis</h2>
                <input
                    type="text"
                    value={invoice?.nbrColis}
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e , 'nbrColis')}
                />

<h2 className='badge badge-accent'>Volume</h2>
                <input
                    type="text"
                    value={invoice?.volume}
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e , 'volume')}
                />
                <h2 className='badge badge-accent'>Origine Tissu</h2>
                <input
                    type="text"
                    value={invoice?.origineTessuto}
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e , 'origineTessuto')}
                />

            </div>
        </div>
    )
}

export default InvoiceInfo