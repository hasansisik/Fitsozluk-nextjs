"use client"

import { TopicsSidebar } from "@/components/topics-sidebar"
import { UserInfoSidebar } from "@/components/user-info-sidebar"
import { EntryCard } from "@/components/entry-card"
import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getTopicsWithFirstEntry } from "@/redux/actions/topicActions"
import { deleteEntry } from "@/redux/actions/entryActions"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Loader2, MessageSquare } from "lucide-react"

export default function ChannelPage() {
    const params = useParams()
    const slug = params.slug as string
    const dispatch = useAppDispatch()
    const { topics, loading } = useAppSelector((state) => state.topic)

    useEffect(() => {
        dispatch(getTopicsWithFirstEntry(20))
    }, [dispatch, slug])

    const handleDeleteEntry = async (entryId: string) => {
        if (confirm("Bu entry'yi silmek istediğinize emin misiniz?")) {
            await dispatch(deleteEntry(entryId))
            dispatch(getTopicsWithFirstEntry(20))
        }
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
                                    <div key={topic._id} className="py-6 hover:bg-secondary/10 transition-colors">
                                        {/* Topic Title */}
                                        <div className="px-4 lg:px-6 mb-2">
                                            <Link href={`/${topic.slug}`} className="block">
                                                <h2 className="text-lg lg:text-xl font-bold text-foreground hover:text-[#4729ff] transition-colors cursor-pointer">
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
                                                    date={new Date(topic.firstEntry.createdAt).toLocaleDateString('tr-TR')}
                                                    time={new Date(topic.firstEntry.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                    favoriteCount={topic.firstEntry.favoriteCount}
                                                    onDelete={handleDeleteEntry}
                                                    topicTitle={topic.title}
                                                    topicSlug={topic.slug}
                                                />

                                                {/* Entry Count Link */}
                                                <Link
                                                    href={`/${topic.slug}`}
                                                    className="absolute right-6 bottom-4 flex items-center gap-1 text-xs text-muted-foreground hover:text-[#4729ff] transition-colors z-10"
                                                >
                                                    <MessageSquare className="h-3.5 w-3.5" />
                                                    <span>{topic.entryCount}</span>
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="px-4 lg:px-6 text-sm text-muted-foreground italic">
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
