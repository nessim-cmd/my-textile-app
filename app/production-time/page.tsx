"use client";

import Wrapper from '@/components/Wrapper';
import { useAuth } from '@clerk/nextjs';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import * as Dialog from '@radix-ui/react-dialog';

interface Employee {
  id: string;
  name: string;
  poste: string;
}

export default function ProductionTimePage() {
  const { getToken } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', poste: '' });
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/employee', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch employees');
      const data = await res.json();
      const employeeList = Array.isArray(data) ? data : [];
      console.log('Fetched employees:', employeeList);
      setEmployees(employeeList);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      console.error('Fetch employees error:', errorMsg);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    console.log('useEffect triggered');
    fetchEmployees();
  }, [fetchEmployees]);

  const handleCreateEmployee = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newEmployee),
      });
      if (!res.ok) throw new Error('Failed to create employee');
      await fetchEmployees();
      setIsCreateModalOpen(false);
      setNewEmployee({ name: '', poste: '' });
      toast.success('Employee created successfully!');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      toast.error('Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmployee = async () => {
    if (!editEmployee) return;
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/employee', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editEmployee),
      });
      if (!res.ok) throw new Error('Failed to update employee');
      await fetchEmployees();
      setIsEditModalOpen(false);
      setEditEmployee(null);
      toast.success('Employee updated successfully!');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      toast.error('Failed to update employee');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/employee', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete employee');
      await fetchEmployees();
      toast.success('Employee deleted successfully!');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      toast.error('Failed to delete employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
        <Toaster />
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Production Time - Employees</h1>
        <Dialog.Root open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <Dialog.Trigger asChild>
            <button className="btn btn-primary mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" /> Add Employee
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md">
              <Dialog.Title className="font-bold text-lg mb-4">Add New Employee</Dialog.Title>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Name"
                  className="input input-bordered w-full"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Poste"
                  className="input input-bordered w-full"
                  value={newEmployee.poste}
                  onChange={(e) => setNewEmployee({ ...newEmployee, poste: e.target.value })}
                />
                <button className="btn btn-primary w-full" onClick={handleCreateEmployee} disabled={loading}>
                  {loading ? <span className="loading loading-spinner"></span> : 'Create'}
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {loading ? (
          <div className="text-center"><span className="loading loading-dots loading-lg"></span></div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : employees.length > 0 ? (
          <table className="table w-full">
            <thead>
              <tr className="bg-gray-200">
                <th>Name</th>
                <th>Poste</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees
                .slice() // Create a copy to avoid mutating original array
                .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically by name
                .map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.name}</td>
                    <td>{employee.poste}</td>
                    <td>
                      <button
                        className="btn btn-info btn-sm mr-2"
                        onClick={() => {
                          setEditEmployee(employee);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="btn btn-error btn-sm"
                        onClick={() => handleDeleteEmployee(employee.id)}
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center">No employees found</div>
        )}

        <Dialog.Root open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md">
              <Dialog.Title className="font-bold text-lg mb-4">Edit Employee</Dialog.Title>
              {editEmployee && (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Name"
                    className="input input-bordered w-full"
                    value={editEmployee.name}
                    onChange={(e) => setEditEmployee({ ...editEmployee, name: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Poste"
                    className="input input-bordered w-full"
                    value={editEmployee.poste}
                    onChange={(e) => setEditEmployee({ ...editEmployee, poste: e.target.value })}
                  />
                  <button className="btn btn-primary w-full" onClick={handleUpdateEmployee} disabled={loading}>
                    {loading ? <span className="loading loading-spinner"></span> : 'Update'}
                  </button>
                </div>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </Wrapper>
  );
}