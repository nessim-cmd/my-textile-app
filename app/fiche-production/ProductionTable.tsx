/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Save, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ProductionEntry {
  week: string;
  day: string;
  hour: string;
  quantityCreated: number;
}

interface ProductionTableProps {
  ficheId: string;
  clientId: string;
  modelId: string;
  commande: string;
  quantity: number;
  productionData: Record<string, number>;
  setProductionData: (data: Record<string, number>) => void;
  setError: (error: string | null) => void;
  currentWeek: string;
  setCurrentWeek: (week: string) => void;
  getToken: () => Promise<string | null>;
  modelName?: string;
  clientName?: string;
}

export default function ProductionTable({
  ficheId,
  clientId,
  modelId,
  commande,
  quantity,
  productionData,
  setProductionData,
  setError,
  currentWeek,
  setCurrentWeek,
  getToken,
  modelName = 'Unknown Model',
  clientName = 'Unknown Client',
}: ProductionTableProps) {
  const [loading, setLoading] = useState(false);
  const timeSlots = [
    '8:00 - 9:00', '9:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
    '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '15:30 - 16:30',
  ];
  const weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  useEffect(() => {
    const fetchFicheData = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        if (!token) throw new Error('No authentication token');
        const res = await fetch(`/api/fiche-production/${ficheId}?t=${new Date().getTime()}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('Failed to fetch fiche');
        const fiche = await res.json();
        console.log('Fetched fiche data:', fiche);

        // Normalize hour format to match timeSlots
        const newProductionData = fiche.production.reduce(
          (acc: Record<string, number>, entry: ProductionEntry) => {
            // Convert saved hour (e.g., "8:00 ") to match timeSlots (e.g., "8:00 - 9:00")
            const normalizedHour = timeSlots.find(slot => slot.startsWith(entry.hour.trim())) || entry.hour;
            const key = `${entry.week}-${entry.day}-${normalizedHour}`;
            acc[key] = entry.quantityCreated;
            return acc;
          },
          {}
        );
        console.log('Mapped productionData:', newProductionData);
        setProductionData(newProductionData);
      } catch (error) {
        console.error('Error fetching fiche data:', error);
        setError('Failed to load production data');
      } finally {
        setLoading(false);
      }
    };

    fetchFicheData();
  }, [ficheId, getToken, setProductionData, setError]);

  const handleProductionChange = (day: string, hour: string, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    const key = `${currentWeek}-${day}-${hour}`;
    const newProductionData = {
      ...productionData,
      [key]: numValue,
    };

    const totalSewn = Object.values(newProductionData).reduce((sum, qty) => sum + qty, 0);
    if (totalSewn > quantity) {
      toast.error(`You have exceeded the limit of ${quantity}! Total sewn: ${totalSewn}`);
    }

    setProductionData(newProductionData);
  };

  const getDailyTotal = (day: string) => {
    return timeSlots.reduce((sum, slot) => sum + (productionData[`${currentWeek}-${day}-${slot}`] || 0), 0);
  };

  const getTimeSlotTotal = (slot: string) => {
    return weekdays.reduce((sum, day) => sum + (productionData[`${currentWeek}-${day}-${slot}`] || 0), 0);
  };

  const totalSewn = Object.values(productionData).reduce((sum, qty) => sum + qty, 0);

  const saveFiche = async () => {
    setLoading(true);
    setError(null);
    const token = await getToken();
    if (!token) {
      setError('Authentication token not available');
      setLoading(false);
      return;
    }

    const productionEntries = Object.entries(productionData).map(([key, qty]) => {
      const [week, day, hour] = key.split('-');
      return { week, day, hour, quantityCreated: qty };
    });

    const payload = {
      clientId,
      modelId,
      commande,
      quantity,
      production: productionEntries,
    };

    try {
      const res = await fetch(`/api/fiche-production/${ficheId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to save fiche: ${text}`);
      }

      const updatedFiche = await res.json();
      console.log('Saved fiche response:', updatedFiche);

      const newProductionData = updatedFiche.production.reduce(
        (acc: Record<string, number>, entry: ProductionEntry) => {
          const normalizedHour = timeSlots.find(slot => slot.startsWith(entry.hour.trim())) || entry.hour;
          const key = `${entry.week}-${entry.day}-${normalizedHour}`;
          acc[key] = entry.quantityCreated;
          return acc;
        },
        {}
      );
      setProductionData(newProductionData);
      toast.success('Fiche Production saved successfully!');
    } catch (error) {
      console.error('Error saving fiche:', error);
      setError('Failed to save fiche');
      toast.error('Failed to save fiche');
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
    const title = 'Fiche Production';
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

    const headers = ['Week', 'Hour', ...weekdays, 'Total'];
    const weeks = [...new Set(Object.keys(productionData).map((key) => key.split('-')[0]))];
    const body = weeks.flatMap((week) =>
      timeSlots.map((slot) => [
        week,
        slot,
        ...weekdays.map((day) => productionData[`${week}-${day}-${slot}`] || 0),
        weekdays.reduce((sum, day) => sum + (productionData[`${week}-${day}-${slot}`] || 0), 0),
      ])
    );

    body.push(['', 'Total', ...weekdays.map((day) => getDailyTotal(day)), totalSewn]);

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

    doc.save(`fiche_production_${modelName}_${new Date().toISOString().split('T')[0]}.pdf`);
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

      {loading ? (
        <div className="text-center"><span className="loading loading-spinner loading-lg"></span></div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-gray-200">
                  <th className="text-gray-700 font-bold">Time Slot</th>
                  {weekdays.map((day) => (
                    <th key={day} className="text-gray-700 font-bold">{day}</th>
                  ))}
                  <th className="text-gray-700 font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((slot) => (
                  <tr key={slot}>
                    <td className="font-medium">{slot}</td>
                    {weekdays.map((day) => {
                      const key = `${currentWeek}-${day}-${slot}`;
                      const value = productionData[key] !== undefined ? productionData[key] : '';
                      const isEmptyOrZero = value === '' || value === 0;
                      return (
                        <td key={`${day}-${slot}`}>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleProductionChange(day, slot, e.target.value)}
                            className={`input input-bordered w-16 text-center ${
                              isEmptyOrZero ? 'bg-red-100' : 'bg-green-100'
                            }`}
                            placeholder="0"
                          />
                        </td>
                      );
                    })}
                    <td className="font-bold">{getTimeSlotTotal(slot)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td className="font-bold">Total</td>
                  {weekdays.map((day) => (
                    <td key={day} className="font-bold">{getDailyTotal(day)}</td>
                  ))}
                  <td className="font-bold">{totalSewn}</td>
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
              <h3 className="text-lg font-semibold">{weekdays[currentDayIndex]}</h3>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setCurrentDayIndex((prev) => Math.min(prev + 1, weekdays.length - 1))}
                disabled={currentDayIndex === weekdays.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {timeSlots.map((slot) => {
                const key = `${currentWeek}-${weekdays[currentDayIndex]}-${slot}`;
                const value = productionData[key] !== undefined ? productionData[key] : '';
                const isEmptyOrZero = value === '' || value === 0;
                return (
                  <div key={slot} className="flex justify-between items-center">
                    <span className="font-medium">{slot}</span>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleProductionChange(weekdays[currentDayIndex], slot, e.target.value)}
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
                <span>{getDailyTotal(weekdays[currentDayIndex])}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="bg-blue-100 text-blue-800 p-3 rounded-lg shadow">
              <span className="font-semibold">Total Sewn: </span>
              <span className="text-lg font-bold">{totalSewn}</span>
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