"use client"

import { TopicsSidebar } from "@/components/topics-sidebar";
import { EntryCard } from "@/components/entry-card";
import { UserInfoSidebar } from "@/components/user-info-sidebar";
import { EntryForm } from "@/components/entry-form";
import { Pagination } from "@/components/pagination";
import entriesData from "@/data/entries.json";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [allEntries, setAllEntries] = useState<any[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const entriesPerPage = 10

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  const loadEntries = () => {
    // Load user entries from localStorage
    const userEntries = JSON.parse(localStorage.getItem("userEntries") || "[]")

    // Filter entries for this topic (home page shows "balık yedikten sonra helva yemek")
    const topicEntries = userEntries.filter((entry: any) =>
      entry.topicSlug === "balik-yedikten-sonra-helva-yemek"
    )

    // Merge user entries with existing entries
    const merged = [...topicEntries, ...entriesData]
    setAllEntries(merged)
  }

  const handleDeleteEntry = (entryId: string) => {
    const userEntries = JSON.parse(localStorage.getItem("userEntries") || "[]")
    const filtered = userEntries.filter((entry: any) => entry.id !== entryId)
    localStorage.setItem("userEntries", JSON.stringify(filtered))
    loadEntries()
  }

  useEffect(() => {
    setIsMounted(true)

    // Check if user is logged in
    const mockUser = localStorage.getItem("mockUser")
    if (mockUser) {
      setUser(JSON.parse(mockUser))
    }

    loadEntries()

    setIsLoading(false)

    // Listen for storage changes (logout from header)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "mockUser" && !e.newValue) {
        setUser(null)
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Also listen for custom logout event
    const handleLogout = () => {
      setUser(null)
    }

    window.addEventListener("userLogout", handleLogout)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("userLogout", handleLogout)
    }
  }, [])

  if (isLoading || !isMounted) {
    return <div>Yükleniyor...</div>
  }

  return (
    <div className="w-full bg-white">
      <div className="max-w-[1300px] mx-auto px-6 lg:px-8">
        <div className="flex min-h-[calc(100vh-6.5rem)]">
          {/* Left Sidebar - Topics (Hidden on mobile) */}
          <div className="hidden lg:block">
            <TopicsSidebar />
          </div>

          {/* Main Content Area */}
          <main className="flex-1 w-full lg:max-w-4xl mx-auto bg-white">
            <div className="border-b border-border px-4 lg:px-6 py-4">
              <h1 className="text-xl lg:text-2xl font-normal text-foreground">
                balık yedikten sonra helva yemek
              </h1>
            </div>

            {/* Pagination - Top */}
            {allEntries.length > entriesPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(allEntries.length / entriesPerPage)}
                onPageChange={setCurrentPage}
              />
            )}

            <div className="px-4 lg:px-6">
              {allEntries
                .slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage)
                .map((entry) => (
                  <EntryCard
                    key={entry.id}
                    id={entry.id}
                    content={entry.content}
                    author={entry.author}
                    date={entry.date}
                    time={entry.time}
                    isSpecial={entry.isSpecial}
                    onDelete={handleDeleteEntry}
                  />
                ))}
            </div>

            {/* Pagination */}
            {allEntries.length > entriesPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(allEntries.length / entriesPerPage)}
                onPageChange={setCurrentPage}
              />
            )}

            {/* Entry Form - Only for logged-in users */}
            {user && (
              <EntryForm
                topicTitle="balık yedikten sonra helva yemek"
                topicSlug="balik-yedikten-sonra-helva-yemek"
                remainingEntries={83}
                onEntrySubmit={loadEntries}
              />
            )}
          </main>

          {/* Right Sidebar - User Info (Hidden on mobile and tablet) */}
          <div className="hidden xl:block">
            <UserInfoSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
