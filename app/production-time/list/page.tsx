"use client";

import Wrapper from '@/components/Wrapper';
import { useAuth } from '@clerk/nextjs';
import { useState, useEffect, useCallback } from 'react';
import { Eye, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

export default function ProductionTimeListPage() {
  const { getToken } = useAuth();
  const [entriesByDate, setEntriesByDate] = useState<Record<string, ProductionTimeEntry[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchTimeEntries = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/production-time', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch time entries');
      const data: ProductionTimeEntry[] = await res.json();
      const groupedByDate = data.reduce((acc, entry) => {
        const dateKey = entry.date.split('T')[0];
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(entry);
        return acc;
      }, {} as Record<string, ProductionTimeEntry[]>);
      setEntriesByDate(groupedByDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [getToken]); // Dependency: getToken

  useEffect(() => {
    fetchTimeEntries();
  }, [fetchTimeEntries]);

  const handleViewEntries = (date: string) => {
    router.push(`/production-time/entries?date=${date}`);
  };

  return (
    <Wrapper>
      <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Production Time - Entries List</h1>
        <a className='flex bg-accent border-amber-700 rounded-xl w-60 h-10 text-center justify-center pt-1 font-bold text-white'
        href="/production-time/entries"
        >
          New Production
          <Plus/>
        </a>
        </div>
        {loading ? (
          <div className="text-center"><span className="loading loading-dots loading-lg"></span></div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : Object.keys(entriesByDate).length > 0 ? (
          <div className="grid gap-4">
            {Object.entries(entriesByDate)
              .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
              .map(([date, entries]) => (
                <div key={date} className="bg-base-200/90 p-4 rounded-xl shadow space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-accent">Date: {date}</div>
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => handleViewEntries(date)}
                    >
                      <Eye className="w-4 h-4" /> View
                    </button>
                  </div>
                  <div>
                    <div className="stat-title uppercase text-sm">Employees: {entries.length}</div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center">No production time entries found</div>
        )}
      </div>
    </Wrapper>
  );
}