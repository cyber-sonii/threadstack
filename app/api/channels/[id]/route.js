import { getDB } from "@/db/db";
import { requireAdmin } from "@/lib/auth";

export async function DELETE(request, { params }) {
  const adminCheck = await requireAdmin();

  if (adminCheck.error) {
    return Response.json(
      { error: adminCheck.error },
      { status: adminCheck.status }
    );
  }

  const { id } = await params;
  const db = await getDB();

  try {
    // get all posts in the channel first
    const posts = await db.all(
      `
      SELECT id FROM posts
      WHERE channel_id = ?
      `,
      [id]
    );

    // delete attachments and replies for each post
    for (const post of posts) {
      await db.run(
        `
        DELETE FROM attachments
        WHERE target_type = 'post' AND target_id = ?
        `,
        [post.id]
      );

      await db.run(
        `
        DELETE FROM replies
        WHERE post_id = ?
        `,
        [post.id]
      );
    }

    // delete posts in channel
    await db.run(
      `
      DELETE FROM posts
      WHERE channel_id = ?
      `,
      [id]
    );

    // delete channel
    await db.run(
      `
      DELETE FROM channels
      WHERE id = ?
      `,
      [id]
    );

    return Response.json({ message: "Channel deleted successfully." });
  } catch (error) {
    console.error("DELETE /api/channels/[id] error:", error);

    return Response.json(
      { error: "Failed to delete channel." },
      { status: 500 }
    );
  }
}