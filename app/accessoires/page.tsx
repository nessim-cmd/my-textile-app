"use client";

import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Wrapper from "@/components/Wrapper";
import { DeclarationImport, Accessoire } from "@/type";

interface AccessoryRow {
  id: string;
  client: string;
  model: string;
  reference: string;
  quantity_reçu: number;
  quantity_trouve: number;
  quantity_manque: number;
  quantity_sortie: number;
}

export default function AccessoiresPage() {
  const { getToken } = useAuth();
  const [accessories, setAccessories] = useState<AccessoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAccessoryId, setSelectedAccessoryId] = useState<string | null>(null);
  const [quantitySortieInput, setQuantitySortieInput] = useState("");
  const itemsPerPage = 10;

  const fetchAccessories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch("/api/import", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error(`Error ${response.status}`);
      
      const declarations: DeclarationImport[] = await response.json();
      
      const accessoryRows: AccessoryRow[] = declarations.flatMap(declaration =>
        declaration.models.flatMap(model =>
          model.accessories.map(acc => ({
            id: acc.id,
            client: declaration.client || "N/A",
            model: model.name || "N/A",
            reference: acc.reference_accessoire || "N/A",
            quantity_reçu: acc.quantity_reçu || 0,
            quantity_trouve: acc.quantity_trouve || 0,
            quantity_manque: acc.quantity_manque || 0,
            quantity_sortie: acc.quantity_sortie || 0,
          }))
        )
      );
      
      setAccessories(accessoryRows);
    } catch (error) {
      console.error("Error loading accessories:", error);
      setError("Failed to load accessories");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchAccessories();
  }, [fetchAccessories]);

  const handleSell = async (accessoryId: string) => {
    const quantity = parseInt(quantitySortieInput) || 0;
    const selectedAcc = accessories.find(acc => acc.id === accessoryId);
    if (!selectedAcc) return;

    const remaining = selectedAcc.quantity_trouve - (selectedAcc.quantity_sortie || 0);
    if (quantity <= 0 || quantity > remaining) {
      setError(quantity <= 0 ? "Please enter a valid quantity" : "Cannot sell more than remaining quantity");
      return;
    }

    const newSortie = (selectedAcc.quantity_sortie || 0) + quantity;

    try {
      const token = await getToken();
      const response = await fetch(`/api/accessories/${accessoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity_sortie: newSortie }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update accessory");
      }

      // Update local state after successful API call
      setAccessories(prev =>
        prev.map(acc => {
          if (acc.id === accessoryId) {
            return { ...acc, quantity_sortie: newSortie };
          }
          return acc;
        })
      );

      setSelectedAccessoryId(null);
      setQuantitySortieInput("");
      (document.getElementById("sell_modal") as HTMLDialogElement)?.close();
    } catch (error) {
      console.error("Error updating accessory:", error);
      setError("Failed to update accessory in database");
    }
  };

  const filteredAccessories = accessories.filter(acc =>
    acc.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredAccessories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedAccessories = filteredAccessories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Wrapper>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search by client, model, or reference"
            className="rounde d-xl p-2 bg-gray-100 w-full md:w-[400px]"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <button className="flex p-2 rounded-xl bg-blue-300">
            <span className="font-bold px-2">Search</span>
            <Search className="w-5 h-5 mt-0.5" />
          </button>
        </div>

        <h1 className="text-3xl font-bold">Accessoires</h1>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center">
              <span className="loading loading-dots loading-lg"></span>
            </div>
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : paginatedAccessories.length > 0 ? (
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th className="text-left">Client</th>
                  <th className="text-left">Model</th>
                  <th className="text-left">Reference</th>
                  <th className="text-right">Qty Received</th>
                  <th className="text-right">Qty Found</th>
                  <th className="text-right">Qty Missing</th>
                  <th className="text-right">Qty Remaining</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAccessories.map((acc) => (
                  <tr key={acc.id}>
                    <td>{acc.client}</td>
                    <td>{acc.model}</td>
                    <td>{acc.reference}</td>
                    <td className="text-right">{acc.quantity_reçu}</td>
                    <td className="text-right">{acc.quantity_trouve}</td>
                    <td className="text-right">
                      <span className={acc.quantity_manque < 0 ? "text-red-500" : ""}>
                        {acc.quantity_manque}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className={acc.quantity_trouve - (acc.quantity_sortie || 0) < 0 ? "text-red-500" : ""}>
                        {acc.quantity_trouve - (acc.quantity_sortie || 0)}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-accent"
                        onClick={() => {
                          setSelectedAccessoryId(acc.id);
                          (document.getElementById("sell_modal") as HTMLDialogElement)?.showModal();
                        }}
                      >
                        Sell
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center">No accessories found</div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <button
              className="btn btn-outline btn-sm flex items-center"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </button>
            <span className="text-sm">Page {currentPage} of {totalPages}</span>
            <button
              className="btn btn-outline btn-sm flex items-center"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        )}

        <dialog id="sell_modal" className="modal">
          <div className="modal-box">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 className="font-bold text-lg mb-4">Sell Accessory</h3>
            <div className="form-control space-y-4">
              <input
                type="number"
                placeholder="Quantity to sell"
                className="input input-bordered w-full"
                value={quantitySortieInput}
                onChange={(e) => setQuantitySortieInput(e.target.value)}
                min="1"
              />
            </div>
            <button
              className="btn btn-accent w-full mt-4"
              onClick={() => selectedAccessoryId && handleSell(selectedAccessoryId)}
            >
              Confirm Sale
            </button>
          </div>
        </dialog>
      </div>
    </Wrapper>
  );
}