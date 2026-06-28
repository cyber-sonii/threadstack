import { getDB } from "@/db/db";
import { getCurrentUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

//get all channels (for API route)
export async function GET() {
  const db = await getDB();
  const channels = await db.all(`
    SELECT channels.*, users.display_name AS creator_name
    FROM channels
    LEFT JOIN users ON channels.created_by = users.id
    ORDER BY channels.created_at DESC
  `);
  return Response.json(channels);
}

//create new channel (for API route)
export async function POST(request) {
  const db = await getDB();
  const body = await request.json();
  const { name, description } = body;

  // Basic validation
  if (!name || !description) {
    return new Response("Missing required fields", { status: 400 });
  }

  const user = await getCurrentUser();

  const allowed = checkRateLimit(`channel:${user.id}`, 5, 60 * 1000);

  if (!allowed) {
    return Response.json(
      { error: "Too many channels created too quickly. Please wait and try again." },
      { status: 429 }
    );
  }

  if (!user) {
    return Response.json(
      { error: "You must be logged in to create a channel." },
      { status: 401 }
    );
  }

  if (name.length > 100) {
    return Response.json(
      { error: "Channel name must be 100 characters or less." },
      { status: 400 }
    );
  }

  if (description.length > 500) {
    return Response.json(
      { error: "Channel description must be 500 characters or less." },
      { status: 400 }
    );
  }

  const createdBy = user.id;

  // Insert new channel into DB
  const result = await db.run(
    `
  INSERT INTO channels (name, description, created_by)
  VALUES (?, ?, ?)
  `,
    [name, description, createdBy]
  );
  return Response.json({
    message: "Channel created successfully",
    channelId: result.lastID,
  });
}

