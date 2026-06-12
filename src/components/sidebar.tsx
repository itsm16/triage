"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Bot,
  Ellipsis,
  GitBranch,
  Inbox,
  LayoutDashboard,
  LogOut,
  Settings,
  Zap,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { authClient } from "~/server/better-auth/client"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/email", icon: Inbox, label: "Email", badge: "12" },
  { href: "/chat", icon: Bot, label: "Chat" },
  { href: "/automation", icon: GitBranch, label: "Automation" },
]

export function Sidebar({ session }: { session: { user: { name?: string | null; email?: string | null } } | null }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await authClient.signOut()
    router.push("/sign-in")
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-[#434656]/20 bg-[#121317] px-4 py-4">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex size-8 items-center justify-center rounded bg-[#0055ff]">
          <Zap className="text-[#e3e6ff]" size={20} />
        </div>
        <div className="flex flex-col cursor-pointer">
          <span className="text-[20px] font-medium leading-5 tracking-tight text-[#b6c4ff]">
            Triage
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center px-3 py-2 text-sm transition-colors duration-150 ${
                active
                  ? "border-r-2 border-[#b6c4ff] bg-[#292a2e] font-bold text-[#b6c4ff]"
                  : "text-[#c3c5d9] hover:bg-[#292a2e] hover:text-[#c3c5d9]"
              }`}
            >
              <item.icon className="mr-3 size-5" />
              <span className="font-mono text-xs font-medium uppercase tracking-[0.05em]">
                {item.label}
              </span>
              {item.badge && (
                <span className="ml-auto rounded bg-[#b6c4ff]/10 px-1.5 font-mono text-[10px] text-[#b6c4ff]">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}

        {/* <div className="px-3 pb-2 pt-8">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#8d90a2]">
            Tags
          </span>
        </div>
        {[
          { label: "Follow-ups", color: "bg-blue-500" },
          { label: "Urgent", color: "bg-emerald-500" },
        ].map((tag) => (
          <div
            key={tag.label}
            className="group flex cursor-pointer items-center px-3 py-2 text-[#c3c5d9] transition-colors duration-150 hover:bg-[#292a2e]"
          >
            <span className={`mr-4 size-2 rounded-full ${tag.color}`} />
            <span className="font-mono text-xs font-medium uppercase tracking-[0.05em]">
              {tag.label}
            </span>
          </div>
        ))} */}
      </nav>

      <div className="mt-auto border-t border-[#434656]/10 pt-4">
        {[
          { href: "#", icon: Settings, label: "Settings" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="group flex items-center gap-4 px-3 py-2 text-[#c3c5d9] transition-colors duration-150 hover:bg-[#292a2e]"
          >
            <item.icon className="size-5" />
            <span className="font-mono text-xs font-medium uppercase tracking-[0.05em]">
              {item.label}
            </span>
          </Link>
        ))}
        <div className="mt-4 flex items-center gap-3 px-3">
          <div className="flex size-8 items-center justify-center rounded-full border border-[#434656]/20 bg-[#343539] text-xs font-bold text-[#c3c5d9]">
            {session?.user?.name
              ? session.user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
              : "U"}
          </div>
          <div className="flex flex-1 flex-col">
            <span className="font-mono text-xs font-bold text-[#e3e2e7]">
              {session?.user?.name ?? "User"}
            </span>
            <span className="font-mono text-[10px] text-[#8d90a2]">
              {session?.user?.email ?? "Signed out"}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center rounded p-1 text-[#c3c5d9] transition-colors hover:bg-[#292a2e]">
                <Ellipsis className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={4}>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  )
}
