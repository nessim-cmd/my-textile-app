"use client";

import { Layers, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import confetti from "canvas-confetti";
import { Planning } from "@/type";
import Wrapper from "@/components/Wrapper";
import PlanningComponent from "@/components/PlanningComponent";

export default function PlanningPage() {
    const { user } = useUser();
    const [planningName, setPlanningName] = useState("");
    const [isNameValid, setIsNameValid] = useState(true);
    const email = user?.primaryEmailAddress?.emailAddress;
    const [plannings, setPlannings] = useState<Planning[]>([]);
    const [loading, setLoading] = useState(false);
    const [, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchPlannings = async () => {
        if (!email) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/planning?email=${encodeURIComponent(email)}`);
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            
            const data = await response.json();
            setPlannings(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading plannings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (email) fetchPlannings();
    }, [email]);

    const filteredPlannings = plannings.filter(planning =>
        planning.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        planning.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreatePlanning = async () => {
        if (!email || !planningName.trim()) return;

        try {
            const response = await fetch("/api/planning", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email, 
                    name: planningName.trim() 
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create planning");
            }

            await fetchPlannings();
            setPlanningName("");

            (document.getElementById("planning_modal") as HTMLDialogElement)?.close();

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                zIndex: 9999,
            });
        } catch (error) {
            console.error("Error creating planning:", error);
        }
    };

    return (
        <Wrapper>
            <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        placeholder="Rechercher un planning"
                        className="rounded-xl p-2 bg-gray-100 w-[600px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="flex p-2 rounded-xl bg-blue-300">
                        <span className="font-bold px-2">Rechercher</span>
                        <Search className="w-5 h-5 mt-0.5" />
                    </button>
                </div>

                <h1 className="text-3xl font-bold">Plannings de Production</h1>

                <div className="grid md:grid-cols-3 gap-4">
                    <div
                        className="cursor-pointer border border-accent rounded-xl flex flex-col justify-center items-center p-5"
                        onClick={() => (document.getElementById("planning_modal") as HTMLDialogElement)?.showModal()}
                    >
                        <div className="font-bold text-accent">Créer un planning</div>
                        <div className="bg-accent-content text-accent rounded-full p-2 mt-2">
                            <Layers className="h-6 w-6" />
                        </div>
                    </div>

                    {loading ? (
                        <div className="col-span-3 text-center">
                            <span className="loading loading-dots loading-lg"></span>
                        </div>
                    ) : filteredPlannings.length > 0 ? (
                        filteredPlannings.map((planning) => (
                            <PlanningComponent key={planning.id} planning={planning} />
                        ))
                    ) : (
                        <div className="col-span-3 text-center">
                            Aucun planning trouvé
                        </div>
                    )}
                </div>

                <dialog id="planning_modal" className="modal">
                    <div className="modal-box">
                        <form method="dialog">
                            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                                ✕
                            </button>
                        </form>

                        <h3 className="font-bold text-lg mb-4">Nouveau Planning</h3>

                        <div className="form-control">
                            <input
                                type="text"
                                placeholder="Nom du planning (max 60 caractères)"
                                className="input input-bordered w-full"
                                value={planningName}
                                onChange={(e) => {
                                    setPlanningName(e.target.value);
                                    setIsNameValid(e.target.value.length <= 60);
                                }}
                                maxLength={60}
                            />
                            <label className="label">
                                <span className="label-text-alt">
                                    {planningName.length}/60 caractères
                                </span>
                            </label>
                        </div>

                        <button
                            className="btn btn-accent w-full mt-4"
                            disabled={!isNameValid || !planningName.trim()}
                            onClick={handleCreatePlanning}
                        >
                            Créer
                        </button>
                    </div>
                </dialog>
            </div>
        </Wrapper>
    );
}