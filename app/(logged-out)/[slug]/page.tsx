"use client"

import { TopicsSidebar } from "@/components/topics-sidebar"
import { EntryCard } from "@/components/entry-card"
import { EntryForm } from "@/components/entry-form"
import { TopAd } from "@/components/ads/top-ad"
import { SidebarAd } from "@/components/ads/sidebar-ad"
import { TopicFilters } from "@/components/topic-filters"
import { Pagination } from "@/components/pagination"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getTopicBySlug } from "@/redux/actions/topicActions"
import { getEntriesByTopic, deleteEntry } from "@/redux/actions/entryActions"
import { useParams, notFound } from "next/navigation"
import { Loader2, MessageSquare } from "lucide-react"

export default function TopicPage() {
    const params = useParams()
    const slug = params.slug as string
    const dispatch = useAppDispatch()

    const [currentPage, setCurrentPage] = useState(1)
    const entriesPerPage = 10

    const { currentTopic, loading: topicLoading, error: topicError } = useAppSelector((state) => state.topic)
    const { entries, loading: entriesLoading } = useAppSelector((state) => state.entry)
    const { user } = useAppSelector((state) => state.user)

    useEffect(() => {
        if (slug) {
            dispatch(getTopicBySlug(slug)).then((result: any) => {
                if (result.payload && result.payload._id) {
                    dispatch(getEntriesByTopic(result.payload._id))
                }
            })
        }
    }, [slug, dispatch])

    const handleEntrySubmit = () => {
        if (currentTopic) {
            dispatch(getEntriesByTopic(currentTopic._id))
        }
    }

    const handleDeleteEntry = async (entryId: string) => {
        if (confirm("Bu entry'yi silmek istediğinize emin misiniz?")) {
            await dispatch(deleteEntry(entryId))
            if (currentTopic) {
                dispatch(getEntriesByTopic(currentTopic._id))
            }
        }
    }

    const totalPages = Math.ceil(entries.length / entriesPerPage) || 1
    const currentEntries = entries.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage)

    if (topicLoading && !currentTopic) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-[#4729ff]" />
            </div>
        )
    }

    if (!topicLoading && topicError) {
        return notFound()
    }

    if (!currentTopic && !topicLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-[#4729ff]" />
            </div>
        )
    }

    return (
        <div className="w-full bg-white">
            <div className="max-w-[1300px] mx-auto px-6 lg:px-8">
                <div className="flex min-h-[calc(100vh-6.5rem)] gap-8">
                    {/* Left Sidebar - Topics */}
                    <div className="hidden lg:block">
                        <TopicsSidebar />
                    </div>

                    {/* Right Section Group (Header Ad + Content/Sidebar) */}
                    <div className="flex-1 flex flex-col min-w-0">

                        {/* 1. Header Ad Area (Wide) */}
                        <TopAd />

                        {/* 2. Lower Area: 2 Columns */}
                        <div className="flex gap-8">

                            {/* Left Column: Entries */}
                            <main className="flex-1 min-w-0">
                                {/* Topic Header */}
                                <div className="pb-2 sticky top-[6.5rem] bg-white z-20 border-b border-border/40 mb-4">
                                    <h1 className="text-lg lg:text-xl font-bold text-[#1a1a1a] leading-tight">
                                        {currentTopic?.title}
                                    </h1>
                                    <div className="flex items-center justify-between mt-2">
                                        <TopicFilters
                                            topicTitle={currentTopic?.title || ""}
                                            topicCreator={currentTopic?.createdBy?.nick}
                                        />
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                        />
                                    </div>
                                </div>

                                {/* Entries List */}
                                <div className="space-y-12">
                                    {entriesLoading && entries.length === 0 ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="h-6 w-6 animate-spin text-[#4729ff]" />
                                        </div>
                                    ) : currentEntries.length > 0 ? (
                                        currentEntries.map((entry) => (
                                            <div key={entry._id} className="pb-4">
                                                <EntryCard
                                                    id={entry._id}
                                                    content={entry.content}
                                                    author={entry.author.nick}
                                                    authorPicture={entry.author.picture}
                                                    date={new Date(entry.createdAt || "").toLocaleDateString('tr-TR')}
                                                    time={new Date(entry.createdAt || "").toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                    likeCount={entry.likeCount}
                                                    dislikeCount={entry.dislikeCount}
                                                    favoriteCount={entry.favoriteCount}
                                                    isLiked={entry.likes?.some((id: any) => String(id) === String(user?._id))}
                                                    isDisliked={entry.dislikes?.some((id: any) => String(id) === String(user?._id))}
                                                    isFavorited={entry.favorites?.some((id: any) => String(id) === String(user?._id))}
                                                    onDelete={handleDeleteEntry}
                                                    topicTitle={currentTopic?.title}
                                                    topicSlug={currentTopic?.slug}
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                                            <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                                            <p className="text-sm">Henüz bir entry yazılmamış. İlkini sen yaz!</p>
                                        </div>
                                    )}
                                </div>

                                {/* Entry Form */}
                                {user && currentTopic && (
                                    <div className="mt-8 bg-gray-50/50 p-4 lg:p-6">
                                        <EntryForm
                                            topicTitle={currentTopic.title}
                                            topicId={currentTopic._id}
                                            onEntrySubmit={handleEntrySubmit}
                                        />
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
