import { SuiviProduction } from '@/type'
import { Factory, SquareArrowOutUpRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { Progress } from '@/components/ui/progress'

type SuiviComponentProps = {
    suivi: SuiviProduction;
}

const SuiviComponent: React.FC<SuiviComponentProps> = ({ suivi }) => {
    const adjustedTotalLivree = suivi.lines.reduce((sum, line) => 
      sum + Math.max(0, line.qte_livree - line.qte_reparation), 0)
    const progress = suivi.qte_total > 0 
      ? (adjustedTotalLivree / suivi.qte_total) * 100 
      : 0

  return (
    <div className='bg-base-200/90 p-5 rounded-xl space-y-2 shadow'>
      <div className='flex justify-between items-center w-full'>
        <div className='badge badge-lg flex items-center gap-2'>
          <Factory className='w-4' />
          {suivi.model_name}
        </div>
        <Link
          className='btn btn-accent btn-sm'
          href={`/suivi/${suivi.id}`}>
          Détails
          <SquareArrowOutUpRight className='w-4' />
        </Link>
      </div>

      <div className='w-full'>
        <div className='stat-title'>
          <div className='uppercase text-sm'>{suivi.client}</div>
        </div>
        <div className='stat-desc'>
          Quantité totale: {suivi.qte_total}
        </div>
        <div className='mt-2'>
            <Progress value={progress} className='h-2' />
            <div className='flex justify-between text-xs mt-1'>
                <span>Livré: {adjustedTotalLivree}</span>
                <span>Reste: {suivi.qte_total - adjustedTotalLivree}</span>
            </div>
         </div>
      </div>
    </div>
  )
}

export default SuiviComponent