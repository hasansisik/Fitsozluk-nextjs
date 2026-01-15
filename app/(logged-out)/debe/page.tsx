"use client"

import { TopicsSidebar } from "@/components/topics-sidebar"
import { EntryCard, EntryCardSkeleton } from "@/components/entry-card"
import { Skeleton } from "@/components/ui/skeleton"
import { TopAd } from "@/components/ads/top-ad"
import { SidebarAd } from "@/components/ads/sidebar-ad"
import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getDebeEntries } from "@/redux/actions/topicActions"
import Link from "next/link"

export default function DebePage() {
    const dispatch = useAppDispatch()
    const { debeTopics, loading } = useAppSelector((state) => state.topic)

    useEffect(() => {
        // Fetch yesterday's most liked entries
        dispatch(getDebeEntries({ limit: 30 }))
    }, [dispatch])

    return (
        <div className="w-full bg-white">
            <div className="max-w-[1300px] mx-auto px-6 lg:px-8">
                <div className="flex min-h-[calc(100vh-6.5rem)] gap-8">
                    {/* Left Sidebar */}
                    <div className="hidden lg:block">
                        <TopicsSidebar />
                    </div>

                    {/* Right Section Group (Header Ad + Content/Sidebar) */}
                    <div className="flex-1 flex flex-col min-w-0">

                        {/* 1. Header Ad Area (Wide) */}
                        <TopAd />

                        {/* 2. Lower Area: 2 Columns */}
                        <div className="flex gap-8">

                            {/* Left Column: Content */}
                            <main className="flex-1 min-w-0">
                                <div className="pb-6">
                                    <h1 className="text-2xl lg:text-3xl font-bold text-[#1a1a1a] leading-tight mb-1">
                                        dün en beğenilen entry'ler
                                    </h1>
                                    <p className="text-xs text-muted-foreground">
                                        {loading ? "yükleniyor..." : `${debeTopics?.length || 0} entry`}
                                    </p>
                                </div>

                                {loading ? (
                                    <div className="space-y-8">
                                        {[1, 2, 3].map(i => <EntryCardSkeleton key={i} />)}
                                    </div>
                                ) : debeTopics && debeTopics.length > 0 ? (
                                    <div className="space-y-8">
                                        {debeTopics.map((topic: any) => (
                                            <div key={topic._id} className="pb-4 border-b border-border last:border-0">
                                                {/* Topic Title */}
                                                <Link
                                                    href={`/${topic.slug}`}
                                                    className="block mb-3 text-lg font-semibold text-foreground hover:text-[#ff6600] transition-colors"
                                                >
                                                    {topic.title}
                                                </Link>

                                                {/* Entry */}
                                                {topic.firstEntry && (
                                                    <EntryCard
                                                        id={topic.firstEntry._id}
                                                        content={topic.firstEntry.content}
                                                        author={topic.firstEntry.author?.nick || "anonim"}
                                                        date={new Date(topic.firstEntry.createdAt).toLocaleDateString('tr-TR')}
                                                        time={new Date(topic.firstEntry.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                        isSpecial={false}
                                                        topicSlug={topic.slug}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <p>Dün hiç entry girilmemiş veya beğenilmemiş.</p>
                                    </div>
                                )}
                            </main>

                            {/* Right Column: Advertisement */}
                            <SidebarAd />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
