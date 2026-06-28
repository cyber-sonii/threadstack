"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';


export default function CreatePostForm({ channelId }) {
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); // Clear any previous errors

    const formData = new FormData();
    formData.append("channelId", channelId);
    formData.append("title", title);
    formData.append("body", body);

    files.forEach((file) => {
      formData.append("screenshots", file);
    });

    const res = await fetch('/api/posts', {
      method: 'POST',
      body: formData,
    });

    let data = {};

    try {
      data = await res.json();
    } catch (error) {
      data = { error: "Server returned an invalid response." };
    }

    if (!res.ok) {
      setError(data.message || "An error occurred");
      return;
    }

    // refesh the page to show the new post
    router.refresh();

    //clear form
    setTitle("");
    setBody("");
    setFiles([]);
    setShowForm(false);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          {showForm ? "Close Form" : "Create Post"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 max-w-md p-6 bg-white rounded shadow space-y-4">
          <h2 className="text-xl font-bold">Create Post</h2>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <label className="block text-sm font-medium mb-1">Title:</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={150}
              className="w-full border rounded p-2"
              placeholder="Enter Post Title"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Max 100 characters.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Body: </label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={5000}
              className="w-full border rounded p-2"
              placeholder="Enter Post Body"
              rows="4"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Max 500 characters.</p>
          </div>

          {/*screenshots*/}
          <div>
            <label className="block text-sm font-medium mb-1">Screenshots</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files))}
              className="block w-full text-sm text-gray-700
               file:mr-4 file:py-2 file:px-4
               file:rounded file:border-0
               file:bg-blue-600 file:text-white
               hover:file:bg-blue-700"
            />
            <p className="text-xs text-gray-500 mt-2">
              Upload PNG, JPG, JPEG, or WebP files. You can select multiple images.
              File sizes of Max 5 MB each.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Submit Post
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