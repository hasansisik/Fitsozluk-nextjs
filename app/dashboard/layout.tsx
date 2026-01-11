"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { loadUser } from "@/redux/actions/userActions"
import { useRouter } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { user, loading } = useAppSelector((state) => state.user)
  const [isInitialized, setIsInitialized] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem("accessToken")

    if (!token) {
      router.push("/giris")
      return
    }

    // Load user only once - check if user has _id (not just empty object)
    if (!user?._id && !loading && !isInitialized) {
      console.log('Dashboard Layout - Calling loadUser...')
      dispatch(loadUser())
      setIsInitialized(true)
    }
  }, [dispatch, router, user, loading, isInitialized])

  // Prevent hydration errors by not rendering client-only content on server
  if (!mounted) {
    return null
  }

  const token = localStorage.getItem("accessToken")

  if (!token) {
    return null
  }

  // Show loading if no user data (check for _id, not just empty object)
  if (!user?._id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6600] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          {children}
        </div>
      </SidebarProvider>
    </div>
  )
}
