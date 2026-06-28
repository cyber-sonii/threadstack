import { getDB } from "@/db/db";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request) {
    try {
        const db = await getDB();
        const body = await request.json();

        const { displayName, password } = body;

        const allowed = checkRateLimit(
            `login:${displayName || email}`,
            5,
            60 * 1000
        );

        if (!allowed) {
            return Response.json(
                { error: "Too many login attempts. Please wait a minute and try again." },
                { status: 429 }
            );
        }

        // Required field validation
        if (!displayName || !password) {
            return Response.json(
                { error: "Display name and password are required." },
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

        if (password.length < 10) {
            return Response.json(
                { error: "Password must be at least 10 characters long." },
                { status: 400 }
            );
        }

        // Find user by display name
        const user = await db.get(
            `
            SELECT * FROM users
            WHERE display_name = ?
            `,
            [displayName]
        );

        // Check username
        if (!user) {
            return Response.json(
                { error: "Invalid display name or password." },
                { status: 401 }
            );
        }

        // Check password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return Response.json(
                { error: "Invalid display name or password." },
                { status: 401 }
            );
        };

        // Set cookie session
        const cookieStore = await cookies();

        cookieStore.set(
            "threadstack_user",
            JSON.stringify({
                id: user.id,
                displayName: user.display_name,
                role: user.role,
            }),
            {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                path: "/",
                maxAge: 60 * 60 * 24 * 7, // 7 days
            }
        );

        return Response.json(
            { message: "Login successful." },
            { status: 200 }
        );

    } catch (error) {
        console.error("POST /api/login error:", error);

        return Response.json(
            { error: "Login failed due to a server error." },
            { status: 500 }
        );
    }

}


