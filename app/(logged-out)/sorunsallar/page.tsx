"use client"

import { TopicsSidebar } from "@/components/topics-sidebar"
import { EntryCard } from "@/components/entry-card"
import { EntryForm } from "@/components/entry-form"
import { useEffect, useState } from "react"

export default function SorunsallarPage() {
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const mockUser = localStorage.getItem("mockUser")
        if (mockUser) {
            setUser(JSON.parse(mockUser))
        }
    }, [])
    const entries = [
        {
            id: "1",
            content: "günümüzün en önemli sorunlarından biri iklim değişikliği. acil önlemler alınması gerekiyor.",
            author: "biliminsani",
            date: "17.12.2025",
            time: "10:00",
            isSpecial: false
        },
        {
            id: "2",
            content: "eğitim sistemindeki sorunlar toplumun geleceğini etkiliyor. köklü değişiklikler şart.",
            author: "yazaradi",
            date: "17.12.2025",
            time: "11:30",
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
                                sorunsallar
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                {entries.length} entry
                            </p>
                        </div>

                        <div className="px-6">
                            {entries.map((entry) => (
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
                                topicTitle="sorunsallar"
                                remainingEntries={entries.length}
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
