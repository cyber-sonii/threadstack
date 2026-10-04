import { getDB } from "@/db/db";
import { getCurrentUser } from "@/lib/auth";
import fs from "fs";
import path from "path";
import { checkRateLimit } from "@/lib/rateLimit";

//create a new post in a channel (for API route)
export async function POST(request) {
    const db = await getDB();
    const formData = await request.formData();
    const maxSize = 5 * 1024 * 1024; // 5 MB

    const channelId = formData.get("channelId");
    const title = formData.get("title");
    const body = formData.get("body");
    const screenshots = formData.getAll("screenshots");

    // Basic validation
    if (!channelId || !title || !body) {
        return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await getCurrentUser();

    if (!user) {
        return Response.json(
            { error: "You must be logged in to create a post." },
            { status: 401 }
        );
    }

    const allowed = checkRateLimit(`post:${user.id}`, 10, 60 * 1000);

    if (!allowed) {
        return Response.json(
            { error: "Too many posts created too quickly. Please wait and try again." },
            { status: 429 }
        );
    }

    if (!user) {
        return Response.json(
            { error: "You must be logged in to create a channel." },
            { status: 401 }
        );
    }

    if (title.length > 150) {
        return Response.json(
            { error: "Post title must be 150 characters or less." },
            { status: 400 }
        );
    }

    if (body.length > 5000) {
        return Response.json(
            { error: "Post body must be 5000 characters or less." },
            { status: 400 }
        );
    }

    const createdBy = user.id;
    const authorId = createdBy;

    const result = await db.run(
        `
    INSERT INTO posts (channel_id, author_id, title, body)
    VALUES (?, ?, ?, ?)
  `,
        [channelId, authorId, title, body]
    );
    const postId = result.lastID;

    const uploadsDir = path.join(process.cwd(), "uploads");


    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    for (const file of screenshots) {
        if (!file || typeof file === "string" || file.size === 0) continue;

        const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
            return Response.json(
                { error: "Invalid file type. Only PNG, JPG, JPEG, and WebP are allowed." },
                { status: 400 }
            );
        }

        if (file.size > maxSize) {
            return Response.json(
                { error: "Each screenshot must be 5 MB or less." },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uniqueFileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadsDir, uniqueFileName);
        const storedPath = `uploads/${uniqueFileName}`;

        fs.writeFileSync(filePath, buffer);

        await db.run(
            `
      INSERT INTO attachments (target_type, target_id, file_name, file_path, mime_type, size_bytes)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
            ["post", postId, file.name, storedPath, file.type, file.size]
        );
    }

    return Response.json({
        message: "Post created successfully",
        postId: result.lastID,
    });
}

