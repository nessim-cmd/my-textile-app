"use client";

import { useState } from "react";

interface UserRowProps {
  user: { id: string; name: string; email: string; role: string };
  onDelete: (userId: string) => Promise<void>;
}

export function UserRow({ user, onDelete }: UserRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setIsDeleting(true);
      setError(null);
      try {
        await onDelete(user.id);
        // No need to handle success here; server redirects
      } catch (err) {
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
          // Redirect happened, no action needed
          return;
        }
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