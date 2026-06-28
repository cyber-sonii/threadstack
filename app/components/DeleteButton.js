"use client";

import { useRouter } from "next/navigation";

export default function DeleteButton({ endpoint, label = "Delete", redirect = null, }) {
  const router = useRouter();

  async function handleDelete() {
    const confirmed = window.confirm(`Are you sure you want to delete this ${label.toLowerCase()}?`);

    if (!confirmed) return;

    const res = await fetch(endpoint, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || `Failed to delete ${label.toLowerCase()}.`);
      return;
    }

    if (redirect) {
      router.push(redirect);
      router.refresh();
      return;
    }

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="text-red-600 text-sm font-medium hover:underline"
    >
      Delete {label}
    </button>
  );
}