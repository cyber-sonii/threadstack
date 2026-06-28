"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateChannelForm() {
    const router = useRouter();

    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const res = await fetch("/api/channels", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description }),
        });

        const data = await res.json();

        if (res.ok) {
            router.push("/channels");
        } else {
            setError(data.message);
        }
        // Redirect to the new channel page
        router.push(`/channels/${data.channelId}`);
    }

    return (
        <div className="mb-6">
            <div className="flex justify-end">
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                    {showForm ? "Close Form" : "Create Channel"}
                </button>
            </div>
            {showForm && (
                <form onSubmit={handleSubmit}
                    className="mt-4 max-w-md p-6 bg-white rounded shadow space-y-4">
                    <h2 className="text-xl font-bold">Create Channel</h2>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div>
                        <label className="block text-sm font-medium md-1">Channel Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border rounded p-2"
                            placeholder="Enter Channel Name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full border rounded p-2"
                            placeholder="Enter Channel Description"
                            row="4"
                            required
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Create Channel
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );

}
