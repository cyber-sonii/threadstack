import { getCurrentUser } from "@/lib/auth";

//landing page for the app
export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="p-6">
      <div className="flex flex-col items-center justify-center gap-2 mt-50">
        <h1 className="text-3xl font-bold">TreadStack</h1>

        <div className="mb-8 flex justify-end">
          {user ? (
            <h2 className="text-xl text-gray-800">Hello!, {user.displayName}</h2>
          ) : (
            <h2 className="text-xl text-gray-800">Hello!</h2>
          )}
        </div>

        

        <p className="mb-1">Welcome to ThreadStack!, where you view channels, create posts and discuss with other users on the platfrom.</p>
      </div>
    </main>
  )
}