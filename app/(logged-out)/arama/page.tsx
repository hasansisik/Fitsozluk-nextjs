"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import topicsData from "@/data/topics.json"
import usersData from "@/data/users-profile.json"
import { TopicsSidebar } from "@/components/topics-sidebar"
import { TopAd } from "@/components/ads/top-ad"
import { SidebarAd } from "@/components/ads/sidebar-ad"

function SearchContent() {
    const searchParams = useSearchParams()
    const query = searchParams.get("q") || ""
    const startDate = searchParams.get("startDate") || ""
    const endDate = searchParams.get("endDate") || ""
    const sortOrder = searchParams.get("sort") || "newest"

    const [results, setResults] = useState<any[]>([])

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([])
            return
        }

        const lowerQuery = query.toLowerCase()
        const searchResults: any[] = []

        // Search topics
        topicsData.forEach((topic: any) => {
            if (topic.title.toLowerCase().includes(lowerQuery)) {
                searchResults.push({
                    type: 'topic',
                    title: topic.title,
                    slug: topic.slug,
                    entryCount: topic.entryCount,
                    date: topic.entries[0]?.date || "01.01.2024"
                })
            }
        })

        // Search users
        usersData.forEach((user: any) => {
            if ((user.nick || "").toLowerCase().includes(lowerQuery) ||
                user.displayName.toLowerCase().includes(lowerQuery)) {
                searchResults.push({
                    type: 'user',
                    nick: user.nick,
                    displayName: user.displayName,
                    date: user.joinDate || "01.01.2024"
                })
            }
        })

        // Apply date filtering
        let filteredResults = searchResults
        if (startDate || endDate) {
            filteredResults = searchResults.filter((result) => {
                const resultDate = new Date(result.date.split('.').reverse().join('-'))
                const start = startDate ? new Date(startDate) : new Date('2000-01-01')
                const end = endDate ? new Date(endDate) : new Date('2100-01-01')
                return resultDate >= start && resultDate <= end
            })
        }

        // Apply sorting
        filteredResults.sort((a, b) => {
            const dateA = new Date(a.date.split('.').reverse().join('-'))
            const dateB = new Date(b.date.split('.').reverse().join('-'))
            return sortOrder === 'newest' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime()
        })

        setResults(filteredResults)
    }, [query, startDate, endDate, sortOrder])

    return (
        <div className="w-full bg-white">
            <div className="max-w-[1300px] mx-auto px-6 lg:px-8">
                <div className="flex min-h-[calc(100vh-6.5rem)] gap-8">
                    {/* Left Sidebar - Topics (Fixed Width) */}
                    <div className="hidden lg:block">
                        <TopicsSidebar />
                    </div>

                    {/* Right Section Group (Header Ad + Content/Sidebar) */}
                    <div className="flex-1 flex flex-col min-w-0">

                        {/* 1. Header Ad Area (Wide) */}
                        <TopAd location="arama" />

                        {/* 2. Lower Area: 2 Columns (Listing + Right Ad) */}
                        <div className="flex gap-8">

                            {/* Left Column: Search Results */}
                            <main className="flex-1 min-w-0">
                                <div className="mb-6">
                                    <h1 className="text-2xl font-bold text-foreground mb-2">
                                        Arama Sonuçları
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        "{query}" için {results.length} sonuç bulundu
                                    </p>
                                </div>

                                {results.length > 0 ? (
                                    <div className="space-y-4">
                                        {results.map((result, index) => (
                                            <div key={index} className="bg-white border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                                                {result.type === 'topic' ? (
                                                    <Link href={`/${result.slug}`}>
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h3 className="text-lg font-medium text-foreground hover:text-[#4729ff] transition-colors">
                                                                    {result.title}
                                                                </h3>
                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                    {result.entryCount} entry
                                                                </p>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">
                                                                {result.date}
                                                            </span>
                                                        </div>
                                                    </Link>
                                                ) : (
                                                    <Link href={`/yazar/${result.nick}`}>
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h3 className="text-lg font-medium text-foreground hover:text-[#4729ff] transition-colors">
                                                                    @{result.nick}
                                                                </h3>
                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                    {result.displayName}
                                                                </p>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">
                                                                Kullanıcı
                                                            </span>
                                                        </div>
                                                    </Link>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white border border-border rounded-lg p-8 text-center">
                                        <p className="text-muted-foreground">
                                            {query.trim().length < 2
                                                ? "Arama yapmak için en az 2 karakter girin"
                                                : "Sonuç bulunamadı"}
                                        </p>
                                    </div>
                                )}
                            </main>

                            {/* Right Column: Advertisement Sidebar Area */}
                            <SidebarAd location="arama" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="w-full bg-white">
                <div className="max-w-[1300px] mx-auto px-6 lg:px-8">
                    <div className="flex min-h-[calc(100vh-6.5rem)] gap-8">
                        <div className="hidden lg:block">
                            <TopicsSidebar />
                        </div>
                        <div className="flex-1 flex flex-col min-w-0">
                            <TopAd location="arama" />
                            <div className="flex gap-8">
                                <main className="flex-1 min-w-0">
                                    <div className="bg-white border border-border rounded-lg p-8 text-center">
                                        <p className="text-muted-foreground">Yükleniyor...</p>
                                    </div>
                                </main>
                                <SidebarAd location="arama" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        }>
            <SearchContent />
        </Suspense>
    )
}
