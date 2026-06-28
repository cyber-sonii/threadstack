import { getDB } from "@/db/db";
import { getCurrentUser } from "@/lib/auth";
import DeleteButton from "@/app/components/DeleteButton";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const user = await getCurrentUser();

  // hard block for non-admins
  // this page should only be visible to admin.
  if (!user || user.role !== "admin") {
    redirect("/");
  }

  const db = await getDB();

  const users = await db.all(`
    SELECT
      users.id,
      users.display_name,
      users.email,
      users.role,
      COUNT(DISTINCT posts.id) AS post_count,
      COUNT(DISTINCT replies.id) AS reply_count,
      COUNT(DISTINCT channels.id) AS channel_count
    FROM users
    LEFT JOIN posts ON posts.author_id = users.id
    LEFT JOIN replies ON replies.author_id = users.id
    LEFT JOIN channels ON channels.created_by = users.id
    GROUP BY users.id
    ORDER BY users.display_name ASC
  `);

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin: Users</h1>

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="space-y-4">
          {users.map((u) => (
            <div key={u.id} className="bg-white p-4 rounded shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{u.display_name}</h2>
                  <p className="text-sm text-gray-600">{u.email}</p>
                  <p className="text-sm text-gray-600">Role: {u.role}</p>
                  <p className="text-sm text-gray-600">
                    Posts: {u.post_count} | Replies: {u.reply_count} | Channels: {u.channel_count}
                  </p>
                </div>

                {/* admin delete control for user */}
                {/* there is no profile page, so this dedicated admin page is the cleanest place for user deletion. */}
                {String(u.id) !== String(user.id) && (
                  <DeleteButton
                    endpoint={`/api/users/${u.id}`}
                    label="User"
                    redirect="/admin/users"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}