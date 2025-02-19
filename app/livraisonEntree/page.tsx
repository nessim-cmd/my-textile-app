
"use client"
import LivraisonEntreeComponent from "@/components/LivraisonEntreeComponent";
import Wrapper from "@/components/Wrapper";
import { LivraisonEntree } from "@/type";
import { useUser } from "@clerk/nextjs";
import confetti from "canvas-confetti";
import { Layers, Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home(){
    const {user} = useUser();
    const[livraisonEntreeName, setLivraisonEntreeName] = useState("");
    const [isNameValid, setIsNameValid] = useState(true);
    const email = user?.primaryEmailAddress?.emailAddress;
    const [livraisonsEntree, setLivraisonsEntree] = useState<LivraisonEntree[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null >(null);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchLivraisonsEntree = async ()=> {
        if(!email) return;
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/livraisonEntree?email=${encodeURIComponent(email)}`);
            if(!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

            const data = await response.json();
            setLivraisonsEntree(Array.isArray(data) ? data : [] );

        } catch (error) {
            console.log(error)
        }finally{
            setLoading(false);
        }
    };

    useEffect(()=> {
        if(email) fetchLivraisonsEntree();
    }, [email]);

    const filteredLivraisonsEntree = livraisonsEntree.filter(livraisonEntree =>
        livraisonEntree.name?.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()) ||
        livraisonEntree.id.toString().toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
    );

    const handleCreateLivraisonEntree = async () => {
        if(!email || !livraisonEntreeName.trim()) return;

        try {
            const response = await fetch("/api/livraisonEntree", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    email,
                    name: livraisonEntreeName.trim()
                })
            });

            if(!response.ok){
                const errorData = await response.json();
                throw new Error(errorData.error || " Failed to Create livraisonEntree");
                
            }

            await fetchLivraisonsEntree();
            setLivraisonEntreeName("");

            (document.getElementById("livraisonEntree_modal") as HTMLDialogElement)?.close();

            confetti({
                particleCount: 100,
                spread: 70,
                origin: {y:0.6},
                zIndex: 9999,
            });
        } catch (error) {
            console.log(error)
        }
    };


    return (
        <Wrapper>
            <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2">
                    <input 
                     type="text" 
                     placeholder="Search by Name LivraisonEntree"
                     className="rounded-xl p-2 bg-gray-100 w-[600px]"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     />
                    <button className="flex p-2 rounded-xl bg-blue-300">
                        <span className="font-bold px-2">Search</span>
                        <Search className="w-5 h-5 mt-0.5"/>
                    </button>
                </div>

                <h1 className="text-3xl font-bold">Mes Livraisons Entree</h1>

                <div className="grid md:grid-cols-3 gap-4">
                    <div 
                     className="cursor-pointer border border-accent rounded-xl flex flex-col justify-center items-center p-5"
                     onClick={()=> (document.getElementById("livraisonEntree_modal") as HTMLDialogElement)?.showModal()}
                    >
                        <div className="font-bold text-accent">Enrégister un Livraison Entree</div>
                        <div className="bg-accent-content text-accent rounded-full p-2 mt-2">
                            <Layers className="h-6 w-6 "/>
                        </div>
                    </div>

                    {loading ? (
                        <div className="col-span-3 text-center">
                            <span className="loading loading-dots loading-lg"></span>
                        </div>
                    ): error ?(
                        <div className="col-span-3 alert alert-error">
                            {error}
                        </div>
                    ) : filteredLivraisonsEntree.length > 0 ? (
                        filteredLivraisonsEntree.map((livraisonsEntree) => (
                            <LivraisonEntreeComponent key={livraisonsEntree.id} livraisonEntree={livraisonsEntree} index={0} />
                        ))
                    ):(
                        <div className="col-span-3 text-center">
                            Aucune Livraison Entree Trouvée 
                        </div>
                    )}
                </div>

                <dialog id="livraisonEntree_modal" className="modal">
                    <div className="modal-box">
                        <form method="dialog">
                            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                            ✕
                            </button>
                        </form>

                        <h3 className="font-bold text-lg mb-4">Nouvelle Livraison Entree</h3>

                        <div className="form-control">
                            <input 
                             type="text" 
                             placeholder="Nom de La Livraison (max 60 caractères)"
                             className="input input-bordered w-full"
                             value={livraisonEntreeName}
                             onChange={(e) => {
                                setLivraisonEntreeName(e.target.value);
                                setIsNameValid(e.target.value.length <= 60);

                             }}
                             maxLength={60}
                            />
                            <label className="label">
                                <span className="label-text-alt">
                                    {livraisonEntreeName.length}/60 caractères
                                </span>
                            </label>
                        </div>

                        <button 
                        className="btn btn-accent w-full mt-4"
                        disabled={!isNameValid || !livraisonEntreeName.trim()}
                        onClick={handleCreateLivraisonEntree}
                        >
                            Save
                        </button>
                    </div>
                </dialog>
            </div>
        </Wrapper>
    );
}