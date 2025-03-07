"use client";

import { useState } from "react";

interface UserRowProps {
  user: { id: string; name: string; email: string; role: string };
  onDelete: (userId: string) => Promise<{ success: boolean; error?: string } | undefined>;
}

export function UserRow({ user, onDelete }: UserRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setIsDeleting(true);
      setError(null);
      try {
        const result = await onDelete(user.id);
        if (!result?.success) {
          throw new Error(result?.error || "Failed to delete user");
        }
        // Success case - no action needed, redirect handled by server
      } catch (err) {
        console.error("Error deleting user:", err);
        setError("Failed to delete user. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <tr>
      <td className="border p-2">{user.name}</td>
      <td className="border p-2">{user.email}</td>
      <td className="border p-2">{user.role}</td>
      <td className="border p-2">
        {error && <span className="text-red-500 mr-2">{error}</span>}
        <button
          type="button"
          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 disabled:bg-gray-400"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </td>
    </tr>
  );
}