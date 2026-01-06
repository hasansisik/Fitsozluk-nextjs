"use client"

import { TopicsSidebar } from "@/components/topics-sidebar"
import { UserProfile } from "@/components/user-profile"
import { notFound } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { useAppSelector } from "@/redux/hook"
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
    const { user, isAuthenticated, loading } = useAppSelector((state) => state.user)

    useEffect(() => {
        params.then(({ nick: nickParam }) => {
            setNick(nickParam)

            // Check if viewing own profile
            if (isAuthenticated && user) {
                const currentUserNick = user.nick?.toLowerCase()
                setIsOwnProfile(currentUserNick === decodeURIComponent(nickParam).toLowerCase())
            }

            // Load saved note for this user
            const savedNote = localStorage.getItem(`note_${decodeURIComponent(nickParam).toLowerCase()}`)
            if (savedNote) {
                setNoteText(savedNote)
            }
        })
    }, [params, isAuthenticated, user])

    // 4. Create user data - Memoized to prevent re-calculations
    const userData = useMemo(() => {
        if (!nick) return null

        const normalizedNick = decodeURIComponent(nick).toLowerCase()

        // 1. Try to match with authenticated user
        if (isAuthenticated && user && user.nick?.toLowerCase() === normalizedNick) {
            return {
                id: user._id || "1",
                nick: user.nick || nick,
                displayName: user.nick || nick,
                picture: user.picture || null,
                badges: [],
                stats: {
                    entryCount: 0,
                    followerCount: 0,
                    followingCount: 0
                },
                joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' }) : "yeni",
                bio: user.bio || "",
                title: user.title,
                entries: []
            }
        }

        // 2. Try to match with mock users
        const mockUser = usersData.find(u => u.nick.toLowerCase() === normalizedNick)
        if (mockUser) {
            // Adapt mock user to UserProfileData format
            return {
                ...mockUser,
                picture: mockUser.avatar // mock data uses 'avatar'
            }
        }

        return null
    }, [nick, isAuthenticated, user])

    // 5. Detect if we are waiting for authentication (refreshing the page)
    const [isInitialAuthLoading, setIsInitialAuthLoading] = useState(true)

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null
        // If there's no token, we aren't waiting for loadUser
        // If there's a token and we're authenticated, we're done
        // If there's a token and we aren't loading, and aren't authenticated, maybe it failed
        if (!token || isAuthenticated || (!loading && token)) {
            setIsInitialAuthLoading(false)
        }
    }, [isAuthenticated, loading])

    const handleSaveNote = () => {
        if (nick) {
            localStorage.setItem(`note_${decodeURIComponent(nick).toLowerCase()}`, noteText)
            setShowSavedMessage(true)
            setTimeout(() => setShowSavedMessage(false), 2000)
        }
    }

    // FINAL RENDER LOGIC - Early returns only AFTER all hooks
    if (loading || !nick || isInitialAuthLoading) {
        return (
            <div className="w-full flex items-center justify-center min-h-[calc(100vh-6.5rem)] bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-[#4729ff] border-t-transparent rounded-full animate-spin" />
                    <div className="text-[#4729ff] font-medium animate-pulse">yükleniyor...</div>
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
