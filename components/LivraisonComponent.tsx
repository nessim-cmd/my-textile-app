import { Livraison } from '@/type'
import { FileText, SquareArrowOutUpRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type LivraisonComponentProps = {
    livraison: Livraison;
    index: number
}

const LivraisonComponent: React.FC<LivraisonComponentProps> = ({ livraison }) => {
    return (
        <div className='bg-base-200/90 p-5 rounded-xl space-y-2 shadow'>
            <div className='flex justify-between items-center w-full'>
                <div className='badge badge-lg flex items-center gap-2'>
                    <FileText className='w-4' />
                    {livraison.soumission ? "Soumission" : "En préparation"}
                </div>
                <Link
                    className='btn btn-accent btn-sm'
                    href={`/livraison/${livraison.id}`}>
                    Plus
                    <SquareArrowOutUpRight className='w-4' />
                </Link>
            </div>

            <div className='w-full'>
                <div >
                    <div className='stat-title'>
                        <div className='uppercase text-sm'>{livraison.id}</div>
                    </div>
                    <div className='stat-desc'>
                       {livraison.name}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LivraisonComponent