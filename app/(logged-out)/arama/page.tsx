"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getAllTopics } from "@/redux/actions/topicActions"
import { getAllEntries } from "@/redux/actions/entryActions"
import { searchUsers } from "@/redux/actions/userActions"
import { TopicsSidebar } from "@/components/topics-sidebar"
import { TopAd } from "@/components/ads/top-ad"
import { SidebarAd } from "@/components/ads/sidebar-ad"
import { EntryForm } from "@/components/entry-form"

function SearchContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { isAuthenticated } = useAppSelector((state) => state.user)
    const query = searchParams.get("q") || ""
    const startDate = searchParams.get("startDate") || ""
    const endDate = searchParams.get("endDate") || ""
    const sortOrder = searchParams.get("sort") || "newest"

    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (query) {
            document.title = `${query} - arama - fitsözlük`
        } else {
            document.title = `arama - fitsözlük`
        }
    }, [query])

    useEffect(() => {
        const fetchResults = async () => {
            if (query.trim().length < 2) {
                setResults([])
                return
            }

            setLoading(true)
            try {
                const combinedResults: any[] = []

                // Parallel API requests
                const [topicsResult, entriesResult, usersResult] = await Promise.all([
                    dispatch(getAllTopics({ search: query })).unwrap(),
                    dispatch(getAllEntries({
                        search: query,
                        sort: sortOrder === 'newest' ? '-createdAt' : 'createdAt',
                        startDate: startDate || undefined,
                        endDate: endDate || undefined
                    })).unwrap(),
                    dispatch(searchUsers({ search: query, limit: 10 })).unwrap()
                ])

                // Process Topics
                if (topicsResult && (topicsResult.topics || Array.isArray(topicsResult))) {
                    const topics = Array.isArray(topicsResult) ? topicsResult : topicsResult.topics
                    topics.forEach((topic: any) => {
                        combinedResults.push({
                            type: 'topic',
                            title: topic.title,
                            slug: topic.slug,
                            entryCount: topic.entryCount,
                            date: new Date(topic.createdAt).toLocaleDateString('tr-TR'),
                            originalDate: topic.createdAt
                        })
                    })
                }

                // Process Users
                if (usersResult) {
                    usersResult.forEach((user: any) => {
                        combinedResults.push({
                            type: 'user',
                            nick: user.nick,
                            title: user.title,
                            date: new Date(user.createdAt || Date.now()).toLocaleDateString('tr-TR'),
                            originalDate: user.createdAt || Date.now()
                        })
                    })
                }

                // Process Entries
                if (entriesResult) {
                    entriesResult.forEach((entry: any) => {
                        combinedResults.push({
                            type: 'entry',
                            content: entry.content,
                            topicSlug: entry.topic?.slug,
                            topicTitle: entry.topic?.title,
                            author: entry.author?.nick,
                            date: new Date(entry.createdAt).toLocaleDateString('tr-TR'),
                            originalDate: entry.createdAt
                        })
                    })
                }

                // Filter combined results by date if filters are active
                // This is necessary because topics and users APIs might not support filtering by date,
                // and to ensure consistency across all result types.
                let filteredResults = combinedResults
                if (startDate || endDate) {
                    const start = startDate ? new Date(startDate) : new Date('2000-01-01')
                    start.setHours(0, 0, 0, 0)

                    const end = endDate ? new Date(endDate) : new Date('2100-01-01')
                    end.setHours(23, 59, 59, 999)

                    filteredResults = combinedResults.filter(item => {
                        const itemDate = new Date(item.originalDate)
                        return itemDate >= start && itemDate <= end
                    })
                } else {
                    filteredResults = combinedResults
                }

                // Sort combined results
                filteredResults.sort((a: any, b: any) => {
                    const dateA = new Date(a.originalDate).getTime()
                    const dateB = new Date(b.originalDate).getTime()
                    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
                })

                setResults(filteredResults)
            } catch (error) {
                console.error("Search page error:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchResults()
    }, [dispatch, query, startDate, endDate, sortOrder])

    const exactMatchExists = results.some(
        (r) => r.type === 'topic' && r.title.toLowerCase() === query.toLowerCase().trim()
    )

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

                                {loading ? (
                                    <div className="bg-white border border-border rounded-lg p-8 text-center">
                                        <p className="text-muted-foreground">Aranıyor...</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Create Topic Button - Show IF NO EXACT MATCH IN ENTIRE DB */}
                                        {query.trim().length >= 2 && !exactMatchExists && (
                                            <div className="bg-white py-6 mb-6 text-center">
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    <span className="font-semibold text-foreground">"{query}"</span> başlığı henüz oluşturulmamış
                                                </p>
                                                {isAuthenticated ? (
                                                    <div className="text-left bg-gray-50 p-4 rounded-lg border border-border mt-4">
                                                        <h3 className="text-sm font-semibold mb-3">"{query}" başlığını oluştur ve ilk entry'yi gir:</h3>
                                                        <EntryForm
                                                            topicTitle={query}
                                                            mode="create-topic"
                                                            newTopicTitle={query}
                                                            onTopicCreate={(slug) => {
                                                                router.push(`/${slug}`)
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <Link
                                                        href={`/auth/login`}
                                                        className="mt-4 inline-block px-6 py-3 bg-[#ff6600] text-white rounded-lg hover:bg-[#e65c00] transition-colors font-medium"
                                                    >
                                                        Giriş yap ve başlığı oluştur
                                                    </Link>
                                                )}
                                            </div>
                                        )}

                                        {/* Search Results */}
                                        {results.length > 0 ? (
                                            <div className="space-y-4">
                                                {results.map((result, index) => (
                                                    <div key={index} className="bg-white border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                                                        {result.type === 'topic' ? (
                                                            <Link href={`/${result.slug}`}>
                                                                <div className="flex items-start justify-between">
                                                                    <div>
                                                                        <h3 className="text-lg font-medium text-foreground hover:text-[#ff6600] transition-colors">
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
                                                        ) : result.type === 'user' ? (
                                                            <Link href={`/yazar/${result.nick}`}>
                                                                <div className="flex items-start justify-between">
                                                                    <div>
                                                                        <h3 className="text-lg font-medium text-foreground hover:text-[#ff6600] transition-colors">
                                                                            @{result.nick}
                                                                        </h3>
                                                                        <p className="text-sm text-muted-foreground mt-1">
                                                                            {result.title || 'kullanıcı'}
                                                                        </p>
                                                                    </div>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {result.date}
                                                                    </span>
                                                                </div>
                                                            </Link>
                                                        ) : (
                                                            <Link href={`/${result.topicSlug}`}>
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex-1">
                                                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                                                            {result.topicTitle} &gt; <span className="text-[#ff6600]">@{result.author}</span>
                                                                        </h3>
                                                                        <p className="text-base text-foreground line-clamp-3">
                                                                            {result.content}
                                                                        </p>
                                                                    </div>
                                                                    <span className="text-xs text-muted-foreground ml-4 whitespace-nowrap">
                                                                        {result.date}
                                                                    </span>
                                                                </div>
                                                            </Link>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-white py-8 text-center">
                                                <p className="text-muted-foreground">
                                                    {query.trim().length < 2
                                                        ? "Arama yapmak için en az 2 karakter girin"
                                                        : "Hiçbir sonuç bulunamadı"}
                                                </p>
                                            </div>
                                        )}
                                    </>
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
