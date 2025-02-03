import { Commande } from '@/type'
import React from 'react'

interface Props {
    commande: Commande 
    setCommande: (commande: Commande) => void
}

const CommandeInfo: React.FC<Props> = ({ commande, setCommande }) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
        setCommande({ ...commande, [field]: e.target.value })
    }

    return (
        <div className='flex flex-col h-fit bg-base-200 p-5 rounded-xl mb-4 md:mb-0'>
            <div className='space-y-4'>
                <h2 className='badge badge-accent'>Émetteur</h2>
                <input
                    type="text"
                    value={commande.issuerName}
                    placeholder="Nom de l'entreprise émettrice"
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e, 'issuerName')}
                />
                
                <h2 className='badge badge-accent'>Adresse Émetteur</h2>
                <input
                    type="text"
                    value={commande.issuerAddress}
                    placeholder="Adresse de l'émettrice"
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e, 'issuerAddress')}
                />

                <h2 className='badge badge-accent'>Client</h2>
                <input
                    type="text"
                    value={commande.clientName}
                    placeholder="Nom de l'entreprise cliente"
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e, 'clientName')}
                />
                
                <h2 className='badge badge-accent'>Adresse Client</h2>
                <input
                    type="text"
                    value={commande.clientAddress}
                    placeholder="Adresse de Client"
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e, 'clientAddress')}
                />

                <h2 className='badge badge-accent'>Date de Commande</h2>
                <input
                    type="date"
                    value={commande.commandeDate}
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e, 'commandeDate')}
                />

               
            </div>
        </div>
    )
}

export default CommandeInfo