"use client";

import { useRouter} from "next/navigation";

export default function LogOutButton() {
    const router = useRouter();

    async function handleLogout() {
        await fetch("/api/logout", {
            method: "POST",
        });

        router.push("/");
        router.refresh();
    }

    return (
        <button
            onClick={handleLogout}
            className="hover:underline"
        >
            Log Out
        </button>
    );
}