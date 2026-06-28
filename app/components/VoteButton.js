"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export default function VoteButtons({
  targetType,
  targetId,
  initialScore,
  initialUserVote = 0,
  canVote = true,
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitVote(value) {
    if (!canVote) {
      setError("Log in or Signup to vote.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/votes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        targetType,
        targetId,
        value,
      }),
    });

    let data = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      setError(data.error || "Vote failed.");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <button
        type="button"
        disabled={loading}
        onClick={() => submitVote(initialUserVote === 1 ? 0 : 1)}
        className={`px-2 py-1 rounded border ${
          initialUserVote === 1 ? "bg-green-100 border-green-500" : "bg-white"
        }`}
      >
        <ThumbsUp size={20} />
      </button>

      <span className="text-sm font-medium">{initialScore}</span>

      <button
        type="button"
        disabled={loading}
        onClick={() => submitVote(initialUserVote === -1 ? 0 : -1)}
        className={`px-2 py-1 rounded border ${
          initialUserVote === -1 ? "bg-red-100 border-red-500" : "bg-white"
        }`}
      >
        <ThumbsDown size={20} />
      </button>

      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}