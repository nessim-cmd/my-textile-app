import { DeclarationImport } from '@/type'
import { AlertTriangle, Shirt, SquareArrowOutUpRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type ImportComponentProps = {
    declaration: DeclarationImport;
}

const ImportComponent: React.FC<ImportComponentProps> = ({ declaration }) => {
  const hasMissingItems = declaration.models.some(model => 
    model.accessories.some(acc => (acc.quantity_trouve - acc.quantity_reçu) < 0)
  )

  return (
          <div className='bg-base-200/90 p-5 rounded-xl space-y-2 shadow'>
            <div className='flex justify-between items-center w-full'>
              <div className='badge badge-lg flex items-center gap-2'>
                <Shirt className='w-4' />
                {declaration.models.length} Modèles
                {hasMissingItems && (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
              </div>
              <Link
                className='btn btn-accent btn-sm'
                href={`/import/${declaration.id}`}>
                Détails
                <SquareArrowOutUpRight className='w-4' />
              </Link>
            </div>
            <div className='w-full'>
                <div >
                    <div className='stat-title'>
                        <div className='uppercase text-sm'>{declaration.num_dec}</div>
                    </div>
                    <div className='stat-desc'>
                       {declaration.client} - {declaration.valeur}€
                    </div>
                    <div className='text-xs text-gray-500'>
                        {new Date(declaration.date_import).toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ImportComponent