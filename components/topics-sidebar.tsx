"use client"

import Link from "next/link"
import { useEffect, useState, Suspense } from "react"
import { useAppDispatch } from "@/redux/hook"
import { getTrendingTopics, getDebeTopics } from "@/redux/actions/topicActions"
import { Loader2, Calendar, Settings } from "lucide-react"
import { useSearchParams, usePathname } from "next/navigation"

interface TopicsSidebarProps {
    isMobile?: boolean
    onClose?: () => void
}

function TopicsSidebarContent({ isMobile, onClose }: TopicsSidebarProps) {
    const dispatch = useAppDispatch()
    const [selectedDate, setSelectedDate] = useState("")
    const [sidebarTopics, setSidebarTopics] = useState<any[]>([])
    const [sidebarLoading, setSidebarLoading] = useState(false)

    const searchParams = useSearchParams()
    const pathname = usePathname()

    // Determine category based on pathname and URL params
    const isSearchPage = pathname === '/arama'
    const isDebePage = pathname === '/debe'
    const categoryFromUrl = searchParams.get('category') || searchParams.get('kategori')

    // Priority: debe page > search page > URL param > default
    const category = isDebePage ? 'debe' : (isSearchPage ? 'gündem' : (categoryFromUrl || 'gündem'))

    // Format category title for display (decode URL encoding and capitalize)
    const formatCategoryTitle = (cat: string) => {
        if (cat === 'debe') return cat
        if (cat === 'gündem') return cat
        // Decode URL encoding (e.g., "protein%20tozu" -> "protein tozu")
        const decoded = decodeURIComponent(cat)
        return decoded
    }

    useEffect(() => {
        const fetchSidebarTopics = async () => {
            setSidebarLoading(true)
            try {
                if (category === "debe") {
                    const result = await dispatch(getDebeTopics({ limit: 20, date: selectedDate || undefined })).unwrap()
                    setSidebarTopics(result)
                } else {
                    const result = await dispatch(getTrendingTopics({ limit: 20, category: category !== 'gündem' ? category : undefined })).unwrap()
                    setSidebarTopics(result)
                }
            } catch (error) {
                console.error("Sidebar fetch error:", error)
            } finally {
                setSidebarLoading(false)
            }
        }

        fetchSidebarTopics()
    }, [dispatch, category, selectedDate])

    return (
        <aside className={`${isMobile ? 'w-full h-full' : 'w-64 h-[calc(100vh-6.5rem)] sticky top-[6.5rem]'} bg-white overflow-y-auto`}>
            <div className={`${isMobile ? 'p-4' : 'py-4 pr-4'}`}>
                {/* Date Picker for Debe */}
                {category === "debe" && (
                    <div className="mb-4">
                        <label className="block text-xs text-muted-foreground mb-1.5">
                            Tarih Seçin
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                className="w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-[#ff6600]"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {selectedDate ? new Date(selectedDate).toLocaleDateString('tr-TR') : "Dün"}
                        </p>
                    </div>
                )}

                <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-sm font-medium text-muted-foreground capitalize">
                        {category === "debe"
                            ? (selectedDate
                                ? `${new Date(selectedDate).toLocaleDateString('tr-TR')} en beğenilen entry'leri`
                                : "dünün en beğenilen entry'leri")
                            : formatCategoryTitle(category)}
                    </h2>
                </div>

                {sidebarLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-[#ff6600]" />
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {sidebarTopics.map((topic: any) => (
                            <li key={topic._id}>
                                <Link
                                    href={`/${topic.slug}`}
                                    onClick={() => onClose && onClose()}
                                    className="flex items-start justify-between group py-2 pr-2 rounded-md"
                                >
                                    <span className="text-sm text-foreground group-hover:text-[#ff6600] transition-colors flex-1 leading-snug">
                                        {topic.title}
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                                        {topic.entryCount || 0}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}

                {!sidebarLoading && sidebarTopics.length > 0 && (
                    <div className="mt-6 text-right">
                        <Link
                            href={`/?kategori=${category === 'debe' ? 'debe' : category}`}
                            onClick={() => onClose && onClose()}
                            className="text-xs text-muted-foreground hover:text-[#ff6600] transition-colors"
                        >
                            daha da ...
                        </Link>
                    </div>
                )}
            </div>
        </aside>
    )
}

export function TopicsSidebar(props: TopicsSidebarProps) {
    return (
        <Suspense fallback={
            <aside className={`${props.isMobile ? 'w-full h-full' : 'w-64 h-[calc(100vh-6.5rem)] sticky top-[6.5rem]'} bg-white ${props.isMobile ? 'p-4' : 'py-4 pr-4'}`}>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-[#ff6600]" />
                </div>
            </aside>
        }>
            <TopicsSidebarContent {...props} />
        </Suspense>
    )
}

