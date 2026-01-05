"use client"

import topicsData from "@/data/topics.json"
import Link from "next/link"

export function TopicsSidebar() {
    return (
        <aside className="w-64 border-r border-border h-[calc(100vh-6.5rem)] overflow-y-auto sticky top-[6.5rem]">
            <div className="p-4">
                <h2 className="text-sm font-medium text-muted-foreground mb-4">gündem</h2>
                <ul className="space-y-3">
                    {topicsData.map((topic) => (
                        <li key={topic.id}>
                            <Link
                                href={`/baslik/${topic.slug}`}
                                className="flex items-start justify-between group hover:bg-secondary p-2 rounded-md transition-colors"
                            >
                                <span className="text-sm text-foreground group-hover:text-[#4729ff] transition-colors flex-1 leading-snug">
                                    {topic.title}
                                </span>
                                <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                                    {topic.entryCount}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    )
}
