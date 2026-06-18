"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "~/components/ui/sidebar"
import { ChevronRightIcon } from "lucide-react"

function isSubItemActive(subUrl: string, pathname: string, searchParams: URLSearchParams): boolean {
  const [subPath, qs] = subUrl.split("?")
  if (pathname !== subPath) return false
  if (!qs) return !searchParams.toString()
  const params = new URLSearchParams(qs)
  for (const [key, val] of params) {
    if (searchParams.get(key) !== val) return false
  }
  return true
}

export function NavMain({
  items,
}: {
  items: ({
    title: string
    url: string
    icon?: React.ReactNode
    isActive?: boolean
    items?: (
      | { title: string; url: string }
      | { title: string; items: { title: string; url: string }[] }
    )[]
  })[]
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasSub = item.items && item.items.length > 0
          const subActive = hasSub ? item.items?.some((sub) => {
            if ("items" in sub) return sub.items.some((n) => isSubItemActive(n.url, pathname, searchParams))
            return isSubItemActive(sub.url, pathname, searchParams)
          }) : false
          if (hasSub) {
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive ?? subActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} isActive={subActive}>
                      {item.icon}
                      <span>{item.title}</span>
                      <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => {
                        if ("items" in subItem) {
                          return (
                            <Collapsible key={subItem.title} asChild defaultOpen={false} className="group/collapsible">
                              <SidebarMenuSubItem>
                                <CollapsibleTrigger asChild>
                                  <SidebarMenuSubButton className="text-[#8d90a2]">
                                    <span>{subItem.title}</span>
                                    <ChevronRightIcon className="ml-auto size-3 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                  </SidebarMenuSubButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <SidebarMenuSub className="ml-3 border-l border-[#434656]/20 pl-2 mt-0.5">
                                    {subItem.items.map((nested) => (
                                      <SidebarMenuSubItem key={nested.title}>
                                        <SidebarMenuSubButton asChild isActive={isSubItemActive(nested.url, pathname, searchParams)}>
                                          <Link href={nested.url}>
                                            <span>{nested.title}</span>
                                          </Link>
                                        </SidebarMenuSubButton>
                                      </SidebarMenuSubItem>
                                    ))}
                                  </SidebarMenuSub>
                                </CollapsibleContent>
                              </SidebarMenuSubItem>
                            </Collapsible>
                          )
                        }
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild isActive={isSubItemActive(subItem.url, pathname, searchParams)}>
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          }
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url}>
                <Link href={item.url}>
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
