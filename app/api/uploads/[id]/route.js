import { getDB } from "@/db/db";
import fs from "fs";
import path from "path";

export async function GET(request, { params }) {
  try {
    const db = await getDB();
    const { id } = await params;

    const attachment = await db.get(
      `
      SELECT *
      FROM attachments
      WHERE id = ?
      `,
      [id]
    );

    if (!attachment) {
      return new Response("File not found.", { status: 404 });
    }

    const absolutePath = path.join(process.cwd(), attachment.file_path);

    if (!fs.existsSync(absolutePath)) {
      return new Response("Stored file is missing.", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(absolutePath);

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": attachment.mime_type || "application/octet-stream",
        "Content-Length": String(fileBuffer.length),
      },
    });
  } catch (error) {
    console.error("GET /api/uploads/[id] error:", error);

    return new Response("Failed to load file.", { status: 500 });
  }
}