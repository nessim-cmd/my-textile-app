import { DeclarationExport } from "@/type";

interface Props {
    exporte :DeclarationExport
    setExports: (exporte : DeclarationExport) => void
}

const ExportInfo: React.FC<Props> = ({ exporte, setExports}) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) =>{
        setExports({ ...exporte, [field]: e.target.value});
    };
    console.log(exporte)
    return(
        <div className="flex flex-col h-fit bg-base-200 p-5 rounded-xl mb-4 md:mb-0">
            <div className="space-y-4">
                <h2 className="badge badge-accent">Client</h2>
                <input
                    type="text"
                    value={exporte?.clientName}
                    placeholder="Nom de l'entreprise émettrice"
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e , 'clientName')}
                />
                <h2 className='badge badge-accent'>Date de la Export</h2>
                <input
                    type="date"
                    value={exporte?.exportDate}
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e , 'exportDate')}
                />

<h2 className='badge badge-accent'>{"Date d'échéance"}</h2>
                <input
                    type="date"
                    value={exporte?.dueDate}
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e , 'dueDate')}
                />

                <h2 className='badge badge-accent'>Poids Brut</h2>
                <input
                    type="text"
                    value={exporte?.poidsBrut}
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e , 'poidsBrut')}
                />

                <h2 className='badge badge-accent'>Poids Net </h2>
                <input
                    type="text"
                    value={exporte?.poidsNet}
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e , 'poidsNet')}
                />

<h2 className='badge badge-accent'>Nbr Colis</h2>
                <input
                    type="text"
                    value={exporte?.nbrColis}
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e , 'nbrColis')}
                />

<h2 className='badge badge-accent'>Volume</h2>
                <input
                    type="text"
                    value={exporte?.volume}
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e , 'volume')}
                />
                <h2 className='badge badge-accent'>Origine Tissu</h2>
                <input
                    type="text"
                    value={exporte?.origineTessuto}
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e , 'origineTessuto')}
                />
            </div>
        </div>
    )
}

export default ExportInfo