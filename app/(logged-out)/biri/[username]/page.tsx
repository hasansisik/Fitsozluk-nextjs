"use client"

import { TopicsSidebar } from "@/components/topics-sidebar"
import { UserProfile } from "@/components/user-profile"
import usersData from "@/data/users-profile.json"
import { notFound } from "next/navigation"
import { useEffect, useState } from "react"

interface PageProps {
    params: Promise<{
        username: string
    }>
}

export default function UserProfilePage({ params }: PageProps) {
    const [username, setUsername] = useState<string>("")
    const [isOwnProfile, setIsOwnProfile] = useState(false)
    const [noteText, setNoteText] = useState("")
    const [showSavedMessage, setShowSavedMessage] = useState(false)

    useEffect(() => {
        params.then(({ username: user }) => {
            setUsername(user)

            // Check if viewing own profile
            const mockUser = localStorage.getItem("mockUser")
            if (mockUser) {
                const currentUser = JSON.parse(mockUser)
                setIsOwnProfile(currentUser.username === decodeURIComponent(user).toLowerCase())
            }

            // Load saved note for this user
            const savedNote = localStorage.getItem(`note_${decodeURIComponent(user).toLowerCase()}`)
            if (savedNote) {
                setNoteText(savedNote)
            }
        })
    }, [params])

    const handleSaveNote = () => {
        if (username) {
            localStorage.setItem(`note_${decodeURIComponent(username).toLowerCase()}`, noteText)
            setShowSavedMessage(true)
            setTimeout(() => setShowSavedMessage(false), 2000)
        }
    }

    if (!username) {
        return <div>Yükleniyor...</div>
    }

    // Find user by username
    const userData = usersData.find(
        (user) => user.username.toLowerCase() === decodeURIComponent(username).toLowerCase()
    )

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
                    <div className="hidden xl:block w-80 border-l border-border">
                        <div className="p-4">
                            <h3 className="text-sm font-medium text-foreground mb-3">notlar</h3>
                            <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder={isOwnProfile ? `${userData.username} hakkındaki notlarım` : `${userData.username} hakkındaki notlarım`}
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
