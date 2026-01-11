"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useAppDispatch } from "@/redux/hook"
import { getTrendingTopics, getDebeTopics } from "@/redux/actions/topicActions"
import { Loader2, Calendar } from "lucide-react"
import { useSearchParams, usePathname } from "next/navigation"

export function TopicsSidebar() {
    const dispatch = useAppDispatch()
    const [selectedDate, setSelectedDate] = useState("")
    const [sidebarTopics, setSidebarTopics] = useState<any[]>([])
    const [sidebarLoading, setSidebarLoading] = useState(false)

    const searchParams = useSearchParams()
    const pathname = usePathname()

    // On search page, always show "gündem" category, otherwise use category from URL
    const isSearchPage = pathname === '/arama'
    const category = isSearchPage ? 'gündem' : (searchParams.get('category') || 'gündem')

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
        <aside className="w-64 bg-white h-[calc(100vh-6.5rem)] overflow-y-auto sticky top-[6.5rem]">
            <div className="p-4">
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

                <h2 className="text-sm font-medium text-muted-foreground mb-4">
                    {category === "debe"
                        ? (selectedDate
                            ? `${new Date(selectedDate).toLocaleDateString('tr-TR')} en beğenilen entry'leri`
                            : "dünün en beğenilen entry'leri")
                        : category}
                </h2>

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
                                    className="flex items-start justify-between group hover:bg-secondary p-2 rounded-md transition-colors"
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
            </div>
        </aside>
    )
}
