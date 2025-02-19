"use client"

import { Layers, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import confetti from "canvas-confetti"
import { DeclarationExport } from "@/type"
import Wrapper from "@/components/Wrapper"
import ExportComponent from "@/components/ExportComponent"

export default function ExportPage() {
  const { user } = useUser()
  const [exportName, setExportName] = useState("")
  const [isNameValid, setIsNameValid] = useState(true)
  const email = user?.primaryEmailAddress?.emailAddress
  const [exports, setExports] = useState<DeclarationExport[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchExports = async () => {
    if (!email) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/exporte?email=${encodeURIComponent(email)}`)
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`)
      
      const data = await response.json()
      setExports(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error loading exports:", error)
      setError("Failed to load exports")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (email) fetchExports()
  }, [email])

  const filteredExports = exports.filter(exp =>
    exp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateExport = async () => {
    if (!email || !exportName.trim()) return

    try {
      const response = await fetch("/api/exporte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: exportName.trim() })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create export")
      }

      await fetchExports()
      setExportName("")
      ;(document.getElementById("export_modal") as HTMLDialogElement)?.close()

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 9999,
      })
    } catch (error) {
      console.error("Error creating export:", error)
      setError("Failed to create export")
    }
  }

  return (
    <Wrapper>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search by export name or ID"
            className="rounded-xl p-2 bg-gray-100 w-[600px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="flex p-2 rounded-xl bg-blue-300">
            <span className="font-bold px-2">Search</span>
            <Search className="w-5 h-5 mt-0.5" />
          </button>
        </div>

        <h1 className="text-3xl font-bold">Mes Exports</h1>

        <div className="grid md:grid-cols-3 gap-4">
          <div
            className="cursor-pointer border border-accent rounded-xl flex flex-col justify-center items-center p-5"
            onClick={() => (document.getElementById("export_modal") as HTMLDialogElement)?.showModal()}
          >
            <div className="font-bold text-accent">Créer un Export</div>
            <div className="bg-accent-content text-accent rounded-full p-2 mt-2">
              <Layers className="h-6 w-6" />
            </div>
          </div>

          {loading ? (
            <div className="col-span-3 text-center">
              <span className="loading loading-dots loading-lg"></span>
            </div>
          ) : error ? (
            <div className="col-span-3 alert alert-error">
              {error}
            </div>
          ) : filteredExports.length > 0 ? (
            filteredExports.map((exp) => (
              <ExportComponent key={exp.id} exporte={exp} index={0} />
            ))
          ) : (
            <div className="col-span-3 text-center">
              Aucun export trouvé
            </div>
          )}
        </div>

        <dialog id="export_modal" className="modal">
          <div className="modal-box">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <h3 className="font-bold text-lg mb-4">Nouvel Export</h3>
            <div className="form-control">
              <input
                type="text"
                placeholder="Nom de l'export (max 60 caractères)"
                className="input input-bordered w-full"
                value={exportName}
                onChange={(e) => {
                  setExportName(e.target.value)
                  setIsNameValid(e.target.value.length <= 60)
                }}
                maxLength={60}
              />
              <label className="label">
                <span className="label-text-alt">
                  {exportName.length}/60 caractères
                </span>
              </label>
            </div>
            <button
              className="btn btn-accent w-full mt-4"
              disabled={!isNameValid || !exportName.trim()}
              onClick={handleCreateExport}
            >
              Créer
            </button>
          </div>
        </dialog>
      </div>
    </Wrapper>
  )
}