"use client"

import * as React from "react"
import { Home, Menu as MenuIcon, List, BookOpen, MessageSquare, Megaphone, FileText } from "lucide-react"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { useAppSelector } from "@/redux/hook"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading } = useAppSelector((state) => state.user)
  console.log("user", user)

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "Başlıklar",
      url: "/dashboard/basliklar",
      icon: List,
      isActive: false,
    },
    {
      title: "Topic",
      url: "/dashboard/topic",
      icon: BookOpen,
      isActive: false,
    },
    {
      title: "Entry",
      url: "/dashboard/entry",
      icon: MessageSquare,
      isActive: false,
    },
    {
      title: "Reklamlar",
      url: "/dashboard/ads",
      icon: Megaphone,
      isActive: false,
    },
    {
      title: "Sayfalar",
      url: "/dashboard/sayfalar",
      icon: FileText,
      isActive: false,
    }
  ]

  const userData = {
    name: user?.name || "Kullanıcı",
    email: user?.email || "",
    avatar: user?.profile?.picture || "/avatars/default.jpg",
  }

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Home className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Dashboard</span>
                  <span className="truncate text-xs">Ana Sayfa</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
