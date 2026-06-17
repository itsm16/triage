"use client"

import { Edit3, Inbox, LayoutDashboard, Calendar, Bot, GitBranch, FileText, Settings, Zap } from "lucide-react"

import { NavMain } from "~/components/nav-main"
import { NavProjects } from "~/components/nav-projects"
import { NavUser } from "~/components/nav-user"
import { TooltipProvider } from "~/components/ui/tooltip"
import {
  Sidebar as SidebarBase,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar"
import { useComposeStore } from "~/lib/compose-store"

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboard />,
  },
  {
    title: "Email",
    url: "/email",
    icon: <Inbox />,
    isActive: true,
    items: [
      { title: "Primary", url: "/email?tab=primary" },
      { title: "Drafts", url: "/email?tab=drafts" },
      { title: "Sent", url: "/email?tab=sent" },
      {
        title: "More",
        items: [
          { title: "All", url: "/email" },
          { title: "Updates", url: "/email?tab=updates" },
          { title: "Social", url: "/email?tab=social" },
          { title: "Promotions", url: "/email?tab=promotions" },
          { title: "Trash", url: "/email?tab=trash" },
        ],
      },
    ],
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: <Calendar />,
  },
  {
    title: "Chat",
    url: "/chat",
    icon: <Bot />,
  },
  {
    title: "Automation",
    url: "/automation",
    icon: <GitBranch />,
  },
]

const projects = [
  { name: "Templates", url: "/templates", icon: <FileText /> },
  { name: "Settings", url: "/settings", icon: <Settings /> },
]

export function Sidebar({
  session,
}: {
  session: { user: { name?: string | null; email?: string | null } } | null
}) {
  const open = useComposeStore((s) => s.open)

  return (
    <SidebarBase collapsible="icon">
      <TooltipProvider>
        <SidebarHeader>
          <div className="flex items-center gap-3 px-2 py-2">
            <img src="/logo.svg" alt="Triage" className="size-8 shrink-0" />
            <span className="text-[20px] font-medium leading-5 tracking-tight text-[#b6c4ff] group-data-[collapsible=icon]:hidden">
              Triage
            </span>
          </div>
          <button
            onClick={() => open("compose")}
            className="flex w-full items-center gap-3 rounded bg-[#0055ff] px-3 py-2 text-[#e3e6ff] transition-opacity hover:opacity-90 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
          >
            <Edit3 className="size-5 shrink-0" />
            <span className="font-mono text-xs font-medium uppercase tracking-[0.05em] group-data-[collapsible=icon]:hidden">
              Compose
            </span>
          </button>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={navMain} />
          <NavProjects projects={projects} />
        </SidebarContent>
        <SidebarFooter>
          <NavUser
            user={{
              name: session?.user?.name ?? "User",
              email: session?.user?.email ?? "",
              avatar: "",
            }}
          />
        </SidebarFooter>
        <SidebarRail />
      </TooltipProvider>
    </SidebarBase>
  )
}
