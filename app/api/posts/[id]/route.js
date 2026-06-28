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
        // delete attachments linked to the post
        await db.run(
            `
            DELETE FROM attachments
            WHERE target_type = 'post' AND target_id = ?
            `,
            [id]
        );

        // delete replies linked to the post
        await db.run(
            `
            DELETE FROM replies
            WHERE post_id = ?
            `,
            [id]
        );

        // delete the post
        await db.run(
            `
            DELETE FROM posts
            WHERE id = ?
            `,
            [id]
        );

        return Response.json({ message: "Post deleted successfully." });
    }   catch (error) {
        console.error("DELETE /api/posts/[id] error:", error);

        return Response.json(
            { error: "Failed to delete post." },
            { status: 500 }
        );
    }
}