"use client"

import { TopicsSidebar } from "@/components/topics-sidebar"
import { EntryCard } from "@/components/entry-card"
import { EntryForm } from "@/components/entry-form"
import { TopAd } from "@/components/ads/top-ad"
import { SidebarAd } from "@/components/ads/sidebar-ad"
import { useEffect, useState } from "react"

export default function DebePage() {
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const mockUser = localStorage.getItem("mockUser")
        if (mockUser) {
            setUser(JSON.parse(mockUser))
        }
    }, [])

    const debeEntries = [
        {
            id: "1",
            content: "dün gece en çok beğenilen entry. herkesin okuması gereken bir yazı olmuş. tebrikler yazara.",
            author: "biliminsani",
            date: "17.12.2025",
            time: "08:30",
            isSpecial: false
        },
        {
            id: "2",
            content: "bugünün en iyi entry'si. çok güzel anlatmış, eline sağlık.",
            author: "yemeksever",
            date: "17.12.2025",
            time: "09:15",
            isSpecial: false
        },
        {
            id: "3",
            content: "debe'ye girmeyi hak eden bir entry. tebrikler.",
            author: "sober",
            date: "17.12.2025",
            time: "10:00",
            isSpecial: false
        }
    ]

    return (
        <div className="w-full bg-white">
            <div className="max-w-[1300px] mx-auto px-6 lg:px-8">
                <div className="flex min-h-[calc(100vh-6.5rem)] gap-8">
                    {/* Left Sidebar */}
                    <div className="hidden lg:block">
                        <TopicsSidebar />
                    </div>

                    {/* Right Section Group (Header Ad + Content/Sidebar) */}
                    <div className="flex-1 flex flex-col min-w-0">

                        {/* 1. Header Ad Area (Wide) */}
                        <TopAd />

                        {/* 2. Lower Area: 2 Columns */}
                        <div className="flex gap-8">

                            {/* Left Column: Content */}
                            <main className="flex-1 min-w-0">
                                <div className="pb-6">
                                    <h1 className="text-2xl lg:text-3xl font-bold text-[#1a1a1a] leading-tight mb-1">
                                        dün en beğenilen entry'ler
                                    </h1>
                                    <p className="text-xs text-muted-foreground">
                                        {debeEntries.length} entry
                                    </p>
                                </div>

                                <div className="space-y-12">
                                    {debeEntries.map((entry) => (
                                        <div key={entry.id} className="pb-4">
                                            <EntryCard
                                                id={entry.id}
                                                content={entry.content}
                                                author={entry.author}
                                                date={entry.date}
                                                time={entry.time}
                                                isSpecial={entry.isSpecial}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Entry Form - Only for logged-in users */}
                                {user && (
                                    <div className="mt-8 border-t border-border bg-gray-50/50 p-4 lg:p-6">
                                        <EntryForm
                                            topicTitle="dün en beğenilen entry'ler"
                                            remainingEntries={debeEntries.length}
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
