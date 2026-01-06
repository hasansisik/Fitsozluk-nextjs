"use client"

import { TopicsSidebar } from "@/components/topics-sidebar"
import { EntryCard } from "@/components/entry-card"
import { TopAd } from "@/components/ads/top-ad"
import { SidebarAd } from "@/components/ads/sidebar-ad"
import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getTopicsWithFirstEntry } from "@/redux/actions/topicActions"
import { deleteEntry } from "@/redux/actions/entryActions"
import Link from "next/link"
import { Loader2, MessageSquare } from "lucide-react"

export default function Home() {
  const dispatch = useAppDispatch()
  const { topics, loading } = useAppSelector((state) => state.topic)
  const { user } = useAppSelector((state) => state.user)

  useEffect(() => {
    dispatch(getTopicsWithFirstEntry(30))
  }, [dispatch])

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
          {/* Left Sidebar - Topics (Fixed Width) */}
          <div className="hidden lg:block">
            <TopicsSidebar />
          </div>

          {/* Right Section Group (Header Ad + Content/Sidebar) */}
          <div className="flex-1 flex flex-col min-w-0">

            {/* 1. Header Ad Area (Wide) */}
            <TopAd />

            {/* 2. Lower Area: 2 Columns (Listing + Right Ad) */}
            <div className="flex gap-8">

              {/* Left Column: Listing */}
              <main className="flex-1 min-w-0">
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
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground italic">
                            Henüz entry yok
                          </div>
                        )}
                      </div>
                    ))}

                    {topics.length === 0 && !loading && (
                      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                        <p className="text-sm">Henüz bir topic eklenmemiş.</p>
                      </div>
                    )}
                  </div>
                )}
              </main>

              {/* Right Column: Advertisement Sidebar Area */}
              <SidebarAd />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
