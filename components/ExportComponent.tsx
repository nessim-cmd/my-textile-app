import { DeclarationExport } from "@/type"
import { CheckCircle, Clock, FileText, SquareArrowOutUpRight, XCircle } from "lucide-react";
import Link from "next/link";

type ExportComponentProps = {
    exporte : DeclarationExport;
    index: number
}

const getStatusBadge = (status: number) => {
    switch (status) {
        case 1:
            return (
                <div className='badge badge-lg flex items-center gap-2'>
                    <FileText className='w-4' />
                    Brouillon
                </div>
            )
        case 2:
            return (
                <div className='badge badge-lg badge-warning flex items-center gap-2'>
                    <Clock className='w-4' />
                    En attente
                </div>
            )
        case 3:
            return (
                <div className='badge badge-lg badge-success flex items-center gap-2'>
                    <CheckCircle className='w-4' />
                    Payée
                </div>
            )

        case 4:
            return (
                <div className='badge badge-lg badge-info flex items-center gap-2'>
                    <XCircle className='w-4' />
                    Annulée
                </div>
            )
        case 5:
            return (
                <div className='badge badge-lg badge-error flex items-center gap-2'>
                    <XCircle className='w-4' />
                    Impayée
                </div>
            )
        default:
            return (
                <div className='badge badge-lg'>
                    <XCircle className='w-4' />
                    Indefinis
                </div>
            )
    }
}



const getModePaiment = (paiment: number) => {
    switch (paiment) {
        case 1:
            return (
                <div className='badge badge-lg flex items-center gap-2'>
                    <FileText className='w-4' />
                    Virement bancaire
                </div>
            )
        case 2:
            return (
                <div className='badge badge-lg badge-warning flex items-center gap-2'>
                    <Clock className='w-4' />
                    Chéque
                </div>
            )
        case 3:
            return (
                <div className='badge badge-lg badge-success flex items-center gap-2'>
                    <CheckCircle className='w-4' />
                    Espéce
                </div>
            )
        default:
            return (
                <div className='badge badge-lg'>
                    <XCircle className='w-4' />
                    Indefinis
                </div>
            )
    }
}



const ExportComponent: React.FC<ExportComponentProps> = ({ exporte, }) => {


    const calculateTotal = () => {
        const totalHT = exporte?.lines?.reduce((acc, line) => {
            const quantity = line.quantity ?? 0;
            const unitPrice = line.unitPrice ?? 0;
            return acc + quantity * unitPrice
        }, 0)

        const totalVAT = totalHT * (exporte.vatRate / 100);
        return totalHT +  totalVAT
    }




    return (
        <div className='bg-base-200/90 p-5 rounded-xl space-y-2 shadow'>
            <div className='flex justify-between items-center w-full'>
                <div>{getStatusBadge(exporte.status)}</div>
                <div>{getModePaiment(exporte.modePaiment)}</div>
                <Link
                    className='btn btn-accent btn-sm'
                    href={`/exporte/${exporte.id}`}>
                    Plus
                    <SquareArrowOutUpRight className='w-4' />

                </Link>
            </div>

            <div className='w-full'>
                <div >
                    <div className='stat-title'>
                        <div className='uppercase text-sm'><span className="font-bold">Export N°</span> { exporte.id}</div>
                    </div>
                    <div>
                        <div className='stat-value'>
                            {calculateTotal().toFixed(2) } €
                        </div>
                    </div>
                    <div className='stat-desc'>
                       {exporte.name}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ExportComponent