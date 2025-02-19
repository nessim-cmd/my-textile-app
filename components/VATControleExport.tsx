import { DeclarationExport } from "@/type"



interface Props {
    exporte: DeclarationExport
    setExports: (exporte: DeclarationExport) => void
}

const VATControlExport: React.FC<Props> = ({ exporte, setExports }) => {

    const handleVatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setExports({
            ...exporte,
            vatActive: e.target.checked,
            vatRate: e.target.checked ? exporte.vatRate : 0
        })
    }


    const handleVatRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setExports({
            ...exporte,
            vatRate: parseFloat(e.target.value)
        })
    }


    return (
        <div className='flex items-center'>
            <label className='block text-sm font-bold'>TVA (%)</label>
            <input
                type="checkbox"
                className='toggle toggle-sm ml-2'
                onChange={handleVatChange}
                checked={exporte.vatActive}
            />
            {exporte.vatActive && (
                <input
                    type="number"
                    value={exporte.vatRate}
                    className='input input-sm input-bordered w-16 ml-2'
                    onChange={handleVatRateChange}
                    min={0}
                />
            )}
        </div>
    )
}

export default VATControlExport