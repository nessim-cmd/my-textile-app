import { Planning } from '@/type'
import { CheckCircle, Clock, Pause, SquareArrowOutUpRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react'

type PlanningComponentProps = {
    planning: Planning;
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'EN_COURS':
            return (
                <div className='badge badge-lg badge-success flex items-center gap-2'>
                    <CheckCircle className='w-4' />
                    En Cours
                </div>
            )
        case 'EN_PAUSE':
            return (
                <div className='badge badge-lg badge-warning flex items-center gap-2'>
                    <Pause className='w-4' />
                    En Pause
                </div>
            )
        case 'EN_ATTENTE':
            return (
                <div className='badge badge-lg badge-info flex items-center gap-2'>
                    <Clock className='w-4' />
                    En Attente
                </div>
            )
        case 'FINI':
            return (
                <div className='badge badge-lg badge-error flex items-center gap-2'>
                    <CheckCircle className='w-4' />
                    Terminé
                </div>
            )
        default:
            return (
                <div className='badge badge-lg'>
                    Indéfini
                </div>
            )
    }
}

const PlanningComponent: React.FC<PlanningComponentProps> = ({ planning }) => {
    return (
        <div className='bg-base-200/90 p-5 rounded-xl space-y-2 shadow'>
            <div className='flex justify-between items-center w-full'>
                <div>{getStatusBadge(planning.status)}</div>
                <Link
                    className='btn btn-accent btn-sm'
                    href={`/planning/${planning.id}`}>
                    Détails
                    <SquareArrowOutUpRight className='w-4' />
                </Link>
            </div>

            <div className='w-full'>
                <div >
                    <div className='stat-title'>
                        <div className='uppercase text-sm'>PLAN-{planning.id}</div>
                    </div>
                    <div className='stat-value text-lg'>
                        {planning.name}
                    </div>
                    <div className='stat-desc'>
                        {new Date(planning.createdAt).toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlanningComponent