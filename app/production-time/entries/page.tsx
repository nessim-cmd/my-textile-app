"use client";

import Wrapper from '@/components/Wrapper';
import { useAuth } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Save, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useSearchParams } from 'next/navigation';

interface Employee {
  id: string;
  name: string;
  poste: string;
}

interface ProductionTimeEntry {
  id: string;
  employeeId: string;
  employee: Employee;
  date: string;
  hours: Record<string, string>;
}

export default function ProductionTimeEntriesPage() {
  const { getToken } = useAuth();
  const searchParams = useSearchParams();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timeEntries, setTimeEntries] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<string>(() => {
    const urlDate = searchParams.get('date');
    return urlDate || new Date().toISOString().split('T')[0];
  });
  const [currentEmployeeIndex, setCurrentEmployeeIndex] = useState(0);

  const timeSlots = [
    '8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00',
    '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00',
  ];

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/employee', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch employees');
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch employees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeEntries = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/production-time', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch time entries');
      const data: ProductionTimeEntry[] = await res.json();
      const entriesForDate = data.filter((entry) => entry.date.split('T')[0] === date);
      const newTimeEntries = entriesForDate.reduce((acc, entry) => {
        acc[entry.employeeId] = entry.hours;
        return acc;
      }, {} as Record<string, Record<string, string>>);
      setTimeEntries(newTimeEntries);
    } catch (err) {
      setError('Failed to fetch time entries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchTimeEntries();
  }, [date]);

  const handleHourChange = (employeeId: string, slot: string, value: string) => {
    setTimeEntries((prev) => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [slot]: value,
      },
    }));
  };

  const saveEntries = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const entries = Object.entries(timeEntries).map(([employeeId, hours]) => ({
        employeeId,
        date,
        hours: timeSlots.reduce((acc, slot) => {
          acc[slot] = hours[slot] || '';
          return acc;
        }, {} as Record<string, string>),
      }));

      for (const entry of entries) {
        await fetch('/api/production-time', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(entry),
        });
      }
      toast.success('Time entries saved successfully!');
      fetchTimeEntries();
    } catch (err) {
      setError('Failed to save time entries');
      toast.error('Failed to save time entries');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18);
    doc.text('Production Time Entries', 14, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${date}`, 14, 30);

    const headers = ['Name', 'Poste', ...timeSlots];
    const body = employees.map((emp) => [
      emp.name,
      emp.poste,
      ...timeSlots.map((slot) => timeEntries[emp.id]?.[slot] || ''),
    ]);

    (doc as any).autoTable({
      head: [headers],
      body,
      startY: 40,
      theme: ' striped',
      styles: { fontSize: 8 },
      columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 30 } },
    });

    doc.save(`production_time_${date}.pdf`);
  };

  return (
    <Wrapper>
      <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Production Time - Entries</h1>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Select Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input input-bordered w-full max-w-xs"
          />
        </div>
        {loading ? (
          <div className="text-center"><span className="loading loading-dots loading-lg"></span></div>
        ) : employees.length > 0 ? (
          <>
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="bg-gray-200">
                    <th>Name</th>
                    <th>Poste</th>
                    {timeSlots.map((slot) => (
                      <th key={slot}>{slot}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.name}</td>
                      <td>{emp.poste}</td>
                      {timeSlots.map((slot) => (
                        <td key={slot}>
                          <input
                            type="text"
                            value={timeEntries[emp.id]?.[slot] || ''}
                            onChange={(e) => handleHourChange(emp.id, slot, e.target.value)}
                            className="input input-bordered w-20 text-center"
                            placeholder=""
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              <div className="flex justify-between items-center">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setCurrentEmployeeIndex((prev) => Math.max(prev - 1, 0))}
                  disabled={currentEmployeeIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h3 className="text-lg font-semibold">
                  {employees[currentEmployeeIndex]?.name} ({employees[currentEmployeeIndex]?.poste})
                </h3>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setCurrentEmployeeIndex((prev) => Math.min(prev + 1, employees.length - 1))}
                  disabled={currentEmployeeIndex === employees.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {timeSlots.map((slot) => {
                  const employee = employees[currentEmployeeIndex];
                  const value = timeEntries[employee?.id]?.[slot] || '';
                  return (
                    <div key={slot} className="flex justify-between items-center">
                      <span className="font-medium">{slot}</span>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleHourChange(employee.id, slot, e.target.value)}
                        className="input input-bordered w-24 text-center"
                        placeholder=""
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
              <button
                className="btn btn-primary flex items-center gap-2"
                onClick={saveEntries}
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
          </>
        ) : (
          <div className="text-center">No employees found</div>
        )}
      </div>
    </Wrapper>
  );
}