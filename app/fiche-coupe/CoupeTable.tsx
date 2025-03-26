/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Save, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface CoupeEntry {
  week: string;
  day: string;
  category: string;
  quantityCreated: number;
}

interface CoupeTableProps {
  ficheId: string;
  clientId: string;
  modelId: string;
  commande: string;
  quantity: number;
  coupeData: Record<string, number>;
  setCoupeData: (data: Record<string, number>) => void;
  setError: (error: string | null) => void;
  currentWeek: string;
  setCurrentWeek: (week: string) => void;
  getToken: () => Promise<string | null>;
  modelName?: string;
  clientName?: string;
}

export default function CoupeTable({
  ficheId,
  clientId,
  modelId,
  commande,
  quantity,
  coupeData,
  setCoupeData,
  setError,
  currentWeek,
  setCurrentWeek,
  getToken,
  modelName = 'Unknown Model',
  clientName = 'Unknown Client',
}: CoupeTableProps) {
  const [loading, setLoading] = useState(false);
  const categories = ['Tissu1', 'Tissu2',"Veseline","Doublure", 'Broderie', 'Serigraphie', 'Autres'];
  const days = ['lun-17', 'mar-18', 'mer-19', 'jeu-20', 'ven-21', 'sam-22'];
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  useEffect(() => {
    const loadCoupeData = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        if (!token) throw new Error('Authentication token is missing');
        const res = await fetch(`/api/fiche-coupe/${ficheId}?t=${new Date().getTime()}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('Failed to fetch fiche-coupe data');
        const fiche = await res.json();
        console.log('Fetched fiche data:', fiche);

        // Map database entries to table-compatible keys
        const newCoupeData = fiche.coupe.reduce((acc: Record<string, number>, entry: CoupeEntry) => {
          const dayFromDb = entry.day; // e.g., "lun-17" or "lun"
          const categoryFromDb = entry.category; // e.g., "Tissu1" or "17"
          // Find the matching day (handles both "lun" and "lun-17")
          const matchingDay = days.find(d => d === dayFromDb) || days.find(d => d.startsWith(dayFromDb));
          if (matchingDay) {
            // Use the category as-is if it matches a predefined category, otherwise default to 'Tissu1' for legacy data
            const category = categories.includes(categoryFromDb) ? categoryFromDb : 'Tissu1';
            const key = `${entry.week}-${matchingDay}-${category}`;
            acc[key] = (acc[key] || 0) + entry.quantityCreated; // Sum if multiple entries
          }
          return acc;
        }, {});
        console.log('Mapped coupeData:', newCoupeData);
        setCoupeData(newCoupeData);
      } catch (error) {
        console.error('Error loading coupe data:', error);
        setError('Failed to load coupe data');
      } finally {
        setLoading(false);
      }
    };

    loadCoupeData();
  }, [ficheId, getToken, setCoupeData, setError]);

  const handleCoupeChange = (day: string, category: string, value: string) => {
    const numValue = Math.max(0, parseFloat(value) || 0);
    const key = `${currentWeek}-${day}-${category}`;
    const newCoupeData = {
      ...coupeData,
      [key]: numValue,
    };

    const totalProcessed = Object.values(newCoupeData).reduce((sum, qty) => sum + qty, 0);
    if (totalProcessed > quantity) {
      toast.error(`You have exceeded the limit of ${quantity}! Total processed: ${totalProcessed}`);
    }

    setCoupeData(newCoupeData);
  };

  const getDailyTotal = (day: string) => {
    return categories.reduce((sum, cat) => sum + (coupeData[`${currentWeek}-${day}-${cat}`] || 0), 0);
  };

  const getCategoryTotal = (category: string) => {
    return days.reduce((sum, day) => sum + (coupeData[`${currentWeek}-${day}-${category}`] || 0), 0);
  };

  const totalProcessed = Object.values(coupeData).reduce((sum, qty) => sum + qty, 0);

  const saveFiche = async () => {
    setLoading(true);
    setError(null);
    const token = await getToken();
    if (!token) {
      setError('Authentication token not available');
      setLoading(false);
      return;
    }

    // Map coupeData to coupeEntries, preserving the full day and category
    const coupeEntries = Object.entries(coupeData).map(([key, qty]) => {
      const [week, ...rest] = key.split('-');
      const day = `${rest[0]}-${rest[1]}`; // Reconstruct "sam-22"
      const category = rest[2]; // e.g., "Autres"
      return { week, day, category, quantityCreated: qty };
    });

    const payload = {
      clientId,
      modelId,
      commande,
      quantity,
      coupe: coupeEntries,
    };

    try {
      const res = await fetch(`/api/fiche-coupe/${ficheId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to save fiche-coupe: ${text}`);
      }

      const updatedFiche = await res.json();
      console.log('Saved fiche response:', updatedFiche);

      // Map the saved data back to coupeData
      const newCoupeData = updatedFiche.coupe.reduce((acc: Record<string, number>, entry: CoupeEntry) => {
        const dayFromDb = entry.day; // e.g., "sam-22"
        const categoryFromDb = entry.category; // e.g., "Autres"
        const matchingDay = days.find(d => d === dayFromDb);
        if (matchingDay && categories.includes(categoryFromDb)) {
          const key = `${entry.week}-${matchingDay}-${categoryFromDb}`;
          acc[key] = (acc[key] || 0) + entry.quantityCreated;
        }
        return acc;
      }, {});
      console.log('Mapped coupeData after save:', newCoupeData);
      setCoupeData(newCoupeData);
      toast.success('Fiche Coupe saved successfully!');
    } catch (error) {
      console.error('Error saving fiche-coupe:', error);
      setError('Failed to save fiche-coupe');
      toast.error('Failed to save fiche-coupe');
    } finally {
      setLoading(false);
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
    doc.text(`Client: ${clientName}`, 14, 55);
    doc.text(`Modele: ${modelName}`, 14, 61);
    doc.text(`Commande: ${commande}`, 14, 67);
    doc.text(`Quantite: ${quantity}`, 14, 73);

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

    doc.save(`fiche_coupe_${modelName}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
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
          <ChevronLeft className="w-4 h-4" /> Prev Sem
        </button>
        <h3 className="text-lg font-semibold">{currentWeek}</h3>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => {
            const weekNum = parseInt(currentWeek.split(' ')[1]) + 1;
            setCurrentWeek(`Week ${weekNum}`);
          }}
        >
          Next Sem <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="text-center"><span className="loading loading-spinner loading-lg"></span></div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-gray-200">
                  <th className="text-gray-700 font-bold">Catégorie</th>
                  {days.map((day) => (
                    <th key={day} className="text-gray-700 font-bold">{day}</th>
                  ))}
                  <th className="text-gray-700 font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat}>
                    <td className="font-medium">{cat}</td>
                    {days.map((day) => {
                      const key = `${currentWeek}-${day}-${cat}`;
                      const value = coupeData[key] !== undefined ? coupeData[key] : '';
                      const isEmptyOrZero = value === '' || value === 0;
                      return (
                        <td key={`${day}-${cat}`}>
                          <input
                            type="number"
                            value={value}
                            onChange={(e) => handleCoupeChange(day, cat, e.target.value)}
                            className={`input input-bordered w-16 text-center ${
                              isEmptyOrZero ? 'bg-red-100' : 'bg-green-100'
                            }`}
                            placeholder="0"
                          />
                        </td>
                      );
                    })}
                    <td className="font-bold">{getCategoryTotal(cat)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td className="font-bold">Total</td>
                  {days.map((day) => (
                    <td key={day} className="font-bold">{getDailyTotal(day)}</td>
                  ))}
                  <td className="font-bold">{totalProcessed}</td>
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
                const value = coupeData[key] !== undefined ? coupeData[key] : '';
                const isEmptyOrZero = value === '' || value === 0;
                return (
                  <div key={cat} className="flex justify-between items-center">
                    <span className="font-medium">{cat}</span>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => handleCoupeChange(days[currentDayIndex], cat, e.target.value)}
                      className={`input input-bordered w-20 text-center ${
                        isEmptyOrZero ? 'bg-red-100' : 'bg-green-100'
                      }`}
                      placeholder="0"
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
            </div>
            <div className="flex gap-4">
              <button
                className="btn btn-primary flex items-center gap-2"
                onClick={saveFiche}
                disabled={loading}
              >
                <Save className="w-5 h-5" /> Save
              </button>
              <button
                className="btn btn-secondary flex items-center gap-2"
                onClick={downloadPDF}
              >
                <Download className="w-5 h-5" /> Download PDF
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}