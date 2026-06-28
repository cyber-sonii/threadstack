import { getDB } from "@/db/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        { error: "You must be logged in to vote." },
        { status: 401 }
      );
    }

    const db = await getDB();
    const body = await request.json();

    const { targetType, targetId, value } = body;

    if (!targetType || !targetId || ![1, 0, -1].includes(value)) {
      return Response.json(
        { error: "Invalid vote request." },
        { status: 400 }
      );
    }

    if (!["post", "reply"].includes(targetType)) {
      return Response.json(
        { error: "Vote target must be post or reply." },
        { status: 400 }
      );
    }

    // Find content owner so authors cannot vote on themselves
    let target;

    if (targetType === "post") {
      target = await db.get(
        `SELECT id, author_id FROM posts WHERE id = ?`,
        [targetId]
      );
    } else {
      target = await db.get(
        `SELECT id, author_id FROM replies WHERE id = ?`,
        [targetId]
      );
    }

    if (!target) {
      return Response.json(
        { error: "Target not found." },
        { status: 404 }
      );
    }

    if (target.author_id === user.id) {
      return Response.json(
        { error: "You cannot vote on your own content." },
        { status: 403 }
      );
    }

    const existingVote = await db.get(
      `
      SELECT * FROM votes
      WHERE user_id = ? AND target_type = ? AND target_id = ?
      `,
      [user.id, targetType, targetId]
    );

    // Neutral = remove vote
    if (value === 0) {
      if (existingVote) {
        await db.run(
          `
          DELETE FROM votes
          WHERE user_id = ? AND target_type = ? AND target_id = ?
          `,
          [user.id, targetType, targetId]
        );
      }

      return Response.json({ message: "Vote removed." });
    }

    // Change existing vote
    if (existingVote) {
      await db.run(
        `
        UPDATE votes
        SET value = ?
        WHERE user_id = ? AND target_type = ? AND target_id = ?
        `,
        [value, user.id, targetType, targetId]
      );

      return Response.json({ message: "Vote updated." });
    }

    // New vote
    await db.run(
      `
      INSERT INTO votes (user_id, target_type, target_id, value)
      VALUES (?, ?, ?, ?)
      `,
      [user.id, targetType, targetId, value]
    );

    return Response.json({ message: "Vote added." });
  } catch (error) {
    console.error("POST /api/votes error:", error);

    return Response.json(
      { error: "Failed to process vote." },
      { status: 500 }
    );
  }
}