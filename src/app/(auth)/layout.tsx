import Image from "next/image"
import { redirect } from "next/navigation"
import { DropletField } from "~/components/droplet-field"
import { getSession } from "~/server/better-auth/server"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (session?.user) redirect("/dashboard")

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="relative hidden overflow-hidden md:block">
        <DropletField />
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#0055ff]">
              <Image src="/logo.svg" alt="Triage" width={32} height={32} className="size-8" />
            </div>
            <span className="text-2xl font-bold text-white">Triage</span>
          </div>
          <h2 className="mb-4 text-4xl font-bold leading-tight text-white">
            Your inbox.<br />Under command.
          </h2>
          <p className="max-w-md text-lg text-[#c3c5d9]">
            AI-native control system for professionals who live in their inbox and calendar.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-[#121317] px-4">
        {children}
      </div>
    </div>
  )
}
