"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getTrendingTopics } from "@/redux/actions/topicActions"
import { Loader2 } from "lucide-react"

export function TopicsSidebar() {
    const dispatch = useAppDispatch()
    const { topics, loading } = useAppSelector((state) => state.topic)

    useEffect(() => {
        dispatch(getTrendingTopics(20))
    }, [dispatch])

    return (
        <aside className="w-64 bg-white h-[calc(100vh-6.5rem)] overflow-y-auto sticky top-[6.5rem]">
            <div className="p-4">
                <h2 className="text-sm font-medium text-muted-foreground mb-4">gündem</h2>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-[#4729ff]" />
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {topics.map((topic) => (
                            <li key={topic._id}>
                                <Link
                                    href={`/${topic.slug}`}
                                    className="flex items-start justify-between group hover:bg-secondary p-2 rounded-md transition-colors"
                                >
                                    <span className="text-sm text-foreground group-hover:text-[#4729ff] transition-colors flex-1 leading-snug">
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
