import { getDB } from "@/db/db";
import Link from "next/link";
import CreatePostForm from "@/app/components/CreatePostForm";
import DeleteButton from "@/app/components/DeleteButton";
import { getCurrentUser } from "@/lib/auth";

// Single channel page
export default async function ChannelsPage({ params }) {
    const db = await getDB();
    const user = await getCurrentUser();
    const isAdmin = user?.role === "admin";


    // In newer Next.js versions, params should be awaited
    const { id: channelId } = await params;

    // Get this specific channel and the creator name
    const channel = await db.get(
        `
    SELECT channels.*, users.display_name AS creator_name
    FROM channels
    LEFT JOIN users ON channels.created_by = users.id
    WHERE channels.id = ?
    `,
        [channelId]
    );

    // Get all posts that belong to this channel
    const posts = await db.all(
        `
    SELECT posts.*, users.display_name AS author_name
    FROM posts
    LEFT JOIN users ON posts.author_id = users.id
    WHERE posts.channel_id = ?
    ORDER BY posts.created_at DESC
    `,
        [channelId]
    );

    // If channel doesn't exist
    if (!channel) {
        return (
            <main className="p-6">
                <h1 className="text-3xl font-bold mb-4">Channel Not Found</h1>
                <p>The channel you are looking for does not exist.</p>
            </main>
        );
    }

    return (
        <main className="p-6">
            {/* Channel info */}
            <h1 className="text-3xl font-bold mb-2">{channel.name}</h1>

            {isAdmin && (
                <div className="mb-4 flex justify-end">
                    <DeleteButton
                    endpoint={`/api/channels/${channel.id}`}
                    label="Channel"
                    redirect="/channels"
                    />
                </div>
            )}

            <p className="text-sm mb-4">{channel.description}</p>
            <p className="text-sm mb-4">
                Created by: {channel.creator_name} on {channel.created_at}
            </p>

            {/* Create post form */}
            <div className="mb-8 flex justify-end">
                {user ? (
                    <CreatePostForm channelId={channelId} />
                ) : (
                    <h3 className="text-xl text-gray-600">Log in to create a post.</h3>
                )}
            </div>

            {/* Posts section */}
            <section className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Posts</h2>

                {posts.length === 0 ? (
                    <p>No posts in this channel yet.</p>
                ) : (
                    <div className="space-y-6">
                        {posts.map((post) => (
                            <Link key={post.id} href={`/posts/${post.id}`}>
                                <div className=" p-4 rounded bg-white shadow hover:bg-gray-100 cursor-pointer">
                                    <h3 className="text-xl font-semibold">{post.title}</h3>
                                    <p className="mt-2">{post.body}</p>
                                    <p className="text-sm mt-2">Author: {post.author_name}</p>
                                    <p className="text-sm">Created at: {post.created_at}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

        </main>
    );
}