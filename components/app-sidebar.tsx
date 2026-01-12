"use client"

import * as React from "react"
import { List, BookOpen, MessageSquare, Megaphone, FileText, Users, Flag } from "lucide-react"
import { NavMain } from "@/components/nav-main"
import AccountSwitcher from "@/components/AccountSwitcher"
import { useAppSelector } from "@/redux/hook"
import Image from "next/image"
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

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: List,
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
    },
    {
      title: "Kullanıcılar",
      url: "/dashboard/kullanicilar",
      icon: Users,
      isActive: false,
    },
    {
      title: "Şikayetler",
      url: "/dashboard/sikayetler",
      icon: Flag,
      isActive: false,
    }
  ]

  const currentUser = {
    name: user?.name || user?.nick || "Kullanıcı",
    email: user?.email || "",
    picture: user?.picture || user?.profile?.picture || "",
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
              <a href="/dashboard" className="flex items-center justify-center py-2">
                <Image
                  src="/fitsözlük.png"
                  alt="Fitsözlük"
                  width={120}
                  height={40}
                  className="object-contain"
                />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        {user && <AccountSwitcher currentUser={currentUser} />}
      </SidebarFooter>
    </Sidebar>
  )
}
