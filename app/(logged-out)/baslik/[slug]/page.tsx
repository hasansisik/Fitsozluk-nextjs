"use client"

import { TopicsSidebar } from "@/components/topics-sidebar"
import { EntryCard } from "@/components/entry-card"
import { EntryForm } from "@/components/entry-form"
import { Pagination } from "@/components/pagination"
import { TopicFilters } from "@/components/topic-filters"
import topicsData from "@/data/topics.json"
import { notFound } from "next/navigation"
import { useEffect, useState } from "react"

interface PageProps {
    params: Promise<{
        slug: string
    }>
}

export default function TopicPage({ params }: PageProps) {
    const [slug, setSlug] = useState<string>("")
    const [user, setUser] = useState<any>(null)
    const [allEntries, setAllEntries] = useState<any[]>([])
    const [isMounted, setIsMounted] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const entriesPerPage = 10

    // Scroll to top when page changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [currentPage])

    const loadEntries = (topicSlug: string, topicEntries: any[]) => {
        const userEntries = JSON.parse(localStorage.getItem("userEntries") || "[]")
        const topicUserEntries = userEntries.filter((entry: any) => entry.topicSlug === topicSlug)
        const merged = [...topicUserEntries, ...topicEntries]
        setAllEntries(merged)
    }

    const handleDeleteEntry = (entryId: string) => {
        const userEntries = JSON.parse(localStorage.getItem("userEntries") || "[]")
        const filtered = userEntries.filter((entry: any) => entry.id !== entryId)
        localStorage.setItem("userEntries", JSON.stringify(filtered))
        const topic = topicsData.find((t) => t.slug === slug)
        if (topic) loadEntries(slug, topic.entries)
    }

    useEffect(() => {
        setIsMounted(true)
        params.then(({ slug: topicSlug }) => {
            setSlug(topicSlug)
            const topic = topicsData.find((t) => t.slug === topicSlug)
            if (topic) loadEntries(topicSlug, topic.entries)
        })
        const mockUser = localStorage.getItem("mockUser")
        if (mockUser) setUser(JSON.parse(mockUser))
    }, [params])

    if (!slug || !isMounted) {
        return <div>Yükleniyor...</div>
    }

    // Find topic by slug
    const topic = topicsData.find((t) => t.slug === slug)

    if (!topic) {
        notFound()
    }

    return (
        <div className="w-full bg-white">
            <div className="max-w-[1300px] mx-auto px-6 lg:px-8">
                <div className="flex min-h-[calc(100vh-6.5rem)]">
                    {/* Left Sidebar - Topics */}
                    <div className="hidden lg:block">
                        <TopicsSidebar />
                    </div>

                    {/* Main Content Area */}
                    <main className="flex-1 w-full lg:max-w-4xl mx-auto bg-white">
                        {/* Topic Header */}
                        <div className="border-b border-border px-6 py-4">
                            <h1 className="text-xl font-bold text-foreground mb-1">
                                {topic.title}
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                {topic.entryCount} entry
                            </p>
                        </div>

                        {/* Topic Filters */}
                        <TopicFilters topicTitle={topic.title} topicCreator="anonim" />

                        {/* Pagination - Top */}
                        {allEntries.length > entriesPerPage && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={Math.ceil(allEntries.length / entriesPerPage)}
                                onPageChange={setCurrentPage}
                            />
                        )}

                        {/* Entries */}
                        <div className="px-6">
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
                                        topicTitle={topic.title}
                                        topicSlug={topic.slug}
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
                                topicTitle={topic.title}
                                topicSlug={topic.slug}
                                remainingEntries={topic.entryCount}
                                onEntrySubmit={() => loadEntries(slug, topic.entries)}
                            />
                        )}
                    </main>

                    {/* Right Sidebar - Ad Space */}
                    <div className="hidden xl:block w-80">
                        <div className="p-4">
                            <div className="bg-secondary h-64 flex items-center justify-center text-muted-foreground text-sm">
                                reklam alanı
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
