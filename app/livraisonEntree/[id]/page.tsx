"use client"

import LivraisonEntreeInfo from "@/components/LivraisonEntreeInfo";
import LivraisonEntreeLines from "@/components/LivraisonEntreeLines";
import Wrapper from "@/components/Wrapper";
import {  LivraisonEntree } from "@/type";
import { Save, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function LivraisonEntreePage(){
    const router = useRouter()
    const params = useParams<{ id: string}>()
    const [livraisonEntree, setLivraisonEntree] = useState<LivraisonEntree | null>(null)
    const [initialLivraisonEntree, setInitialLivraisonEntree] = useState<LivraisonEntree | null>(null)
    const [isSaveDisabled, setIsSaveDisabled] = useState(true)
    const [isLoading, setIsLoading] = useState(false)

    const fetchLivraisonEntree = async () =>{
        try {
            const response = await fetch(`/api/livraisonEntree/${params.id}`)
            if (!response.ok) throw new Error("Failed to fetch LivraisonEntree")
            const data = await response.json()
            setLivraisonEntree(data)
            setInitialLivraisonEntree(data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(()=> {
        if (params.id) fetchLivraisonEntree()
    },[params.id])

    useEffect(()=> {
        setIsSaveDisabled(JSON.stringify(livraisonEntree) === JSON.stringify(initialLivraisonEntree))
    },[livraisonEntree, initialLivraisonEntree])

    const handleSave = async ()=> {
        if(!livraisonEntree) return
        setIsLoading(true);
        try {
            const response = await fetch(`/api/livraisonEntree/${livraisonEntree.id}`,{
                method:'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(livraisonEntree)
            })
        if (!response.ok) throw new Error('Failed to update livraison')

        const updatedResponse = await fetch(`/api/livraisonEntree/${livraisonEntree.id}`)
        const updatedLivraisonEntree = await updatedResponse.json()
        setLivraisonEntree(updatedLivraisonEntree);
        setInitialLivraisonEntree(updatedLivraisonEntree)
        } catch (error) {
            console.log(error)
        }finally{
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette livraison Entree ?")
        if (confirmed && livraisonEntree?.id) {
          try {
            await fetch(`/api/livraisonEntree/${livraisonEntree.id}`, { method: 'DELETE' })
            router.push('/livraisonEntree')
          } catch (error) {
            console.error('Error deleting livraison:', error)
          }
        }
      }
    
      if (!livraisonEntree) return (
        <div className='flex justify-center items-center h-screen w-full'>
          <span className='font-bold'>Chargement de la livraison...</span>
        </div>
      )

      return (
        <Wrapper>
      <div>
        <div className='flex flex-col md:flex-row md:justify-between md:items-center mb-4'>
          <p className='badge badge-ghost badge-lg uppercase'>
            <span>LivraisonEntree-</span>{livraisonEntree.id}
          </p>
          
          <div className='flex md:mt-0 mt-4 '>
            <button
              className='btn btn-sm btn-accent ml-4'
              disabled={isSaveDisabled || isLoading}
              onClick={handleSave}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  Sauvegarder
                  <Save className="w-4 ml-2" />
                </>
              )}
            </button>

            <button
              onClick={handleDelete}
              className='btn btn-sm btn-accent ml-4'
            >
              <Trash className='w-4' />
            </button>
          </div>
        </div>

        <div className='flex flex-col md:flex-row w-full'>
          <div className='flex w-full md:w-1/3 flex-col'>
            <LivraisonEntreeInfo livraisonEntree={livraisonEntree} setLivraisonEntree={setLivraisonEntree} />
          </div>

          <div className='flex w-full md:w-2/3 flex-col md:ml-4'>
            <LivraisonEntreeLines livraisonEntree={livraisonEntree} setLivraisonEntree={setLivraisonEntree} />
            
          </div>
        </div>
      </div>
    </Wrapper>
      )

}