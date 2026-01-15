"use client"

import { TopicsSidebar } from "@/components/topics-sidebar"
import { notFound } from "next/navigation"
import Link from "next/link"
import { useEffect, useState, useMemo } from "react"
import { useAppSelector, useAppDispatch } from "@/redux/hook"
import { getUserByNick } from "@/redux/actions/userActions"
import { getAllBadges } from "@/redux/actions/badgeActions"
import { Award } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface PageProps {
    params: Promise<{
        nick: string
    }>
}

export default function UserBadgesPage({ params }: PageProps) {
    const [nick, setNick] = useState<string>("")
    const [fetchedUser, setFetchedUser] = useState<any>(null)
    const [userLoading, setUserLoading] = useState(true)
    const dispatch = useAppDispatch()
    const { badges: allBadges, loading: badgesLoading } = useAppSelector((state) => state.badge)

    useEffect(() => {
        params.then(({ nick: nickParam }) => {
            setNick(nickParam)
        })
    }, [params])

    useEffect(() => {
        if (!nick) return

        const fetchData = async () => {
            setUserLoading(true)
            try {
                const result = await dispatch(getUserByNick(decodeURIComponent(nick))).unwrap()
                setFetchedUser(result)
                dispatch(getAllBadges())
            } catch (error) {
                console.error("Error fetching data:", error)
            } finally {
                setUserLoading(false)
            }
        }

        fetchData()
    }, [nick, dispatch])

    const userBadges = useMemo(() => {
        return fetchedUser?.badges || []
    }, [fetchedUser])

    if (userLoading || badgesLoading) {
        return (
            <div className="w-full bg-white">
                <div className="max-w-[1300px] mx-auto px-4 lg:px-8">
                    <div className="flex min-h-[calc(100vh-6.5rem)]">
                        <div className="hidden lg:block">
                            <TopicsSidebar />
                        </div>
                        <main className="flex-1 w-full lg:max-w-4xl lg:ml-8 py-8">
                            <Skeleton className="h-10 w-48 mb-8" />
                            <div className="bg-white border border-border rounded-xl p-6 mb-8">
                                <Skeleton className="h-4 w-32 mb-6" />
                                <div className="flex gap-6">
                                    <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-full" />
                                    <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-full" />
                                </div>
                            </div>
                            <div className="bg-white border border-border rounded-xl p-6">
                                <Skeleton className="h-4 w-32 mb-8" />
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-10 gap-x-6">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                                        <div key={i} className="flex flex-col items-center gap-3">
                                            <Skeleton className="w-16 h-16 rounded-full" />
                                            <Skeleton className="h-3 w-12" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        )
    }

    if (!fetchedUser) {
        notFound()
    }

    return (
        <div className="w-full bg-white">
            <div className="max-w-[1300px] mx-auto px-4 lg:px-8">
                <div className="flex min-h-[calc(100vh-6.5rem)]">
                    {/* Left Sidebar - Topics */}
                    <div className="hidden lg:block">
                        <TopicsSidebar />
                    </div>

                    {/* Main Content Area */}
                    <main className="flex-1 w-full lg:max-w-4xl lg:ml-8 py-8 bg-white">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold mb-2">{fetchedUser.nick}</h1>
                        </div>

                        {/* Featured Badges Section */}
                        <div className="bg-white border border-border rounded-xl p-6 mb-8 shadow-sm">
                            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">öne çıkarttığı rozetler</h2>
                            <div className="flex flex-wrap gap-6 items-center">
                                {userBadges.length > 0 ? (
                                    userBadges.map((badge: any) => (
                                        <div key={badge._id} className="relative group flex flex-col items-center gap-2">
                                            <div className="relative">
                                                <img
                                                    src={badge.icon}
                                                    alt={badge.name}
                                                    className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-border hover:border-[#ff6600] transition-all duration-300 cursor-pointer object-cover shadow-md"
                                                />
                                                {badge.description && (
                                                    <div className="absolute inset-x-0 -bottom-12 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                        <div className="bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                                                            {badge.description}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground italic text-sm">Henüz rozet bulunmuyor.</p>
                                )}
                            </div>
                        </div>

                        {/* All Badges Section */}
                        <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
                            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8">bütün rozetler</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-10 gap-x-6">
                                {allBadges.map((badge: any) => {
                                    const hasBadge = userBadges.some((ub: any) => ub._id === badge._id)

                                    return (
                                        <div key={badge._id} className="flex flex-col items-center text-center group">
                                            <div className="relative mb-3">
                                                <img
                                                    src={badge.icon}
                                                    alt={badge.name}
                                                    className={`w-16 h-16 rounded-full border-2 transition-all duration-300 object-cover ${hasBadge
                                                        ? "border-[#ff6600] opacity-100 shadow-sm"
                                                        : "border-border opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-60"
                                                        }`}
                                                />
                                                {!hasBadge && (
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {/* Optional: Locked icon or similar */}
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`text-[11px] font-medium leading-tight ${hasBadge ? "text-foreground" : "text-muted-foreground"}`}>
                                                {badge.name}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
