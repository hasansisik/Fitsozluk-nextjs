"use client"

import { TopicsSidebar } from "@/components/topics-sidebar"
import { EntryCard } from "@/components/entry-card"
import { EntryForm } from "@/components/entry-form"
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
                <div className="flex min-h-[calc(100vh-6.5rem)]">
                    {/* Left Sidebar */}
                    <div className="hidden lg:block">
                        <TopicsSidebar />
                    </div>

                    {/* Main Content */}
                    <main className="flex-1 w-full lg:max-w-4xl mx-auto bg-white">
                        <div className="border-b border-border px-6 py-4">
                            <h1 className="text-xl font-bold text-foreground mb-1">
                                dün en beğenilen entry'ler
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                {debeEntries.length} entry
                            </p>
                        </div>

                        <div className="px-6">
                            {debeEntries.map((entry) => (
                                <EntryCard
                                    key={entry.id}
                                    id={entry.id}
                                    content={entry.content}
                                    author={entry.author}
                                    date={entry.date}
                                    time={entry.time}
                                    isSpecial={entry.isSpecial}
                                />
                            ))}
                        </div>

                        {/* Entry Form - Only for logged-in users */}
                        {user && (
                            <EntryForm 
                                topicTitle="dün en beğenilen entry'ler"
                                remainingEntries={debeEntries.length}
                            />
                        )}
                    </main>

                    {/* Right Sidebar */}
                    <div className="hidden xl:block w-80">
                        <div className="p-4">
                            <div className="bg-secondary h-64 flex items-center justify-center text-muted-foreground text-sm">
                                reklam alanı
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
