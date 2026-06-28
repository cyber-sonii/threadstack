import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "../components/LogOutButton";

//navigation bar to be shown on every page
export default async function Navbar() {
    const user = await getCurrentUser();

    return (
        <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
            {/*App name on the left side of the navbar */}
            <div className="text-1xl font-bold">
                <Link href="/">ThreadStack</Link>
            </div>

            {/*Navigation links on the right side of the navbar */}
            <div className="space-x-4">
                <Link href="/" className="hover:underline">Home</Link>
                <Link href="/channels" className="hover:underline">Channels</Link>
                <Link href="/search" className="hover:underline">Search</Link>
                {user ? (
                    <>
                        <span className="text-sm text-gray-200">
                            Hi, {user.displayName}
                        </span>
                        {user.role === "admin" && (
                            <Link href="/admin/users" className="hover:underline">
                                Manage Users
                            </Link>
                        )}
                        <LogoutButton />
                    </>
                ) : (
                    <>
                        <Link href="/login" className="hover:underline">Login</Link>
                        <Link href="/signup" className="hover:underline">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
}