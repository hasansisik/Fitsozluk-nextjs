"use client"

import { TopicsSidebar } from "@/components/topics-sidebar"
import { EntryCard } from "@/components/entry-card"
import { EntryForm } from "@/components/entry-form"
import { TopAd } from "@/components/ads/top-ad"
import { SidebarAd } from "@/components/ads/sidebar-ad"
import { TopicFilters } from "@/components/topic-filters"
import { Pagination } from "@/components/pagination"
import { useEffect, useState, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getTopicBySlug, clearCurrentTopic } from "@/redux/actions/topicActions"
import { getEntriesByTopic, deleteEntry } from "@/redux/actions/entryActions"
import { followTopic, unfollowTopic } from "@/redux/actions/topicActions"
import { useParams, notFound } from "next/navigation"
import { Loader2, MessageSquare } from "lucide-react"

export default function TopicPage() {
    const params = useParams()
    const slug = params.slug as string
    const dispatch = useAppDispatch()

    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")
    const [timeRange, setTimeRange] = useState("tümü")
    const [filterType, setFilterType] = useState("")
    const [isFollowing, setIsFollowing] = useState(false)
    const entriesPerPage = 10

    // Track the current topic ID to prevent duplicate fetches
    const currentTopicIdRef = useRef<string | null>(null)

    const { currentTopic, loading: topicLoading, error: topicError } = useAppSelector((state) => state.topic)
    const { entries, loading: entriesLoading } = useAppSelector((state) => state.entry)
    const { user } = useAppSelector((state) => state.user)

    useEffect(() => {
        if (slug) {
            // IMMEDIATELY clear old topic and entries to prevent flash
            dispatch(clearCurrentTopic())
            currentTopicIdRef.current = null

            // Reset state when slug changes
            setCurrentPage(1)
            setSearchQuery("")
            setTimeRange("tümü")
            setFilterType("")

            dispatch(getTopicBySlug(slug)).then((result: any) => {
                if (result.payload && result.payload._id) {
                    currentTopicIdRef.current = result.payload._id
                    // Fetch entries - only initial load, no filters
                    dispatch(getEntriesByTopic({ topicId: result.payload._id }))
                }
            })
        }
    }, [slug, dispatch])

    // Fetch entries when filters change (but NOT when topic changes)
    useEffect(() => {
        if (currentTopic && currentTopic._id === currentTopicIdRef.current) {
            // Only fetch if we have filters active
            if (searchQuery || timeRange !== 'tümü' || filterType) {
                const params: any = { topicId: currentTopic._id }
                if (searchQuery) params.search = searchQuery
                if (timeRange && timeRange !== 'tümü') params.timeRange = timeRange
                if (filterType) {
                    params.filterType = filterType
                    if (filterType === 'benimkiler' && user) {
                        params.userId = user._id
                    }
                }
                dispatch(getEntriesByTopic(params))
            }
        }
    }, [searchQuery, timeRange, filterType])

    // Update follow status when user or topic changes
    useEffect(() => {
        if (currentTopic && user && user.followedTopics) {
            const isNowFollowing = user.followedTopics.some((topic: any) =>
                topic._id === currentTopic._id || topic === currentTopic._id
            )
            setIsFollowing(isNowFollowing)
        } else {
            setIsFollowing(false)
        }
    }, [user, currentTopic])

    const handleFilterChange = (newTimeRange: string, newFilterType: string) => {
        setTimeRange(newTimeRange)
        setFilterType(newFilterType)
        setCurrentPage(1) // Reset to first page
    }

    const handleSearch = (query: string) => {
        setSearchQuery(query)
        setCurrentPage(1) // Reset to first page when searching
    }

    const handleFollowToggle = async () => {
        if (!currentTopic || !user) return

        try {
            if (isFollowing) {
                await dispatch(unfollowTopic(currentTopic._id)).unwrap()
            } else {
                await dispatch(followTopic(currentTopic._id)).unwrap()
            }

            // Reload user data to get updated followedTopics
            const { loadUser } = await import('@/redux/actions/userActions')
            const result = await dispatch(loadUser()).unwrap()

            // Update isFollowing based on the refreshed user data
            if (result && result.followedTopics) {
                const isNowFollowing = result.followedTopics.some((topic: any) =>
                    topic._id === currentTopic._id || topic === currentTopic._id
                )
                setIsFollowing(isNowFollowing)
            }
        } catch (error) {
            console.error('Follow toggle error:', error)
        }
    }

    const handleEntrySubmit = () => {
        if (currentTopic) {
            const params: any = { topicId: currentTopic._id }
            if (searchQuery) params.search = searchQuery
            if (timeRange && timeRange !== 'tümü') params.timeRange = timeRange
            if (filterType) {
                params.filterType = filterType
                if (filterType === 'benimkiler' && user) {
                    params.userId = user._id
                }
            }
            dispatch(getEntriesByTopic(params))
        }
    }

    const handleDeleteEntry = async (entryId: string) => {
        await dispatch(deleteEntry(entryId))
        if (currentTopic) {
            const params: any = { topicId: currentTopic._id }
            if (searchQuery) params.search = searchQuery
            if (timeRange && timeRange !== 'tümü') params.timeRange = timeRange
            if (filterType) {
                params.filterType = filterType
                if (filterType === 'benimkiler' && user) {
                    params.userId = user._id
                }
            }
            dispatch(getEntriesByTopic(params))
        }
    }

    const totalPages = Math.ceil(entries.length / entriesPerPage) || 1
    const currentEntries = entries.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage)

    // Show loading if topic is being loaded or not available
    if (!currentTopic) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-[#ff6600]" />
            </div>
        )
    }

    if (!topicLoading && topicError) {
        return notFound()
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
                                <div className="pb-2 sticky top-[5.25rem] bg-white z-20 border-b border-border/40 mb-4 pt-2 -mt-2">
                                    <h1 className="text-2xl lg:text-3xl font-bold text-[#1a1a1a] leading-tight tracking-tight">
                                        {currentTopic?.title}
                                    </h1>
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mt-3 gap-3">
                                        <TopicFilters
                                            topicTitle={currentTopic?.title || ""}
                                            topicId={currentTopic?._id}
                                            topicCreator={currentTopic?.createdBy?.nick}
                                            topicCreatorId={currentTopic?.createdBy?._id}
                                            onSearch={handleSearch}
                                            onFilterChange={handleFilterChange}
                                            isFollowing={isFollowing}
                                            onFollowToggle={handleFollowToggle}
                                        />
                                        <div className="flex justify-end">
                                            <Pagination
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={(page) => {
                                                    setCurrentPage(page)
                                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Entries List */}
                                <div className="space-y-12">
                                    {entriesLoading && entries.length === 0 ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="h-6 w-6 animate-spin text-[#ff6600]" />
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

                                {/* Bottom Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-8 pt-4 border-t border-border/40">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={(page) => {
                                                setCurrentPage(page)
                                                window.scrollTo({ top: 0, behavior: 'smooth' })
                                            }}
                                        />
                                    </div>
                                )}

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