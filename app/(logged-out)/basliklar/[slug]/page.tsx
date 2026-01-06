"use client"

import { TopicsSidebar } from "@/components/topics-sidebar"
import { EntryCard } from "@/components/entry-card"
import { TopAd } from "@/components/ads/top-ad"
import { SidebarAd } from "@/components/ads/sidebar-ad"
import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getTopicsWithFirstEntry } from "@/redux/actions/topicActions"
import { deleteEntry } from "@/redux/actions/entryActions"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Loader2, MessageSquare } from "lucide-react"

export default function TopicsGroupPage() {
    const params = useParams()
    const slug = params.slug as string
    const dispatch = useAppDispatch()
    const { topics, loading } = useAppSelector((state) => state.topic)
    const { user } = useAppSelector((state) => state.user)

    useEffect(() => {
        // For now, we fetch trending topics as requested "şimdilik hepsi listelensin"
        dispatch(getTopicsWithFirstEntry(30))
    }, [dispatch, slug])

    const handleDeleteEntry = async (entryId: string) => {
        if (confirm("Bu entry'yi silmek istediğinize emin misiniz?")) {
            await dispatch(deleteEntry(entryId))
            dispatch(getTopicsWithFirstEntry(30))
        }
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

                        {/* 1. Header Ad Area */}
                        <TopAd />

                        {/* 2. Lower Area: 2 Columns */}
                        <div className="flex gap-8">

                            {/* Left Column: Topic Listing */}
                            <main className="flex-1 min-w-0">
                                <div className="pb-6">
                                    <h1 className="text-2xl lg:text-3xl font-bold text-[#1a1a1a] leading-tight mb-1">
                                        #{slug}
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        bu kategorideki tüm başlıklar listeleniyor
                                    </p>
                                </div>

                                {loading ? (
                                    <div className="flex items-center justify-center py-24">
                                        <Loader2 className="h-8 w-8 animate-spin text-[#4729ff]" />
                                    </div>
                                ) : (
                                    <div className="space-y-12">
                                        {topics.map((topic: any) => (
                                            <div key={topic._id} className="pb-4">
                                                {/* Topic Title */}
                                                <div className="mb-4">
                                                    <Link href={`/${topic.slug}`} className="block group">
                                                        <h2 className="text-xl lg:text-2xl font-bold text-[#1a1a1a] group-hover:text-[#4729ff] transition-colors cursor-pointer leading-tight">
                                                            {topic.title}
                                                        </h2>
                                                    </Link>
                                                </div>

                                                {/* First Entry using EntryCard */}
                                                {topic.firstEntry ? (
                                                    <div className="relative">
                                                        <EntryCard
                                                            id={topic.firstEntry._id}
                                                            content={topic.firstEntry.content}
                                                            author={topic.firstEntry.author.nick}
                                                            authorPicture={topic.firstEntry.author.picture}
                                                            date={new Date(topic.firstEntry.createdAt).toLocaleDateString('tr-TR')}
                                                            time={new Date(topic.firstEntry.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                            likeCount={topic.firstEntry.likeCount}
                                                            dislikeCount={topic.firstEntry.dislikeCount}
                                                            favoriteCount={topic.firstEntry.favoriteCount}
                                                            isLiked={topic.firstEntry.likes?.some((id: any) => String(id) === String(user?._id))}
                                                            isDisliked={topic.firstEntry.dislikes?.some((id: any) => String(id) === String(user?._id))}
                                                            isFavorited={topic.firstEntry.favorites?.some((id: any) => String(id) === String(user?._id))}
                                                            onDelete={handleDeleteEntry}
                                                            topicTitle={topic.title}
                                                            topicSlug={topic.slug}
                                                        />

                                                        {/* Entry Count Link */}
                                                        <Link
                                                            href={`/${topic.slug}`}
                                                            className="absolute right-0 bottom-0 mb-4 flex items-center gap-1 text-xs text-muted-foreground hover:text-[#4729ff] transition-colors z-10"
                                                        >
                                                            <MessageSquare className="h-3.5 w-3.5" />
                                                            <span>{topic.entryCount}</span>
                                                        </Link>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-muted-foreground italic">
                                                        Henüz entry yok
                                                    </div>
                                                )}
                                            </div>
                                        ))}
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
