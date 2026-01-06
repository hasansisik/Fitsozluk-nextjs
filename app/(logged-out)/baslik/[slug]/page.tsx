"use client"

import { TopicsSidebar } from "@/components/topics-sidebar"
import { EntryCard } from "@/components/entry-card"
import { EntryForm } from "@/components/entry-form"
import { UserInfoSidebar } from "@/components/user-info-sidebar"
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

    if (topicLoading && !currentTopic) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-[#4729ff]" />
            </div>
        )
    }

    // Only show 404 if loading is finished, there is an error, or currentTopic is still null after attempt
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
                <div className="flex min-h-[calc(100vh-6.5rem)]">
                    {/* Left Sidebar - Topics */}
                    <div className="hidden lg:block">
                        <TopicsSidebar />
                    </div>

                    {/* Main Content Area */}
                    <main className="flex-1 w-full lg:max-w-4xl mx-auto bg-white">
                        {/* Topic Header */}
                        <div className="border-b border-border px-4 lg:px-6 py-4 sticky top-[6.5rem] bg-white z-10">
                            <h1 className="text-xl lg:text-2xl font-bold text-foreground">
                                {currentTopic?.title}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">
                                    {currentTopic?.entryCount || entries.length} entry
                                </span>
                            </div>
                        </div>

                        {/* Entries List */}
                        <div className="divide-y divide-border">
                            {entriesLoading && entries.length === 0 ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-6 w-6 animate-spin text-[#4729ff]" />
                                </div>
                            ) : entries.length > 0 ? (
                                entries.map((entry) => (
                                    <EntryCard
                                        key={entry._id}
                                        id={entry._id}
                                        content={entry.content}
                                        author={entry.author.nick}
                                        date={new Date(entry.createdAt || "").toLocaleDateString('tr-TR')}
                                        time={new Date(entry.createdAt || "").toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                        favoriteCount={entry.favoriteCount}
                                        onDelete={handleDeleteEntry}
                                        topicTitle={currentTopic?.title}
                                        topicSlug={currentTopic?.slug}
                                    />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                                    <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                                    <p className="text-sm">Henüz bir entry yazılmamış. İlkini sen yaz!</p>
                                </div>
                            )}
                        </div>

                        {/* Entry Form - Bottom */}
                        {user && currentTopic && (
                            <div className="mt-8 border-t border-border bg-gray-50/50 p-4 lg:p-6">
                                <EntryForm
                                    topicTitle={currentTopic.title}
                                    topicId={currentTopic._id}
                                    onEntrySubmit={handleEntrySubmit}
                                />
                            </div>
                        )}
                    </main>

                    {/* Right Sidebar */}
                    <div className="hidden xl:block">
                        <UserInfoSidebar />
                    </div>
                </div>
            </div>
        </div>
    )
}
