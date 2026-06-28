"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Signup() {
    const router = useRouter();

    const [displayName, setDisplayName] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        setError("");
        setSuccess("");

        // required-field validation
        if (!displayName || !email || !password) {
            setError("Please fill in all fields.");
            return;
        }

        // ADDED: basic length validation for displayName, email, and password
        if (displayName.length > 15) {
            setError("Display name must be 15 characters or less.");
            return;
        }

        if (email.length > 255) {
            setError("Email must be 255 characters or less.");
            return;
        }

        if (password.length < 10) {
            setError("Password must be at least 10 characters long.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },

                // send displayName instead of username
                // this should match the users table and the signup API route for this project.
                body: JSON.stringify({
                    displayName,
                    email,
                    password,
                }),
            });

            let data = {};

            // safe JSON parsing
            // to prevent the page from crashing if the server returns a broken response.
            try {
                data = await res.json();
            } catch (err) {
                data = { error: "Server returned an invalid response." };
            }

            if (!res.ok) {
                setError(data.error || "Signup failed.");
                setLoading(false);
                return;
            }

            setSuccess("Account created successfully.");

            // redirect to login page instead of /check-email
            // this current project does not use an email verification flow.
            setTimeout(() => {
                router.push("/login");
            }, 800);
        } catch (err) {
            setError("Something went wrong. Please try again.");
        }

        setLoading(false);
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
                <h1 className="text-2xl font-bold text-center mb-6">Sign Up</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* label + maxLength */}
                    {/* improves accessibility and supports validation requirements. */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Display Name
                        </label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            maxLength={15}
                            className="w-full border rounded p-2"
                            placeholder="Enter display name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            maxLength={255}
                            className="w-full border rounded p-2"
                            placeholder="Enter email"
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
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-4">
                    Already have an account?{" "}
                    <Link href="/login" className="underline font-semibold">
                        Log in
                    </Link>
                </p>
            </div>
        </main>
    );
}