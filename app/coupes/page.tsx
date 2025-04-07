"use client";

import Wrapper from "@/components/Wrapper";
import { useUser, useAuth } from "@clerk/nextjs";
import { Trash, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import * as XLSX from "xlsx";

type Client = { id: string; name: string };
type Size = { id?: string; label: string; quantity: number };
type Piece = { id?: string; sizeLabel: string; quantity: number };
type Roll = {
  id?: string;
  nRlx?: string | null;
  metrRoul?: number | null;
  nMatelas?: string | null;
  nbPils?: number | null;
  longMatelas?: number | null;
  mtsMatelas?: number | null;
  restes?: number | null;
  defauts?: number | null;
  manqueRoul?: number | null;
  pieces: Piece[];
};
type Coupe = {
  id: string;
  clientId: string;
  client: Client;
  modele: string;
  refArticle: string;
  refTissu?: string | null;
  colorisTissu?: string | null;
  sizes: Size[];
  rolls: Roll[];
};

export default function CoupesPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const email = user?.primaryEmailAddress?.emailAddress;
  const [coupes, setCoupes] = useState<Coupe[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Coupe>>({
    clientId: "",
    modele: "",
    refArticle: "",
    refTissu: "",
    colorisTissu: "",
    sizes: [],
    rolls: [],
  });
  const [sizes, setSizes] = useState<Size[]>([]);
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [expandedRolls, setExpandedRolls] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchCoupes = useCallback(async () => {
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch("/api/coupes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to fetch: ${res.status}`);
      }
      const data = await res.json();
      setCoupes(data);
    } catch (err) {
      setError("Failed to fetch coupes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [email, getToken]);

  const fetchClients = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch("/api/client", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch clients: ${res.status}`);
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  }, [getToken]);

  useEffect(() => {
    if (email) {
      fetchCoupes();
      fetchClients();
    }
  }, [email, fetchCoupes, fetchClients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = formData.id ? "PUT" : "POST";
    const url = formData.id ? `/api/coupes/${formData.id}` : "/api/coupes";
    setModalError(null);

    try {
      const token = await getToken();
      const payload = {
        ...(formData.id && { id: formData.id }),
        clientId: formData.clientId,
        modele: formData.modele,
        refArticle: formData.refArticle,
        refTissu: formData.refTissu || null,
        colorisTissu: formData.colorisTissu || null,
        sizes: Object.fromEntries(sizes.map((s) => [s.label, s.quantity])),
        rolls: rolls.map((r) => ({
          nRlx: r.nRlx || null,
          metrRoul: r.metrRoul || 0,
          nMatelas: r.nMatelas || null,
          nbPils: r.nbPils || 0,
          longMatelas: r.longMatelas || 0,
          mtsMatelas: r.mtsMatelas || 0,
          restes: r.restes || 0,
          defauts: r.defauts || 0,
          manqueRoul: r.manqueRoul || 0,
          pieces: Object.fromEntries(r.pieces.map((p) => [p.sizeLabel, p.quantity])),
        })),
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save");
      }

      setTimeout(() => {
        setIsModalOpen(false);
        setFormData({
          clientId: "",
          modele: "",
          refArticle: "",
          refTissu: "",
          colorisTissu: "",
          sizes: [],
          rolls: [],
        });
        setSizes([]);
        setRolls([]);
        setExpandedRolls([]);
        fetchCoupes();
      }, 500);
    } catch (error) {
      console.error("Submission error:", error);
      setModalError(`Failed to save coupe: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this coupe?")) {
      try {
        const token = await getToken();
        const res = await fetch(`/api/coupes/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to delete");
        fetchCoupes();
      } catch (error) {
        console.error("Error deleting:", error);
        setError("Failed to delete coupe");
      }
    }
  };

  const handleEdit = (coupe: Coupe) => {
    setFormData({
      id: coupe.id,
      clientId: coupe.clientId,
      modele: coupe.modele,
      refArticle: coupe.refArticle,
      refTissu: coupe.refTissu || "",
      colorisTissu: coupe.colorisTissu || "",
      sizes: coupe.sizes,
      rolls: coupe.rolls,
    });
    setSizes(coupe.sizes);
    setRolls(coupe.rolls);
    setIsModalOpen(true);
  };

  const exportToExcel = (coupe: Coupe) => {
    const wb = XLSX.utils.book_new();
    const sizes = coupe.sizes.map((s) => s.label);

    const headerData = [
      [`Details de coupe Mod: ${coupe.modele}/${coupe.refArticle}`],
      ["Client", "", "Modele", "Ref Article", "Ref Tissu", "Coloris Tissu"],
      [coupe.client.name || "N/A", "", coupe.modele, coupe.refArticle, coupe.refTissu || "", coupe.colorisTissu || ""],
      [],
    ];

    const sizesHeader = ["", "", "", "", "", "", "Ref", "Lotto", ...sizes, "Total"];
    const sizesData = [
      [
        "",
        "",
        "",
        "",
        "",
        "",
        "Modello",
        coupe.refArticle,
        ...coupe.sizes.map((s) => s.quantity),
        coupe.sizes.reduce((sum, s) => sum + s.quantity, 0),
      ],
      [
        "",
        "",
        "",
        "",
        "",
        "",
        "Total",
        "",
        ...coupe.sizes.map((s) => s.quantity),
        coupe.sizes.reduce((sum, s) => sum + s.quantity, 0),
      ],
    ];

    const rollsHeaderRow1 = [
      "N RLX",
      "Metrage Rouleaux",
      "N° Matelas",
      "Nb Pils",
      "Long Matelas",
      "MTS Matelas",
      "Restes",
      "Défauts",
      "Manque Rouleux",
      "",
      "Pieces Coupes",
      ...sizes.map(() => ""),
      "Total",
    ];
    const rollsHeaderRow2 = [
      ...Array(9).fill(""),
      "",
      "",
      ...sizes,
      "",
    ];

    const rollsData = coupe.rolls.map((roll) => [
      roll.nRlx || "",
      roll.metrRoul || 0,
      roll.nMatelas || "",
      roll.nbPils || 0,
      roll.longMatelas || 0,
      roll.mtsMatelas || 0,
      roll.restes || 0,
      roll.defauts || 0,
      roll.manqueRoul || 0,
      "",
      "",
      ...sizes.map((size) => roll.pieces.find((p) => p.sizeLabel === size)?.quantity || 0),
      roll.pieces.reduce((sum, p) => sum + p.quantity, 0),
    ]);

    const sheetData = [
      ...headerData,
      sizesHeader,
      ...sizesData,
      [],
      rollsHeaderRow1,
      rollsHeaderRow2,
      ...rollsData,
    ];

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    const piecesCoupesStartCol = 10;
    const piecesCoupesEndCol = piecesCoupesStartCol + sizes.length - 1;
    const piecesCoupesRow = headerData.length + sizesHeader.length + sizesData.length + 1;
    ws["!merges"] = [
      {
        s: { r: piecesCoupesRow, c: piecesCoupesStartCol },
        e: { r: piecesCoupesRow, c: piecesCoupesEndCol },
      },
    ];

    const range = XLSX.utils.decode_range(ws["!ref"] || "A1:A1");
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) ws[cellAddress] = { t: "s", v: "" };
        ws[cellAddress].s = {
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
          },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
    }

    ws["!cols"] = [
      { wch: 10 },
      { wch: 15 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 15 },
      { wch: 5 },
      ...sizes.map(() => ({ wch: 8 })),
      { wch: 10 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Coupe");
    XLSX.writeFile(wb, `coupe_${coupe.refArticle}_${coupe.id}.xlsx`);
  };

  const toggleRoll = (index: number) => {
    setExpandedRolls((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <Wrapper>
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6">
        <button
          className="btn btn-primary w-full sm:w-auto self-end"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus  />details coupe
        </button>

        {loading && (
          <div className="text-center">
            <span className="loading loading-dots loading-lg"></span>
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="space-y-4">
          <div className="hidden md:block overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Modèle</th>
                  <th>Ref Article</th>
                  <th>Ref Tissu</th>
                  <th>Coloris Tissu</th>
                  
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupes.map((coupe) => (
                  <tr key={coupe.id}>
                    <td>{coupe.client.name || "N/A"}</td>
                    <td>{coupe.modele}</td>
                    <td>{coupe.refArticle}</td>
                    <td>{coupe.refTissu || "N/A"}</td>
                    <td>{coupe.colorisTissu || "N/A"}</td>
                    
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-sm btn-info" onClick={() => exportToExcel(coupe)}>
                          Export
                        </button>
                        <button className="btn btn-sm btn-info" onClick={() => handleEdit(coupe)}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-error" onClick={() => handleDelete(coupe.id)}>
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {coupes.map((coupe) => (
              <div key={coupe.id} className="card bg-base-100 shadow-md p-4">
                <div className="grid grid-cols-1 gap-2">
                  <div><strong>Client:</strong> {coupe.client.name || "N/A"}</div>
                  <div><strong>Modèle:</strong> {coupe.modele}</div>
                  <div><strong>Ref Article:</strong> {coupe.refArticle}</div>
                  <div><strong>Ref Tissu:</strong> {coupe.refTissu || "N/A"}</div>
                  <div><strong>Coloris:</strong> {coupe.colorisTissu || "N/A"}</div>
                  
                  <div className="flex gap-2 pt-2">
                    <button className="btn btn-sm btn-info flex-1" onClick={() => exportToExcel(coupe)}>
                      Export
                    </button>
                    <button className="btn btn-sm btn-info flex-1" onClick={() => handleEdit(coupe)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-error flex-1" onClick={() => handleDelete(coupe.id)}>
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <dialog className="modal" open={isModalOpen}>
          <div className="modal-box w-11/12 max-w-4xl max-h-[80vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">{formData.id ? "Edit" : "New"} Coupe</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {modalError && <div className="alert alert-error">{modalError}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  className="select select-bordered w-full"
                  value={formData.clientId || ""}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  required
                >
                  <option value="">Select Client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Modèle"
                  className="input input-bordered w-full"
                  value={formData.modele || ""}
                  onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Ref Article"
                  className="input input-bordered w-full"
                  value={formData.refArticle || ""}
                  onChange={(e) => setFormData({ ...formData, refArticle: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Ref Tissu"
                  className="input input-bordered w-full"
                  value={formData.refTissu || ""}
                  onChange={(e) => setFormData({ ...formData, refTissu: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Coloris Tissu"
                  className="input input-bordered w-full"
                  value={formData.colorisTissu || ""}
                  onChange={(e) => setFormData({ ...formData, colorisTissu: e.target.value })}
                />
              </div>

              <div className="card bg-base-200 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold">Sizes</h4>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => setSizes([...sizes, { label: "", quantity: 0 }])}
                  >
                    Add Size
                  </button>
                </div>
                <div className="space-y-2">
                  {sizes.map((size, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 flex-wrap sm:flex-nowrap"
                    >
                      <input
                        type="text"
                        placeholder="Size (e.g., 38, L)"
                        className="input input-bordered w-full sm:w-24"
                        value={size.label}
                        onChange={(e) =>
                          setSizes(sizes.map((s, i) => (i === index ? { ...s, label: e.target.value } : s)))
                        }
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        className="input input-bordered w-full sm:w-20"
                        value={size.quantity}
                        onChange={(e) =>
                          setSizes(sizes.map((s, i) => (i === index ? { ...s, quantity: Number(e.target.value) } : s)))
                        }
                      />
                      <button
                        type="button"
                        className="btn btn-error btn-sm w-10 h-10 flex items-center justify-center"
                        onClick={() => setSizes(sizes.filter((_, i) => i !== index))}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card bg-base-200 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold">Rolls ({rolls.length})</h4>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() =>
                      setRolls([
                        ...rolls,
                        {
                          nRlx: "",
                          metrRoul: 0,
                          nMatelas: "",
                          nbPils: 0,
                          longMatelas: 0,
                          mtsMatelas: 0,
                          restes: 0,
                          defauts: 0,
                          manqueRoul: 0,
                          pieces: sizes.map((s) => ({ sizeLabel: s.label, quantity: 0 })),
                        },
                      ])
                    }
                  >
                    Add Roll
                  </button>
                </div>
                <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                  {rolls.map((roll, rollIndex) => (
                    <div key={rollIndex} className="border rounded-lg">
                      <div
                        className="flex justify-between items-center p-3 cursor-pointer bg-base-100"
                        onClick={() => toggleRoll(rollIndex)}
                      >
                        <span className="font-medium">
                          Roll {rollIndex + 1}: {roll.nRlx || "Unnamed"} ({roll.metrRoul || 0}m)
                        </span>
                        <div className="flex gap-2 items-center">
                          <button
                            type="button"
                            className="btn btn-error btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRolls(rolls.filter((_, i) => i !== rollIndex));
                              setExpandedRolls(expandedRolls.filter((i) => i !== rollIndex));
                            }}
                          >
                            ×
                          </button>
                          {expandedRolls.includes(rollIndex) ? (
                            <ChevronUp size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                        </div>
                      </div>
                      {expandedRolls.includes(rollIndex) && (
                        <div className="p-3 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <label className="label">
                                <span className="label-text">N RLX</span>
                              </label>
                              <input
                                type="text"
                                className="input input-bordered w-full"
                                value={roll.nRlx || ""}
                                onChange={(e) =>
                                  setRolls(rolls.map((r, i) => (i === rollIndex ? { ...r, nRlx: e.target.value } : r)))
                                }
                              />
                            </div>
                            <div>
                              <label className="label">
                                <span className="label-text">Metrage Rouleaux</span>
                              </label>
                              <input
                                type="number"
                                className="input input-bordered w-full"
                                value={roll.metrRoul || 0}
                                onChange={(e) =>
                                  setRolls(rolls.map((r, i) => (i === rollIndex ? { ...r, metrRoul: Number(e.target.value) } : r)))
                                }
                              />
                            </div>
                            <div>
                              <label className="label">
                                <span className="label-text">N° Matelas</span>
                              </label>
                              <input
                                type="text"
                                className="input input-bordered w-full"
                                value={roll.nMatelas || ""}
                                onChange={(e) =>
                                  setRolls(rolls.map((r, i) => (i === rollIndex ? { ...r, nMatelas: e.target.value } : r)))
                                }
                              />
                            </div>
                            <div>
                              <label className="label">
                                <span className="label-text">Nb Pils</span>
                              </label>
                              <input
                                type="number"
                                className="input input-bordered w-full"
                                value={roll.nbPils || 0}
                                onChange={(e) =>
                                  setRolls(rolls.map((r, i) => (i === rollIndex ? { ...r, nbPils: Number(e.target.value) } : r)))
                                }
                              />
                            </div>
                            <div>
                              <label className="label">
                                <span className="label-text">Long Matelas</span>
                              </label>
                              <input
                                type="number"
                                className="input input-bordered w-full"
                                value={roll.longMatelas || 0}
                                onChange={(e) =>
                                  setRolls(rolls.map((r, i) => (i === rollIndex ? { ...r, longMatelas: Number(e.target.value) } : r)))
                                }
                              />
                            </div>
                            <div>
                              <label className="label">
                                <span className="label-text">MTS Matelas</span>
                              </label>
                              <input
                                type="number"
                                className="input input-bordered w-full"
                                value={roll.mtsMatelas || 0}
                                onChange={(e) =>
                                  setRolls(rolls.map((r, i) => (i === rollIndex ? { ...r, mtsMatelas: Number(e.target.value) } : r)))
                                }
                              />
                            </div>
                            <div>
                              <label className="label">
                                <span className="label-text">Restes</span>
                              </label>
                              <input
                                type="number"
                                className="input input-bordered w-full"
                                value={roll.restes || 0}
                                onChange={(e) =>
                                  setRolls(rolls.map((r, i) => (i === rollIndex ? { ...r, restes: Number(e.target.value) } : r)))
                                }
                              />
                            </div>
                            <div>
                              <label className="label">
                                <span className="label-text">Défauts</span>
                              </label>
                              <input
                                type="number"
                                className="input input-bordered w-full"
                                value={roll.defauts || 0}
                                onChange={(e) =>
                                  setRolls(rolls.map((r, i) => (i === rollIndex ? { ...r, defauts: Number(e.target.value) } : r)))
                                }
                              />
                            </div>
                            <div>
                              <label className="label">
                                <span className="label-text">Manque Rouleux</span>
                              </label>
                              <input
                                type="number"
                                className="input input-bordered w-full"
                                value={roll.manqueRoul || 0}
                                onChange={(e) =>
                                  setRolls(rolls.map((r, i) => (i === rollIndex ? { ...r, manqueRoul: Number(e.target.value) } : r)))
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-semibold">Pieces:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                              {roll.pieces.map((piece, pieceIndex) => (
                                <div key={pieceIndex} className="flex flex-col gap-2">
                                  <label className="label">
                                    <span className="label-text">{piece.sizeLabel}</span>
                                  </label>
                                  <input
                                    type="number"
                                    className="input input-bordered w-full"
                                    value={piece.quantity}
                                    onChange={(e) =>
                                      setRolls(
                                        rolls.map((r, i) =>
                                          i === rollIndex
                                            ? {
                                                ...r,
                                                pieces: r.pieces.map((p, j) =>
                                                  j === pieceIndex ? { ...p, quantity: Number(e.target.value) } : p
                                                ),
                                              }
                                            : r
                                        )
                                      )
                                    }
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <button
                  type="button"
                  className="btn btn-ghost w-full sm:w-auto"
                  onClick={() => {
                    setIsModalOpen(false);
                    setModalError(null);
                    setFormData({
                      clientId: "",
                      modele: "",
                      refArticle: "",
                      refTissu: "",
                      colorisTissu: "",
                      sizes: [],
                      rolls: [],
                    });
                    setSizes([]);
                    setRolls([]);
                    setExpandedRolls([]);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary w-full sm:w-auto">
                  {formData.id ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      </div>
    </div>
    </Wrapper>
  );
}