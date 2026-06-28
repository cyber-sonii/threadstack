"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
    const router = useRouter();

    const [displayName, setDisplayName] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        setError("");
        setSuccess("");

        // required-field validation
        if (!displayName || !password) {
            setError("Please fill in all fields.");
            return;
        }

        if (displayName.length > 15) {
            setError("Display name must be 15 characters or less.");
            return;
        }

        if (password.length < 10) {
            setError("Password must be at least 10 characters long.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    displayName,
                    password,
                }),
            });

            let data = {};
            try {
                data = await res.json();
            } catch (err) {
                data = { error: "Server returned an invalid response." };
            }

            if (!res.ok) {
                setError(data.error || "Login failed.");
                setLoading(false);
                return;
            }

            setSuccess("Login successful! Redirecting...");

            // REMOVED localStorage user storage
            // if you are using cookie-based auth, the server should handle the session.
            // The frontend should not treat localStorage as the source of truth for auth.

            // redirect to home page
            // your project uses "/" as the landing page, not "/landing-page".
            setTimeout(() => {
                router.push("/");
                router.refresh();
            }, 800);
        } catch (err) {
            setError("Something went wrong. Please try again.");
        }

        setLoading(false);
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
                <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium mb-1">UserName</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            maxLength={15}
                            className="w-full border rounded p-2"
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border rounded p-2"
                            placeholder="Enter password"
                            required
                        />
                        {/* password helper text */}
                        {/* makes the password rule visible to the user before submission. */}
                        <p className="text-xs text-gray-500 mt-1">
                            Password must be at least 10 characters.
                        </p>
                    </div>

                    {error && (
                        <p className="text-red-600 text-sm text-center">{error}</p>
                    )}

                    {success && (
                        <p className="text-green-600 text-sm text-center">{success}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {/* loading text */}
                        {/* gives feedback while the request is in progress. */}
                        {loading ? "logging in..." : "Login"}
                    </button>

                </form>
            </div>
        </main>
    )
}    