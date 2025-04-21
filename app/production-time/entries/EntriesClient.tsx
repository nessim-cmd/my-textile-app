"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect, useCallback } from "react";
import { Save, Download, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useSearchParams } from "next/navigation";

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

export default function EntriesClient() {
  const { getToken } = useAuth();
  const searchParams = useSearchParams();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [timeEntries, setTimeEntries] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<string>(() => {
    const urlDate = searchParams.get("date");
    return urlDate || new Date().toISOString().split("T")[0];
  });
  const [currentEmployeeIndex, setCurrentEmployeeIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const timeSlots = [
    "Duree",
    "8:00-9:00",
    "9:00-10:00",
    "10:00-11:00",
    "11:00-12:00",
    "12:30-13:30",
    "13:30-14:30",
    "14:30-15:30",
  ];

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch("/api/employee", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch employees");
      const data: Employee[] = await res.json();
      const sortedEmployees = data.sort((a, b) => a.name.localeCompare(b.name));
      setEmployees(sortedEmployees);
      setFilteredEmployees(sortedEmployees);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
      console.error("Fetch employees error:", errorMsg);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const fetchTimeEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch("/api/production-time", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch time entries");
      const data: ProductionTimeEntry[] = await res.json();
      const entriesForDate = data.filter((entry) => entry.date.split("T")[0] === date);
      const newTimeEntries = entriesForDate.reduce(
        (acc: Record<string, Record<string, string>>, entry) => {
          acc[entry.employeeId] = entry.hours;
          return acc;
        },
        {}
      );
      setTimeEntries(newTimeEntries);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
      console.error("Fetch time entries error:", errorMsg);
    } finally {
      setLoading(false);
    }
  }, [getToken, date]);

  useEffect(() => {
    fetchEmployees();
    fetchTimeEntries();
  }, [fetchEmployees, fetchTimeEntries]);

  useEffect(() => {
    const filtered = employees
      .filter((emp) => emp.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
    setFilteredEmployees(filtered);
    setCurrentEmployeeIndex(0);
  }, [searchTerm, employees]);

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
    setError(null);
    try {
      const token = await getToken();
      const entries = Object.entries(timeEntries).map(([employeeId, hours]) => ({
        employeeId,
        date,
        hours: timeSlots.reduce((acc, slot) => {
          acc[slot] = hours[slot] || "";
          return acc;
        }, {} as Record<string, string>),
      }));

      for (const entry of entries) {
        const res = await fetch("/api/production-time", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(entry),
        });
        if (!res.ok) throw new Error("Failed to save time entry");
      }
      toast.success("Time entries saved successfully!");
      await fetchTimeEntries();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
      toast.error("Failed to save time entries");
      console.error("Save entries error:", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(19);
    doc.text("Production Time Entries", 14, 20);
    doc.setFontSize(14);
    doc.text(`Date: ${date}`, 14, 30);

    const headers = ["Name", "Position", ...timeSlots];
    const body = filteredEmployees.map((emp) => [
      emp.name,
      emp.poste,
      ...timeSlots.map((slot) => timeEntries[emp.id]?.[slot] || ""),
    ]);

    autoTable(doc, {
      head: [headers],
      body,
      startY: 40,
      theme: "grid",
      styles: { fontSize: 11, lineColor: [0, 0, 0], lineWidth: 0.15 },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
      },
      bodyStyles: {
        lineWidth: 0.15,
        lineColor: [0, 0, 0],
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 30 },
        2: { cellWidth: 20 }, // Duree column
      },
    });

    doc.save(`production_time_${date}.pdf`);
  };

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-3">Production Time - Entries</h1>
      <div className="mb-6 space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Select Date</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input input-bordered w-full max-w-xs"
          />
        </div>
        <div className="form-control flex items-center gap-2">
          <input
            type="text"
            placeholder="Search employees by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered w-full max-w-xs"
          />
          <Search className="w-5 h-5 text-gray-500" />
        </div>
      </div>
      {loading ? (
        <div className="text-center">
          <span className="loading loading-dots loading-lg" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : filteredEmployees.length > 0 ? (
        <>
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-gray-200">
                  <th>Name</th>
                  <th>Position</th>
                  {timeSlots.map((slot) => (
                    <th key={slot}>{slot}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.name}</td>
                    <td>{emp.poste}</td>
                    {timeSlots.map((slot) => (
                      <td key={slot}>
                        <input
                          type="text"
                          value={timeEntries[emp.id]?.[slot] || ""}
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
                {filteredEmployees[currentEmployeeIndex]?.name} (
                {filteredEmployees[currentEmployeeIndex]?.poste})
              </h3>
              <button
                className="btn btn-outline btn-sm"
                onClick={() =>
                  setCurrentEmployeeIndex((prev) => Math.min(prev + 1, filteredEmployees.length - 1))
                }
                disabled={currentEmployeeIndex === filteredEmployees.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {timeSlots.map((slot) => {
                const employee = filteredEmployees[currentEmployeeIndex];
                const value = timeEntries[employee?.id]?.[slot] || "";
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
              <Save className="w-5 h-5" />
              Save
            </button>
            <button
              className="btn btn-secondary flex items-center gap-2"
              onClick={downloadPDF}
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
          </div>
        </>
      ) : (
        <div className="text-center">
          {searchTerm ? "No employees match your search" : "No employees found"}
        </div>
      )}
    </div>
  );
}