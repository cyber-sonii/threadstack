"use client";

import { useState } from "react";
import Link from "next/link";

export default function SearchPage() {
  const [type, setType] = useState("keyword");
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runSearch(reset = true) {
    setLoading(true);
    setError("");

    const nextOffset = reset ? 0 : offset;

    const params = new URLSearchParams({
      type,
      q,
      offset: String(nextOffset),
      limit: "10",
    });

    try {
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Search failed.");
        setLoading(false);
        return;
      }

      if (reset) {
        setResults(data.results);
        setOffset(10);
      } else {
        setResults((prev) => [...prev, ...data.results]);
        setOffset((prev) => prev + 10);
      }
    } catch (err) {
      setError("Something went wrong while searching.");
    }

    setLoading(false);
  }

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Search</h1>

      <div className="bg-white p-4 rounded shadow-sm space-y-4 mb-6">
        {/* Query type selector */}
        {/* WHY: project requires multiple measurable query types */}
        <div>
          <label className="block text-sm font-medium mb-1">Search Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="keyword">Keyword Search</option>
            <option value="author">Content by Author</option>
            <option value="most-posts">User with Most Posts</option>
            <option value="least-posts">User with Least Posts</option>
            <option value="highest-ranked">Highest Ranked Posts</option>
            <option value="lowest-ranked">Lowest Ranked Posts</option>
          </select>
        </div>

        {/* Search box only needed for keyword and author search */}
        {/* WHY: aggregate modes like highest-ranked do not need text input */}
        {(type === "keyword" || type === "author") && (
          <div>
            <label className="block text-sm font-medium mb-1">
              {type === "keyword" ? "Keyword" : "Author Name"}
            </label>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full border rounded p-2"
              placeholder={
                type === "keyword"
                  ? "Search channels, posts, and users..."
                  : "Enter author name..."
              }
            />
          </div>
        )}

        <button
          type="button"
          onClick={() => runSearch(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading && <p className="text-gray-600 mb-4">Loading...</p>}

      {!loading && results.length === 0 && (
        <p className="text-gray-600">No results found.</p>
      )}

      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className="bg-white p-4 rounded shadow-sm">
            {/* Keyword / Author search results */}
            {"result_type" in result ? (
              <>
                <p className="text-xs uppercase text-gray-500 mb-1">
                  {result.result_type}
                </p>

                <h2 className="text-xl font-semibold mb-1">{result.title}</h2>

                {/* ADDED: result context */}
                {/* WHY: project requires context to be shown with search results */}
                <p className="text-sm text-gray-600 mb-2">
                  {result.author_name ? `Author: ${result.author_name}` : ""}
                  {result.channel_name ? ` | Channel: ${result.channel_name}` : ""}
                </p>

                {result.snippet && <p className="mb-3">{result.snippet}</p>}

                {/* ADDED: content links */}
                {/* WHY: project requires results to link back to content */}
                {result.result_type === "channel" && (
                  <Link
                    href={`/channels/${result.item_id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Open Channel
                  </Link>
                )}

                {result.result_type === "post" && (
                  <Link
                    href={`/posts/${result.item_id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View Post
                  </Link>
                )}

                {result.result_type === "user" && (
                  <span className="text-sm text-gray-500">
                    Matching user
                  </span>
                )}
              </>
            ) : (
              <>
                {/* Most/least posts result cards */}
                <h2 className="text-xl font-semibold">{result.title}</h2>
                <p className="text-sm text-gray-600">
                  Post count: {result.count}
                </p>
              </>
            )}

            {"score" in result && (
              <p className="text-sm text-gray-600 mt-2">
                Score: {result.score}
              </p>
            )}
          </div>
        ))}
      </div>

      {results.length > 0 && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => runSearch(false)}
            className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Load More
          </button>
        </div>
      )}
    </main>
  );
}