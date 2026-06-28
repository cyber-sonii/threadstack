"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReplyForm({
    postId,
    parentReplyId = null,
    placeholder = "Write your reply here...",
    buttonLabel = "Post Reply",
    onSuccess = null,
}) {
    const router = useRouter();

    const [body, setBody] = useState('');
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setError(""); // Clear any previous errors

        const res = await fetch('/api/replies', {
            method: 'POST',
            headers: { "Content-Type": "application/json", },
            body: JSON.stringify({ postId, parentReplyId, body }),
        });

        const data = await res.json();

        if (!res.ok) {
            setError(data.error || "An error occurred");
            return;
        }

        //clear form
        setBody("");

        if (onSuccess) {
            onSuccess();
        }
        //refresh to show new reply.
        router.refresh();
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-4 max-w-md p-6 bg-white rounded shadow space-y-4">
            <h2 className="text-xl font-bold">Reply</h2>
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div>
                <label className="block text-sm font-medium mb-1">Your Reply</label>
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    maxLength={1000}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder={placeholder}
                />
            </div>

            <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                {buttonLabel}
            </button>
        </form>    
    )
}