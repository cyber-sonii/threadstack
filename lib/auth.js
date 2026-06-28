import { cookies } from "next/headers";

// Read the current logged-in user from the cookie
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("threadstack_user");

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "You must be logged in.", status: 401 };
  }

  if (user.role !== "admin") {
    return { error: "Admin access required.", status: 403 };
  }

  return { user };
}