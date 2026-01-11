"use client"

import { TopicsSidebar } from "@/components/topics-sidebar"
import { EntryCard } from "@/components/entry-card"
import { TopAd } from "@/components/ads/top-ad"
import { SidebarAd } from "@/components/ads/sidebar-ad"
import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getDebeEntries } from "@/redux/actions/topicActions"
import { getEntriesFeed, deleteEntry } from "@/redux/actions/entryActions"
import Link from "next/link"
import { Loader2, MessageSquare } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function Home() {
  const dispatch = useAppDispatch()
  // topic state yerine entry state kullanıyoruz
  const { entries, loading } = useAppSelector((state) => state.entry)
  // debeEntries topic state'inde tutuluyor olabilir, kontrol etmeliyiz. 
  // getDebeEntries topicActions'ta ve topic state'ini güncelliyor mu?
  const topicState = useAppSelector((state) => state.topic)
  const { user } = useAppSelector((state) => state.user)
  const searchParams = useSearchParams()
  const category = searchParams.get('kategori') || 'gündem'

  // Debe entry'leri topic state'inde tutuluyorsa oradan almalıyız
  // getDebeEntries -> topic slice
  // getEntriesFeed -> entry slice

  const displayEntries = category === 'debe' ? topicState.topics.map(t => t.firstEntry).filter(Boolean) : entries
  const isLoading = category === 'debe' ? topicState.loading : loading

  useEffect(() => {
    if (category === 'debe') {
      dispatch(getDebeEntries({ limit: 30 }))
    } else {
      dispatch(getEntriesFeed({ limit: 30, category }))
    }
  }, [dispatch, category])

  const handleDeleteEntry = async (entryId: string) => {
    await dispatch(deleteEntry(entryId))
    if (category === 'debe') {
      dispatch(getDebeEntries({ limit: 30 }))
    } else {
      dispatch(getEntriesFeed({ limit: 30, category }))
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
                {isLoading ? (
                  <div className="flex items-center justify-center py-24">
                    <Loader2 className="h-8 w-8 animate-spin text-[#ff6600]" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Entry List */}
                    {displayEntries.map((entry: any) => (
                      <div key={entry._id} className="pb-4">
                        {/* Topic Title Link - Entry'nin başlığına gitmek için */}
                        <div className="mb-2">
                          {/* Eğer entry içinde topic populate edilmişse (getEntriesFeed case) */}
                          {entry.topic && (
                            <Link href={`/${entry.topic.slug}`} className="block group">
                              <h2 className="text-xl font-bold text-[#1a1a1a] group-hover:text-[#ff6600] transition-colors cursor-pointer leading-tight">
                                {entry.topic.title}
                              </h2>
                            </Link>
                          )}
                          {/* Debe case'inde topic title olmayabilir çünkü getDebeEntries yapısı farklı olabilir */}
                          {/* getDebeEntries return yapısı: topics array, herbiri firstEntry içeriyor. */}
                          {/* Üstteki displayEntries map'inde entry olarak firstEntry aldım. */}
                          {/* Fakat firstEntry içinde topic bilgisi yoksa başlığı gösteremem. */}
                        </div>

                        {/* Entry Card */}
                        <EntryCard
                          id={entry._id}
                          content={entry.content}
                          author={entry.author?.nick || "anonim"}
                          authorPicture={entry.author?.picture}
                          date={new Date(entry.createdAt).toLocaleDateString('tr-TR')}
                          time={new Date(entry.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          likeCount={entry.likeCount}
                          dislikeCount={entry.dislikeCount}
                          favoriteCount={entry.favoriteCount}
                          isLiked={entry.likes?.some((id: any) => String(id) === String(user?._id))}
                          isDisliked={entry.dislikes?.some((id: any) => String(id) === String(user?._id))}
                          isFavorited={entry.favorites?.some((id: any) => String(id) === String(user?._id))}
                          onDelete={handleDeleteEntry}
                          topicTitle={entry.topic?.title} // Debe için problem olabilir
                          topicSlug={entry.topic?.slug}
                        />
                      </div>
                    ))}

                    {displayEntries.length === 0 && !isLoading && (
                      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                        <p className="text-sm">Henüz içerik yok.</p>
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
