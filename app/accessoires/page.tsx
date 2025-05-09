"use client";

import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Wrapper from "@/components/Wrapper";
import { DeclarationImport } from "@/type";
import * as XLSX from "xlsx";

interface AccessoryRow {
  id: string;
  num_dec : string;
  client: string;
  model: string;
  reference: string;
  description: string;
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
  const [newAccessory, setNewAccessory] = useState({
    num_dec: "",
    client: "",
    model: "",
    reference: "",
    description: "",
    quantity_reçu: "",
    quantity_trouve: "",
  });
  const itemsPerPage = 10;

  const fetchAccessories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch("/api/all-accessories", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (!response.ok) throw new Error(`Error ${response.status}`);

      const data = await response.json();
      const { declarationAccessories, standaloneAccessories } = data;

      // Process accessories from declarations
      const declarationAccessoryRows: AccessoryRow[] = declarationAccessories.flatMap(
        (declaration: DeclarationImport) =>
          declaration.models.flatMap(model =>
            model.accessories.map(acc => ({
              id: acc.id,
              num_dec: declaration.num_dec || "N/A",
              client: declaration.client || "N/A",
              model: model.name || "N/A",
              reference: acc.reference_accessoire || "N/A",
              description: acc.description || "N/A",
              quantity_reçu: acc.quantity_reçu || 0,
              quantity_trouve: acc.quantity_trouve || 0,
              quantity_manque: acc.quantity_manque || 0,
              quantity_sortie: acc.quantity_sortie || 0,
            }))
          )
      );

      // Process standalone accessories
      const standaloneAccessoryRows: AccessoryRow[] = standaloneAccessories.map((acc: { id: any; client: any; model: { name: any; }; reference_accessoire: any; description: any; quantity_reçu: any; quantity_trouve: any; quantity_manque: any; quantity_sortie: any; }) => ({
        id: acc.id,
       
        client: acc.client || "N/A",
        model: acc.model?.name || "N/A",
        reference: acc.reference_accessoire || "N/A",
        description: acc.description || "N/A",
        quantity_reçu: acc.quantity_reçu || 0,
        quantity_trouve: acc.quantity_trouve || 0,
        quantity_manque: acc.quantity_manque || 0,
        quantity_sortie: acc.quantity_sortie || 0,
      }));

      const allAccessories = [...declarationAccessoryRows, ...standaloneAccessoryRows];
      console.log("Fetched accessories:", allAccessories.length);
      setAccessories(allAccessories);
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

  useEffect(() => {
    const handleDeclarationUpdate = () => {
      console.log("Declaration updated, refreshing accessories");
      fetchAccessories();
    };

    window.addEventListener('declarationUpdated', handleDeclarationUpdate);
    return () => {
      window.removeEventListener('declarationUpdated', handleDeclarationUpdate);
    };
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

  const handleAddAccessory = async () => {
    const { client, model, reference, description, quantity_reçu, quantity_trouve } = newAccessory;
    if (!client || !model || !reference || !description || !quantity_reçu || !quantity_trouve) {
      setError("All fields are required");
      return;
    }

    const quantityReçuNum = parseFloat(quantity_reçu);
    const quantityTrouveNum = parseFloat(quantity_trouve);
    if (isNaN(quantityReçuNum) || isNaN(quantityTrouveNum) || quantityReçuNum < 0 || quantityTrouveNum < 0) {
      setError("Quantities must be valid non-negative numbers");
      return;
    }

    try {
      const token = await getToken();
      const response = await fetch("/api/accessories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          
          client,
          model,
          reference_accessoire: reference,
          description,
          quantity_reçu: quantityReçuNum,
          quantity_trouve: quantityTrouveNum,
          quantity_manque: quantityTrouveNum - quantityReçuNum,
          quantity_sortie: 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add accessory");
      }

      setNewAccessory({
        num_dec: "",
        client: "",
        model: "",
        reference: "",
        description: "",
        quantity_reçu: "",
        quantity_trouve: "",
      });
      (document.getElementById("add_accessory_modal") as HTMLDialogElement)?.close();
      await fetchAccessories();
    } catch (error) {
      console.error("Error adding accessory:", error);
      setError("Failed to add accessory");
    }
  };

  const handleDownloadExcel = () => {
    const data = accessories.map(acc => ({
      num_dec : acc.num_dec,
      Client: acc.client,
      Model: acc.model,
      Reference: acc.reference,
      Description: acc.description,
      "Qty Reçu": acc.quantity_reçu,
      "Qty Trouvee": acc.quantity_trouve,
      "Qty Manque": acc.quantity_manque,
      "Qty Reste": acc.quantity_trouve - (acc.quantity_sortie || 0),
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    ws['!cols'] = [
      { wch: 13 },
      { wch: 17 },
      { wch: 19 },
      { wch: 32 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
    ];

    const headerCells = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1'];
    headerCells.forEach(cell => {
      if (ws[cell]) {
        ws[cell].s = {
          font: { bold: true },
        };
      }
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Accessories");
    XLSX.writeFile(wb, "accessories.xlsx");
  };

  const filteredAccessories = accessories.filter(acc =>
    acc.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
            placeholder="Search by client, model, Description or reference"
            className="rounded-xl p-2 bg-gray-100 w-full md:w-[400px]"
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
          <button
            className="btn btn-primary"
            onClick={() => (document.getElementById("add_accessory_modal") as HTMLDialogElement)?.showModal()}
          >
            Add Accessory
          </button>
          <button
            className="btn btn-success"
            onClick={handleDownloadExcel}
          >
            Download Excel
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
                  <th className="text-left">Num_Dec</th>
                  <th className="text-left">Client</th>
                  <th className="text-left">Model</th>
                  <th className="text-left">Reference</th>
                  <th className="text-left">Description</th>
                  <th className="text-right">Qty Reçu</th>
                  <th className="text-right">Qty Trouvee</th>
                  <th className="text-right">Qty Manque</th>
                  <th className="text-right">Qty Reste</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAccessories.map((acc) => (
                  <tr 
                    key={acc.id} 
                    className={(acc.quantity_trouve - (acc.quantity_sortie || 0) === 0) ? "!bg-red-300 !text-white" : ""}
                  >
                    <td>{acc.num_dec}</td>
                    <td>{acc.client}</td>
                    <td>{acc.model}</td>
                    <td>{acc.reference}</td>
                    <td>{acc.description}</td>
                    <td className="text-right">{acc.quantity_reçu}</td>
                    <td className="text-right">{acc.quantity_trouve}</td>
                    <td className="text-right">
                      <span className={acc.quantity_manque < 0 ? "text-red-500" : ""}>
                        {acc.quantity_manque}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className={acc.quantity_trouve - (acc.quantity_sortie || 0) < 0 ? "text-red-500" : ""}>
                        <span className="border-2 p-2 border-green-600 rounded-lg">{acc.quantity_trouve - (acc.quantity_sortie || 0)}</span>
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
                        Out
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
            <h3 className="font-bold text-lg mb-4">Out Accessory</h3>
            <div className="form-control space-y-4">
              <input
                type="number"
                placeholder="Quantity to out"
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

        <dialog id="add_accessory_modal" className="modal">
          <div className="modal-box">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 className="font-bold text-lg mb-4">Add New Accessory</h3>
            <div className="form-control space-y-4">
              <input
                type="text"
                placeholder="Client"
                className="input input-bordered w-full"
                value={newAccessory.client}
                onChange={(e) => setNewAccessory({ ...newAccessory, client: e.target.value })}
              />
              <input
                type=" superintendent
text"
                placeholder="Model"
                className="input input-bordered w-full"
                value={newAccessory.model}
                onChange={(e) => setNewAccessory({ ...newAccessory, model: e.target.value })}
              />
              <input
                type="text"
                placeholder="Reference"
                className="input input-bordered w-full"
                value={newAccessory.reference}
                onChange={(e) => setNewAccessory({ ...newAccessory, reference: e.target.value })}
              />
              <input
                type="text"
                placeholder="Description"
                className="input input-bordered w-full"
                value={newAccessory.description}
                onChange={(e) => setNewAccessory({ ...newAccessory, description: e.target.value })}
              />
              <input
                type="number"
                placeholder="Quantity Reçu"
                className="input input-bordered w-full"
                value={newAccessory.quantity_reçu}
                onChange={(e) => setNewAccessory({ ...newAccessory, quantity_reçu: e.target.value })}
                min="0"
              />
              <input
                type="number"
                placeholder="Quantity Trouve"
                className="input input-bordered w-full"
                value={newAccessory.quantity_trouve}
                onChange={(e) => setNewAccessory({ ...newAccessory, quantity_trouve: e.target.value })}
                min="0"
              />
            </div>
            <button
              className="btn btn-primary w-full mt-4"
              onClick={handleAddAccessory}
            >
              Add Accessory
            </button>
          </div>
        </dialog>
      </div>
    </Wrapper>
  );
}