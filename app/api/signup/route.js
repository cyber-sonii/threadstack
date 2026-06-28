import { getDB } from "@/db/db";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const db = await getDB();
    const body = await request.json();

    const { displayName, email, password } = body;

    // Required field validation
    if (!displayName || !email || !password) {
      return Response.json(
        { error: "Display name, email, and password are required." },
        { status: 400 }
      );
    }

    // Length validation
    if (displayName.length > 15) {
      return Response.json(
        { error: "Display name must be 15 characters or less." },
        { status: 400 }
      );
    }

    if (email.length > 255) {
      return Response.json(
        { error: "Email must be 255 characters or less." },
        { status: 400 }
      );
    }

    if (password.length < 10) {
      return Response.json(
        { error: "Password must be at least 10 characters long." },
        { status: 400 }
      );
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.get(
      `
      SELECT * FROM users
      WHERE email = ?
      `,
      [email]
    );

    if (existingUser) {
      return Response.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Hash password before storing
    const passwordHash = await bcrypt.hash(password, 10);
    //const passwordHash = password;

    // Insert new user
    const result = await db.run(
      `
      INSERT INTO users (display_name, email, password_hash, role)
      VALUES (?, ?, ?, ?)
      `,
      [displayName, email, passwordHash, "user"]
    );

    return Response.json(
      {
        message: "Account created successfully.",
        userId: result.lastID,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/signup error:", error);

    return Response.json(
      { error: "Failed to create account." },
      { status: 500 }
    );
  }
}