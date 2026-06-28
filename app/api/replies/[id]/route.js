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
    await db.run(
      `
      DELETE FROM replies
      WHERE id = ?
      `,
      [id]
    );

    return Response.json({ message: "Reply deleted successfully." });
  } catch (error) {
    console.error("DELETE /api/replies/[id] error:", error);

    return Response.json(
      { error: "Failed to delete reply." },
      { status: 500 }
    );
  }
}