/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Save, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Link from 'next/link';

export default function FicheCoupeEdit({ params }: { params: { id: string } }) {
  const { getToken } = useAuth();
  const [fiche, setFiche] = useState<any>(null);
  const [coupeData, setCoupeData] = useState<Record<string, number>>({});
  const [currentWeek, setCurrentWeek] = useState('Week 1');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const categories = ['Tissu1', 'Tissu2', 'Broderie', 'Serigraphie', 'Autres'];
  const days = ['lun-17', 'mar-18', 'mer-19', 'jeu-20', 'ven-21', 'sam-22'];
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  const fetchFiche = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/fiche-coupe/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch fiche');
      const data = await res.json();
      console.log(`[FETCH] Fiche ${params.id} data:`, JSON.stringify(data, null, 2));
      setFiche(data);
      const newCoupeData = data.coupe.reduce((acc: Record<string, number>, entry: any) => {
        const key = `${entry.week}-${entry.day}-${entry.category}`;
        acc[key] = entry.quantityCreated;
        return acc;
      }, {});
      console.log(`[FETCH] Setting coupeData:`, JSON.stringify(newCoupeData, null, 2));
      setCoupeData(newCoupeData);
    } catch (error) {
      console.error('[FETCH ERROR]', error);
      toast.error('Failed to load fiche');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiche();
  }, [params.id]);

  const handleCoupeChange = (day: string, category: string, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    const key = `${currentWeek}-${day}-${category}`;
    const newCoupeData = { ...coupeData, [key]: numValue };
    console.log(`[INPUT] Updated ${key} to ${numValue}, new coupeData:`, JSON.stringify(newCoupeData, null, 2));
    setCoupeData(newCoupeData);
  };

  const getDailyTotal = (day: string) => {
    return categories.reduce((sum, cat) => {
      const key = `${currentWeek}-${day}-${cat}`;
      return sum + (coupeData[key] || 0);
    }, 0);
  };

  const getCategoryTotal = (category: string) => {
    return days.reduce((sum, day) => {
      const key = `${currentWeek}-${day}-${category}`;
      return sum + (coupeData[key] || 0);
    }, 0);
  };

  const totalProcessed = Object.values(coupeData).reduce((sum, qty) => sum + qty, 0);

  const saveFiche = async () => {
    setIsSaving(true);
    try {
      const token = await getToken();
      const coupeEntries = Object.entries(coupeData)
        .filter(([_, qty]) => qty > 0)
        .map(([key, qty]) => {
          const [week, day, category] = key.split('-');
          return { week, day, category, quantityCreated: qty };
        });

      const payload = {
        clientId: fiche.clientId,
        modelId: fiche.modelId,
        commande: fiche.commande,
        quantity: fiche.quantity,
        coupe: coupeEntries,
      };

      console.log(`[SAVE] Sending payload for fiche ${params.id}:`, JSON.stringify(payload, null, 2));
      const res = await fetch(`/api/fiche-coupe/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to save fiche: ${errorText}`);
      }

      const updatedFiche = await res.json();
      console.log(`[SAVE] Server response:`, JSON.stringify(updatedFiche, null, 2));

      // Update local state with the server response
      const newCoupeData = updatedFiche.coupe.reduce((acc: Record<string, number>, entry: any) => {
        const key = `${entry.week}-${entry.day}-${entry.category}`;
        acc[key] = entry.quantityCreated;
        return acc;
      }, {});
      console.log(`[SAVE] Setting coupeData:`, JSON.stringify(newCoupeData, null, 2));
      setCoupeData(newCoupeData);
      setFiche(updatedFiche);
      toast.success('Fiche saved successfully!');
    } catch (error) {
      console.error('[SAVE ERROR]', error);
      toast.error('Failed to save fiche');
    } finally {
      setIsSaving(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text('MS Tailors', 14, 15);
    doc.setFontSize(10);
    doc.text('Confection et Industrie du textile', 14, 22);
    doc.text('Avenue de l\'environnement El Mida', 14, 29);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    const title = 'Fiche Coupe';
    const pageWidth = doc.internal.pageSize.getWidth();
    const titleWidth = doc.getTextWidth(title);
    const titleX = (pageWidth - titleWidth) / 2;
    doc.text(title, titleX, 40);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Client: ${fiche?.client?.name || 'Unknown'}`, 14, 55);
    doc.text(`Modele: ${fiche?.model?.name || 'Unknown'}`, 14, 61);
    doc.text(`Commande: ${fiche?.commande || 'Unknown'}`, 14, 67);
    doc.text(`Quantite: ${fiche?.quantity || 0}`, 14, 73);

    const headers = ['Week', 'Category', ...days, 'Total'];
    const weeks = [...new Set(Object.keys(coupeData).map((key) => key.split('-')[0]))];
    const body = weeks.flatMap((week) =>
      categories.map((cat) => [
        week,
        cat,
        ...days.map((day) => coupeData[`${week}-${day}-${cat}`] || 0),
        days.reduce((sum, day) => sum + (coupeData[`${week}-${day}-${cat}`] || 0), 0),
      ])
    );

    body.push(['', 'Total', ...days.map((day) => getDailyTotal(day)), totalProcessed]);

    (doc as any).autoTable({
      head: [headers],
      body: body,
      startY: 83,
      theme: 'striped',
      headStyles: { fillColor: [100, 100, 100], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { cellPadding: 3 },
      didParseCell: (data: any) => {
        if (data.row.index === body.length - 1) {
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });

    doc.save(`fiche_coupe_${fiche?.model?.name || 'unknown'}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) return <div className="text-center"><span className="loading loading-spinner loading-lg"></span></div>;
  if (!fiche) return <div className="text-center">Fiche not found</div>;

  return (
    <div className="p-6">
      <Link href="/fiche-coupe" className="btn btn-outline mb-4">Back to List</Link>
      <h1 className="text-2xl font-bold mb-4">Edit Fiche: {fiche.commande}</h1>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              const weekNum = parseInt(currentWeek.split(' ')[1]) - 1;
              setCurrentWeek(weekNum > 0 ? `Week ${weekNum}` : 'Week 1');
            }}
            disabled={currentWeek === 'Week 1'}
          >
            <ChevronLeft className="w-4 h-4" /> Prev Week
          </button>
          <h3 className="text-lg font-semibold">{currentWeek}</h3>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              const weekNum = parseInt(currentWeek.split(' ')[1]) + 1;
              setCurrentWeek(`Week ${weekNum}`);
            }}
          >
            Next Week <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="table w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 sticky top-0 z-10">
                <th className="text-gray-700 font-bold p-2 border">Catégorie</th>
                {days.map((day) => (
                  <th key={day} className="text-gray-700 font-bold p-2 border">{day}</th>
                ))}
                <th className="text-gray-700 font-bold p-2 border">Total</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat} className="hover:bg-gray-50">
                  <td className="font-medium p-2 border">{cat}</td>
                  {days.map((day) => {
                    const key = `${currentWeek}-${day}-${cat}`;
                    const value = coupeData[key] || 0;
                    return (
                      <td key={`${day}-${cat}`} className="p-2 border">
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => handleCoupeChange(day, cat, e.target.value)}
                          className={`input input-bordered w-16 text-center ${
                            value > 0 ? 'bg-green-100' : 'bg-white'
                          }`}
                          min="0"
                        />
                      </td>
                    );
                  })}
                  <td className="font-bold p-2 border">{getCategoryTotal(cat)}</td>
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td className="font-bold p-2 border">Total</td>
                {days.map((day) => (
                  <td key={day} className="font-bold p-2 border">{getDailyTotal(day)}</td>
                ))}
                <td className="font-bold p-2 border">{totalProcessed}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-4">
          <div className="flex justify-between items-center">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setCurrentDayIndex((prev) => Math.max(prev - 1, 0))}
              disabled={currentDayIndex === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-semibold">{days[currentDayIndex]}</h3>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setCurrentDayIndex((prev) => Math.min(prev + 1, days.length - 1))}
              disabled={currentDayIndex === days.length - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {categories.map((cat) => {
              const key = `${currentWeek}-${days[currentDayIndex]}-${cat}`;
              const value = coupeData[key] || 0;
              return (
                <div key={cat} className="flex justify-between items-center">
                  <span className="font-medium">{cat}</span>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleCoupeChange(days[currentDayIndex], cat, e.target.value)}
                    className={`input input-bordered w-20 text-center ${
                      value > 0 ? 'bg-green-100' : 'bg-white'
                    }`}
                    min="0"
                  />
                </div>
              );
            })}
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{getDailyTotal(days[currentDayIndex])}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="bg-blue-100 text-blue-800 p-3 rounded-lg shadow">
            <span className="font-semibold">Total Processed: </span>
            <span className="text-lg font-bold">{totalProcessed}</span>
            <span> / </span>
            <span className="text-lg font-bold">{fiche.quantity}</span>
          </div>
          <div className="flex gap-4">
            <button
              className="btn btn-primary flex items-center gap-2"
              onClick={saveFiche}
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <Save className="w-5 h-5" />
              )}
              Save
            </button>
            <button
              className="btn btn-secondary flex items-center gap-2"
              onClick={downloadPDF}
            >
              <Download className="w-5 h-5" /> Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}