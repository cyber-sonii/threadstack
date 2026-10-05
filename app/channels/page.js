// page that has all the channels on the platform
import Link from "next/link";
import { getDB } from "@/db/db";
import CreateChannelForm from "../components/CreateChannelForm";
import { getCurrentUser } from "@/lib/auth";
import DeleteButton from "../components/DeleteButton";


export default async function ChannelsPage() {// This is a SERVER component (runs on the server, not browser)
    const db = await getDB();  // Open connection to the database
    const user = await getCurrentUser(); // Get the currently logged in user (if any)
    const isAdmin = user?.role === "admin"; // Check if the user is an admin (for conditional rendering of admin features)

    // Get all channels + the creator's name using a JOIN
    const channels = await db.all(`
        SELECT channels.*, users.display_name AS creator_name
        FROM channels
        LEFT JOIN users ON channels.created_by = users.id
        ORDER BY channels.created_at DESC
    `);

    return (
        <main className="p-6">
            <h1 className="text-3xl font-bold mb-4">Channels</h1> {/* Page title */}

            <div className="mb-8 flex justify-end">
                {user ? (
                    <CreateChannelForm />
                ) : (
                    <h3 className="text-xl text-gray-600">
                        <Link href="/login" className="text-blue-600 underline" >
                            Login
                        </Link>{" "} 
                        to create a channel.
                    </h3>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Loop through each channel and render it */}
                {channels.map(channel => (
                    <Link key={channel.id} href={`/channels/${channel.id}`} className="block">
                        <div className="p-4 rounded bg-gray shadow hover:bg-gray-100 cursor-pointer"> {/* Channel card */}
                            <h2 className="text-xl font-semibold">{channel.name}</h2>
                            <p className="text-sm mt-1">{channel.description}</p>
                            <p className="text-sm mt-2">Created by: {channel.creator_name}</p>
                            <p className="text-sm">Created at: {channel.created_at}</p>
                        </div>
                    </Link>
                ))}
            </div>


        </main>
    );
}