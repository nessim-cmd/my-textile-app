import { Livraison } from '@/type'
import React from 'react'

interface Props {
    livraison: Livraison 
    setLivraison: (livraison: Livraison) => void
}

const LivraisonInfo: React.FC<Props> = ({ livraison, setLivraison }) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
        setLivraison({ ...livraison, [field]: e.target.value })
    }

    return (
        <div className='flex flex-col h-fit bg-base-200 p-5 rounded-xl mb-4 md:mb-0'>
            <div className='space-y-4'>
                <h2 className='badge badge-accent'>Émetteur</h2>
                <input
                    type="text"
                    value={livraison.issuerName}
                    placeholder="Nom de l'entreprise émettrice"
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e, 'issuerName')}
                />
                
                <h2 className='badge badge-accent'>Adresse Émetteur</h2>
                <input
                    type="text"
                    value={livraison.issuerAddress}
                    placeholder="Adresse de l'émettrice"
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e, 'issuerAddress')}
                />

                <h2 className='badge badge-accent'>Client</h2>
                <input
                    type="text"
                    value={livraison.clientName}
                    placeholder="Nom de l'entreprise cliente"
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e, 'clientName')}
                />
                
                <h2 className='badge badge-accent'>Adresse Client</h2>
                <input
                    type="text"
                    value={livraison.clientAddress}
                    placeholder="Adresse de Client"
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e, 'clientAddress')}
                />

                <h2 className='badge badge-accent'>Date de Livraison</h2>
                <input
                    type="date"
                    value={livraison.livraisonDate}
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e, 'livraisonDate')}
                />

                <h2 className='badge badge-accent'>Soumission</h2>
                <input
                    type="text"
                    value={livraison.soumission}
                    className='input input-bordered w-full resize-none'
                    onChange={(e) => handleInputChange(e, 'soumission')}
                />

                <h2 className='badge badge-accent'>Soumission Valable</h2>
                <input
                    type="date"
                    value={livraison.soumissionValable}
                    className='input input-bordered w-full resize-none'
                    onChange={(e) => handleInputChange(e, 'soumissionValable')}
                />
            </div>
        </div>
    )
}

export default LivraisonInfo