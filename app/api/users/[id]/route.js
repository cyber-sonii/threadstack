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
    // prevent admin from deleting themselves accidentally
    // avoids locking yourself out of admin controls during marking/testing.
    if (String(adminCheck.user.id) === String(id)) {
      return Response.json(
        { error: "You cannot delete your own admin account." },
        { status: 400 }
      );
    }

    // Get posts by this user
    const userPosts = await db.all(
      `
      SELECT id FROM posts
      WHERE author_id = ?
      `,
      [id]
    );

    // Delete attachments + replies attached to this user's posts
    for (const post of userPosts) {
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

      await db.run(
        `
        DELETE FROM votes
        WHERE target_type = 'post' AND target_id = ?
        `,
        [post.id]
      );
    }

    // Delete user's direct replies
    await db.run(
      `
      DELETE FROM votes
      WHERE target_type = 'reply'
      AND target_id IN (
        SELECT id FROM replies WHERE author_id = ?
      )
      `,
      [id]
    );

    await db.run(
      `
      DELETE FROM replies
      WHERE author_id = ?
      `,
      [id]
    );

    // Delete votes cast by this user
    await db.run(
      `
      DELETE FROM votes
      WHERE user_id = ?
      `,
      [id]
    );

    // Delete posts created by this user
    await db.run(
      `
      DELETE FROM posts
      WHERE author_id = ?
      `,
      [id]
    );

    // Delete channels created by this user
    // NOTE: if you want channels to remain even after user deletion, remove this block.
    const userChannels = await db.all(
      `
      SELECT id FROM channels
      WHERE created_by = ?
      `,
      [id]
    );

    for (const channel of userChannels) {
      const postsInChannel = await db.all(
        `
        SELECT id FROM posts
        WHERE channel_id = ?
        `,
        [channel.id]
      );

      for (const post of postsInChannel) {
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

        await db.run(
          `
          DELETE FROM votes
          WHERE target_type = 'post' AND target_id = ?
          `,
          [post.id]
        );
      }

      await db.run(
        `
        DELETE FROM posts
        WHERE channel_id = ?
        `,
        [channel.id]
      );

      await db.run(
        `
        DELETE FROM channels
        WHERE id = ?
        `,
        [channel.id]
      );
    }

    // Finally delete the user
    await db.run(
      `
      DELETE FROM users
      WHERE id = ?
      `,
      [id]
    );

    return Response.json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("DELETE /api/users/[id] error:", error);

    return Response.json(
      { error: "Failed to delete user." },
      { status: 500 }
    );
  }
}