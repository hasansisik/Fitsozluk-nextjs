"use client"

import { TopicsSidebar } from "@/components/topics-sidebar"
import { UserProfile } from "@/components/user-profile"
import { notFound } from "next/navigation"
import Link from "next/link"
import { useEffect, useState, useMemo } from "react"
import { useAppSelector, useAppDispatch } from "@/redux/hook"
import { editProfile, loadUser } from "@/redux/actions/userActions"
import usersData from "@/data/users-profile.json"

interface PageProps {
    params: Promise<{
        nick: string
    }>
}

export default function UserProfilePage({ params }: PageProps) {
    const [nick, setNick] = useState<string>("")
    const [isOwnProfile, setIsOwnProfile] = useState(false)
    const [noteText, setNoteText] = useState("")
    const [showSavedMessage, setShowSavedMessage] = useState(false)
    const [fetchedUser, setFetchedUser] = useState<any>(null)
    const [userLoading, setUserLoading] = useState(true)
    const [isBlockedProfile, setIsBlockedProfile] = useState(false)
    const dispatch = useAppDispatch()
    const { user, isAuthenticated, loading } = useAppSelector((state) => state.user)

    // Load user data on mount if authenticated
    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null
        if (token) {
            // Always load fresh user data to get updated bio
            dispatch(loadUser())
        }
    }, [])

    useEffect(() => {
        params.then(({ nick: nickParam }) => {
            setNick(nickParam)

            // Check if viewing own profile
            if (isAuthenticated && user) {
                const currentUserNick = user.nick?.toLowerCase()
                setIsOwnProfile(currentUserNick === decodeURIComponent(nickParam).toLowerCase())
            }
        })
    }, [params, isAuthenticated, user])

    // Load note text from localStorage
    useEffect(() => {
        if (!nick) return

        const normalizedNick = decodeURIComponent(nick).toLowerCase()
        const savedNote = localStorage.getItem(`note_${normalizedNick}`)
        setNoteText(savedNote || "")
    }, [nick])

    const handleSaveNote = async () => {
        if (!nick) return

        const normalizedNick = decodeURIComponent(nick).toLowerCase()
        localStorage.setItem(`note_${normalizedNick}`, noteText)

        setShowSavedMessage(true)
        setTimeout(() => setShowSavedMessage(false), 2000)
    }

    // Fetch user data from backend
    useEffect(() => {
        const fetchUserData = async () => {
            if (!nick) return

            setUserLoading(true)
            const normalizedNick = decodeURIComponent(nick).toLowerCase()

            // 1. Check if viewing own profile
            if (isAuthenticated && user && user.nick?.toLowerCase() === normalizedNick) {
                setFetchedUser({
                    id: user._id || "1",
                    nick: user.nick || nick,
                    displayName: user.nick || nick,
                    picture: user.picture || null,
                    badges: [],
                    stats: {
                        entryCount: 0,
                        followerCount: user.followers?.length || 0,
                        followingCount: user.following?.length || 0
                    },
                    joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' }) : "yeni",
                    bio: user.bio || "",
                    title: user.title,
                    entries: []
                })
                setUserLoading(false)
                return
            }

            // 2. Try to fetch from backend
            try {
                const { getUserByNick } = await import('@/redux/actions/userActions')
                const result = await dispatch(getUserByNick(decodeURIComponent(nick))).unwrap()

                setFetchedUser({
                    id: result._id,
                    nick: result.nick,
                    displayName: result.nick,
                    picture: result.picture || null,
                    badges: [],
                    stats: {
                        entryCount: 0,
                        followerCount: result.followers?.length || 0,
                        followingCount: result.following?.length || 0
                    },
                    joinDate: result.createdAt ? new Date(result.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' }) : "yeni",
                    bio: result.bio || "",
                    title: result.title,
                    entries: []
                })
            } catch (error: any) {
                console.error("Error fetching user:", error)

                const errorStr = String(error).toUpperCase();
                if (errorStr.includes("ENGELLEDI") || errorStr.includes("BLOCK") || errorStr.includes("FORBIDDEN") || errorStr.includes("403")) {
                    setIsBlockedProfile(true)
                    setUserLoading(false)
                    return
                }

                // 3. Fallback to mock data
                const mockUser = usersData.find(u => u.nick.toLowerCase() === normalizedNick)
                if (mockUser) {
                    setFetchedUser({
                        ...mockUser,
                        picture: mockUser.avatar
                    })
                } else {
                    setFetchedUser(null)
                }
            }
            setUserLoading(false)
        }

        fetchUserData()
    }, [nick, isAuthenticated, user, dispatch])

    // 4. Create user data - Memoized to prevent re-calculations
    const userData = useMemo(() => {
        return fetchedUser
    }, [fetchedUser])

    // 5. Detect if we are waiting for authentication (refreshing the page)
    const [isInitialAuthLoading, setIsInitialAuthLoading] = useState(true)

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null
        if (!token || isAuthenticated || (!loading && token)) {
            setIsInitialAuthLoading(false)
        }
    }, [isAuthenticated, loading])

    // FINAL RENDER LOGIC - Early returns only AFTER all hooks
    if (loading || !nick || isInitialAuthLoading || userLoading) {
        return (
            <div className="w-full flex items-center justify-center min-h-[calc(100vh-6.5rem)] bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-[#4729ff] border-t-transparent rounded-full animate-spin" />
                    <div className="text-[#4729ff] font-medium animate-pulse">yükleniyor...</div>
                </div>
            </div>
        )
    }

    // If user is blocked, show warning
    if (isBlockedProfile) {
        return (
            <div className="w-full bg-white">
                <div className="max-w-[1300px] mx-auto px-6 lg:px-8">
                    <div className="flex min-h-[calc(100vh-6.5rem)]">
                        <div className="hidden lg:block">
                            <TopicsSidebar />
                        </div>
                        <main className="flex-1 flex flex-col items-center justify-center py-24 text-center">
                            <div className="bg-secondary/20 p-8 rounded-xl border border-border max-w-md w-full">
                                <h2 className="text-xl font-bold mb-4">Bu profile erişilemiyor</h2>
                                <p className="text-muted-foreground mb-6">
                                    Bu kullanıcı ile aranızda bir engelleme var.
                                    Profili görmek için ayarlar sayfasından engeli kaldırabilirsiniz.
                                </p>
                                <Link
                                    href="/ayarlar"
                                    className="inline-flex h-10 items-center justify-center rounded-md bg-[#4729ff] px-8 text-sm font-medium text-white shadow transition-colors hover:bg-[#3820cc]"
                                >
                                    Ayarlar'a Git
                                </Link>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        )
    }

    // If user not found, show 404
    if (!userData) {
        notFound()
    }

    return (
        <div className="w-full bg-white">
            <div className="max-w-[1300px] mx-auto px-6 lg:px-8">
                <div className="flex min-h-[calc(100vh-6.5rem)]">
                    {/* Left Sidebar - Topics (Hidden on mobile) */}
                    <div className="hidden lg:block">
                        <TopicsSidebar />
                    </div>

                    {/* Main Content Area - User Profile */}
                    <main className="flex-1 w-full lg:max-w-4xl mx-auto bg-white">
                        <UserProfile userData={userData} />
                    </main>

                    {/* Right Sidebar - Notes */}
                    <div className="hidden xl:block w-80">
                        <div className="p-4">
                            <h3 className="text-sm font-medium text-foreground mb-3">notlar</h3>
                            <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="yazar hakkındaki notlarım"
                                className="w-full h-32 p-3 text-sm border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#4729ff]"
                            />
                            <button
                                onClick={handleSaveNote}
                                className="mt-2 w-full bg-[#4729ff] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#3820cc] transition-colors"
                            >
                                kaydet
                            </button>
                            {showSavedMessage && (
                                <div className="mt-2 text-center text-sm text-[#4729ff] font-medium">
                                    ✓ Kaydedildi
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
