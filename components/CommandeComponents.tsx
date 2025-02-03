import { Commande } from '@/type'
import { SquareArrowOutUpRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type CommandeComponentProps = {
    commande: Commande;
    index: number
}

const CommandeComponent: React.FC<CommandeComponentProps> = ({ commande }) => {
    return (
        <div className='bg-base-200/90 p-5 rounded-xl space-y-2 shadow'>
            <div className='flex justify-between items-center w-full'>
                
                <Link
                    className='btn btn-accent btn-sm'
                    href={`/commande/${commande.id}`}>
                    Plus
                    <SquareArrowOutUpRight className='w-4' />
                </Link>
            </div>

            <div className='w-full'>
                <div >
                    <div className='stat-title'>
                        <div className='uppercase text-sm'>{commande.id}</div>
                    </div>
                    <div className='stat-desc'>
                       {commande.name}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CommandeComponent