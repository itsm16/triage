import { redirect } from "next/navigation"

import { Sidebar } from "~/components/sidebar"
import { getSession } from "~/server/better-auth/server"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session?.user) {
    redirect("/sign-in")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#121317]">
      <Sidebar session={session} />
      <main className="flex flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}
