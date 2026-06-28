import { getDB } from "@/db/db";
import { getCurrentUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  try {
    const user = await getCurrentUser();

    const allowed = checkRateLimit(`reply:${user.id}`, 15, 60 * 1000);

    if (!allowed) {
      return Response.json(
        { error: "Too many replies posted too quickly. Please wait and try again." },
        { status: 429 }
      );
    }

    if (!user) {
      return Response.json(
        { error: "You must be logged in to reply." },
        { status: 401 }
      );
    }

    const db = await getDB();
    const requestBody = await request.json();

    // parentReplyId added
    // nested replies need to know which reply they belong under.
    const { postId, parentReplyId = null, body } = requestBody;

    if (!postId || !body) {
      return Response.json(
        { error: "Post ID and reply body are required." },
        { status: 400 }
      );
    }

    if (body.length > 2000) {
      return Response.json(
        { error: "Reply must be 2000 characters or less." },
        { status: 400 }
      );
    }

    const authorId = user.id;

    await db.run(
      `
      INSERT INTO replies (post_id, parent_reply_id, author_id, body)
      VALUES (?, ?, ?, ?)
      `,
      [postId, parentReplyId, authorId, body]
    );

    return Response.json({ message: "Reply created successfully." });
  } catch (error) {
    console.error("POST /api/replies error:", error);

    return Response.json(
      { error: "Failed to create reply." },
      { status: 500 }
    );
  }
}