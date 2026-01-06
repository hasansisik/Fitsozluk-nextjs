"use client"

import { TopicsSidebar } from "@/components/topics-sidebar"
import { UserInfoSidebar } from "@/components/user-info-sidebar"
import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getTopicsWithFirstEntry } from "@/redux/actions/topicActions"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Loader2, MessageSquare } from "lucide-react"

export default function ChannelPage() {
    const params = useParams()
    const slug = params.slug as string
    const dispatch = useAppDispatch()
    const { topics, loading } = useAppSelector((state) => state.topic)

    useEffect(() => {
        // In a real app, we would filter by channel slug here
        // For now, we'll show the trending topics with entries
        dispatch(getTopicsWithFirstEntry(20))
    }, [dispatch, slug])

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
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
                        <div className="border-b border-border px-4 lg:px-6 py-4">
                            <h1 className="text-xl lg:text-2xl font-bold text-foreground">
                                #{slug}
                            </h1>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-24">
                                <Loader2 className="h-8 w-8 animate-spin text-[#4729ff]" />
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {topics.map((topic: any) => (
                                    <div key={topic._id} className="py-6 px-4 lg:px-6 hover:bg-secondary/30 transition-colors">
                                        {/* Topic Title */}
                                        <Link href={`/baslik/${topic.slug}`}>
                                            <h2 className="text-lg font-medium text-foreground hover:text-[#4729ff] transition-colors mb-2 cursor-pointer">
                                                {topic.title}
                                            </h2>
                                        </Link>

                                        {/* First Entry */}
                                        {topic.firstEntry ? (
                                            <div className="space-y-3">
                                                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                                                    {topic.firstEntry.content.length > 300
                                                        ? `${topic.firstEntry.content.substring(0, 300)}...`
                                                        : topic.firstEntry.content}
                                                </p>

                                                {/* Entry Footer */}
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/biri/${encodeURIComponent(topic.firstEntry.author.nick)}`}
                                                            className="hover:text-[#4729ff] transition-colors"
                                                        >
                                                            {topic.firstEntry.author.nick}
                                                        </Link>
                                                        <span>•</span>
                                                        <span>
                                                            {formatDate(topic.firstEntry.createdAt)} {formatTime(topic.firstEntry.createdAt)}
                                                        </span>
                                                        {topic.firstEntry.favoriteCount > 0 && (
                                                            <>
                                                                <span>•</span>
                                                                <span>❤️ {topic.firstEntry.favoriteCount}</span>
                                                            </>
                                                        )}
                                                    </div>

                                                    <Link
                                                        href={`/baslik/${topic.slug}`}
                                                        className="flex items-center gap-1 hover:text-[#4729ff] transition-colors"
                                                    >
                                                        <MessageSquare className="h-3.5 w-3.5" />
                                                        <span>{topic.entryCount}</span>
                                                    </Link>
                                                </div>
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

                    {/* Right Sidebar */}
                    <div className="hidden xl:block">
                        <UserInfoSidebar />
                    </div>
                </div>
            </div>
        </div>
    )
}
