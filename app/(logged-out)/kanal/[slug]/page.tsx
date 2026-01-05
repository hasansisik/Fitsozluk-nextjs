"use client"

import { TopicsSidebar } from "@/components/topics-sidebar"
import { EntryCard } from "@/components/entry-card"
import { EntryForm } from "@/components/entry-form"
import { notFound } from "next/navigation"
import { useEffect, useState } from "react"

interface PageProps {
    params: Promise<{
        slug: string
    }>
}

const channelData: Record<string, { title: string; entries: any[] }> = {
    spor: {
        title: "#spor",
        entries: [
            {
                id: "1",
                content: "futbol maçı sonrası yapılan yorumlar çok ilginçti. özellikle taktik analizi çok başarılıydı.",
                author: "sober",
                date: "17.12.2025",
                time: "14:30",
                isSpecial: false
            },
            {
                id: "2",
                content: "basketbol finalini izlemek harikaydı. son saniyedeki basket inanılmazdı.",
                author: "kullanici123",
                date: "17.12.2025",
                time: "15:20",
                isSpecial: false
            }
        ]
    },
    iliskiler: {
        title: "#ilişkiler",
        entries: [
            {
                id: "1",
                content: "uzun mesafeli ilişkilerin zorlukları hakkında çok güzel yazmışsınız. teşekkürler.",
                author: "bu başka bir şey mi?",
                date: "17.12.2025",
                time: "11:00",
                isSpecial: false
            },
            {
                id: "2",
                content: "iletişimin önemi gerçekten çok büyük. bunu vurgulaman çok iyi olmuş.",
                author: "biliminsani",
                date: "17.12.2025",
                time: "12:15",
                isSpecial: false
            }
        ]
    },
    siyaset: {
        title: "#siyaset",
        entries: [
            {
                id: "1",
                content: "güncel siyasi gelişmeler hakkında objektif bir analiz. eline sağlık.",
                author: "yazaradi",
                date: "17.12.2025",
                time: "09:00",
                isSpecial: false
            }
        ]
    },
    yasam: {
        title: "#yaşam",
        entries: [
            {
                id: "1",
                content: "minimalist yaşam tarzı hakkında çok güzel bilgiler vermişsiniz. teşekkürler.",
                author: "yemeksever",
                date: "17.12.2025",
                time: "13:45",
                isSpecial: false
            },
            {
                id: "2",
                content: "sağlıklı beslenme alışkanlıkları kazanmak için harika öneriler.",
                author: "biliminsani",
                date: "17.12.2025",
                time: "14:00",
                isSpecial: false
            }
        ]
    },
    tarih: {
        title: "#tarih",
        entries: [
            {
                id: "1",
                content: "osmanlı dönemi hakkında çok detaylı bilgi vermişsiniz. harika bir kaynak.",
                author: "sober",
                date: "17.12.2025",
                time: "10:30",
                isSpecial: false
            }
        ]
    },
    bilim: {
        title: "#bilim",
        entries: [
            {
                id: "1",
                content: "kuantum fiziği hakkında anlaşılır bir anlatım. tebrikler.",
                author: "biliminsani",
                date: "17.12.2025",
                time: "11:30",
                isSpecial: false
            }
        ]
    },
    edebiyat: {
        title: "#edebiyat",
        entries: [
            {
                id: "1",
                content: "türk edebiyatının önemli eserleri hakkında güzel bir derleme.",
                author: "bu başka bir şey mi?",
                date: "17.12.2025",
                time: "12:00",
                isSpecial: false
            }
        ]
    },
    teknoloji: {
        title: "#teknoloji",
        entries: [
            {
                id: "1",
                content: "yapay zeka gelişmeleri hakkında güncel bilgiler. çok faydalı.",
                author: "kullanici123",
                date: "17.12.2025",
                time: "13:00",
                isSpecial: false
            }
        ]
    }
}

export default function ChannelPage({ params }: PageProps) {
    const [slug, setSlug] = useState<string>("")
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        params.then(({ slug: channelSlug }) => {
            setSlug(channelSlug)
        })

        // Check if user is logged in
        const mockUser = localStorage.getItem("mockUser")
        if (mockUser) {
            setUser(JSON.parse(mockUser))
        }
    }, [params])

    if (!slug) {
        return <div>Yükleniyor...</div>
    }

    const channel = channelData[slug]

    if (!channel) {
        notFound()
    }

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
                                {channel.title}
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                {channel.entries.length} entry
                            </p>
                        </div>

                        <div className="px-6">
                            {channel.entries.map((entry) => (
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
                                topicTitle={channel.title}
                                remainingEntries={channel.entries.length}
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
