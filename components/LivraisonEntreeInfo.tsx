import { LivraisonEntree } from "@/type";
import { useEffect, useState } from "react";
interface Client {
    id: string;
    name: string;
  }



interface Props {
    livraisonEntree : LivraisonEntree
    setLivraisonEntree : (livraisonEntree: LivraisonEntree) => void
}

const LivraisonEntreeInfo: React.FC<Props> = ({livraisonEntree, setLivraisonEntree}) => {
    const [clients, setClients] = useState<Client[]>([]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement >, field: string) => {
        setLivraisonEntree({...livraisonEntree,[field]: e.target.value})
    }
    useEffect(() => {
        
        fetchClients();
      }, []);

    const fetchClients = async () => {
        const res = await fetch('/api/client');
        const data = await res.json();
        setClients(data);
      };

    return(
        <div className="flex flex-col h-fit bg-base-200 p-5 rounded-xl mb-4 md:mb-0">
            <div className="space-y-4">
                {/**change en mode select -------------------------------- */}
                <h2 className="badge badge-accent">Client Name</h2>
                <select
              className="select select-bordered w-full"
              value={livraisonEntree.clientId || ''}
              onChange={(e) => handleInputChange(e, 'clientId')}
              required
            >
              <option value="">Select Client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
                <h2 className='badge badge-accent'>Date de Livraison</h2>
                <input
                    type="date"
                    value={livraisonEntree.livraisonDate || ""}
                    className='input input-bordered w-full resize-none'
                    required
                    onChange={(e) => handleInputChange(e, 'livraisonDate')}
                />
            </div>
        </div>
    )



} 

export default LivraisonEntreeInfo