"use client"

import { useState, useEffect, useRef } from "react"
import { User, Calendar, Share2, MoreVertical, Edit, X, ChevronDown, Heart } from "lucide-react"
import Link from "next/link"
import { EntryCard } from "@/components/entry-card"

interface Badge {
    type: string
    title: string
    icon: string
    color: string
}

interface UserStats {
    entryCount: number
    followerCount: number
    followingCount: number
}

interface Entry {
    id: string
    title: string
    content: string
    date: string
    time: string
}

interface UserProfileData {
    id: string
    username: string
    displayName: string
    avatar: string | null
    badges: Badge[]
    stats: UserStats
    joinDate: string
    bio: string
    entries: Entry[]
}

interface UserProfileProps {
    userData: UserProfileData
}

export function UserProfile({ userData }: UserProfileProps) {
    const [activeTab, setActiveTab] = useState("entry'ler")
    const [isOwnProfile, setIsOwnProfile] = useState(false)
    const [isFollowing, setIsFollowing] = useState(false)
    const [showBioEdit, setShowBioEdit] = useState(false)
    const [showShareMenu, setShowShareMenu] = useState(false)
    const [showMoreMenu, setShowMoreMenu] = useState(false)
    const [showBlockModal, setShowBlockModal] = useState(false)
    const [isBlocked, setIsBlocked] = useState(false)
    const [showReportModal, setShowReportModal] = useState(false)
    const [reportReason, setReportReason] = useState("")
    const [reportText, setReportText] = useState("")
    const [showFollowersModal, setShowFollowersModal] = useState(false)
    const [showFollowingModal, setShowFollowingModal] = useState(false)
    const [followersList, setFollowersList] = useState<any[]>([])
    const [followingList, setFollowingList] = useState<any[]>([])
    const [dynamicStats, setDynamicStats] = useState({
        entryCount: 0,
        followerCount: 0,
        followingCount: 0
    })
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [showPhotoMenu, setShowPhotoMenu] = useState(false)
    const [bioText, setBioText] = useState("")
    const [likedEntries, setLikedEntries] = useState<any[]>([])
    const [userEntries, setUserEntries] = useState<any[]>([])
    const [isMounted, setIsMounted] = useState(false)

    const loadLikedEntries = () => {
        const liked = JSON.parse(localStorage.getItem("likedEntries") || "{}")
        const likedArray = Object.entries(liked).map(([id, data]: [string, any]) => ({
            id,
            ...data
        }))
        setLikedEntries(likedArray)
    }

    const loadUserEntries = () => {
        const allEntries = JSON.parse(localStorage.getItem("userEntries") || "[]")
        const filtered = allEntries.filter((entry: any) => entry.author === userData.username)
        setUserEntries(filtered)
    }

    const handleDeleteEntry = (entryId: string) => {
        const allEntries = JSON.parse(localStorage.getItem("userEntries") || "[]")
        const filtered = allEntries.filter((entry: any) => entry.id !== entryId)
        localStorage.setItem("userEntries", JSON.stringify(filtered))
        loadUserEntries()

        // Update entry count immediately
        const localStorageEntries = filtered.filter((entry: any) => entry.author === userData.username).length
        const jsonEntries = userData.entries?.length || 0
        setDynamicStats(prev => ({
            ...prev,
            entryCount: localStorageEntries + jsonEntries
        }))
    }

    const handleSaveBio = () => {
        localStorage.setItem(`bio_${userData.username}`, bioText)
        setShowBioEdit(false)
        // Bio is already in bioText state, so it will show immediately
    }

    const handleBlock = () => {
        const blockedUsers = JSON.parse(localStorage.getItem("blockedUsers") || "{}")
        blockedUsers[userData.username] = true
        localStorage.setItem("blockedUsers", JSON.stringify(blockedUsers))
        setIsBlocked(true)
        setShowBlockModal(false)
        setShowMoreMenu(false)
    }

    const handleUnblock = () => {
        const blockedUsers = JSON.parse(localStorage.getItem("blockedUsers") || "{}")
        delete blockedUsers[userData.username]
        localStorage.setItem("blockedUsers", JSON.stringify(blockedUsers))
        setIsBlocked(false)
    }

    useEffect(() => {
        setIsMounted(true)

        // Check if viewing own profile
        const mockUser = localStorage.getItem("mockUser")
        if (mockUser) {
            const user = JSON.parse(mockUser)
            setIsOwnProfile(user.username === userData.username)

            // Load user's own entries if viewing own profile
            if (user.username === userData.username) {
                loadUserEntries()
                loadLikedEntries()
            }
        }

        // Check if already following this user
        const followedUsers = JSON.parse(localStorage.getItem("followedUsers") || "{}")
        setIsFollowing(!!followedUsers[userData.username])

        // Check if user is blocked
        const blockedUsers = JSON.parse(localStorage.getItem("blockedUsers") || "{}")
        setIsBlocked(!!blockedUsers[userData.username])

        // Calculate dynamic stats
        // 1. Entry count - count user's actual entries from localStorage AND JSON
        const allEntries = JSON.parse(localStorage.getItem("userEntries") || "[]")
        const localStorageEntries = allEntries.filter((entry: any) => entry.author === userData.username).length

        // For own profile, only count localStorage entries (user's actual entries)
        // For other profiles, count both localStorage and JSON entries
        let totalEntries = localStorageEntries
        if (mockUser) {
            const user = JSON.parse(mockUser)
            if (user.username !== userData.username) {
                // For other users, include JSON entries
                const jsonEntries = userData.entries?.length || 0
                totalEntries = localStorageEntries + jsonEntries
            }
        }

        // 2. Follower count - count who follows this user
        const allFollowers = JSON.parse(localStorage.getItem("allFollowers") || "{}")
        const userFollowers = allFollowers[userData.username] || []

        // 3. Following count - count who this user follows
        // For all users, check if there's a followedUsers_{username} in localStorage
        const userFollowedKey = `followedUsers_${userData.username}`
        const userFollowedUsers = JSON.parse(localStorage.getItem(userFollowedKey) || "{}")
        const followingCount = Object.keys(userFollowedUsers).length

        setDynamicStats({
            entryCount: totalEntries,
            followerCount: userFollowers.length,
            followingCount: followingCount || userData.stats.followingCount
        })

        // Load bio from localStorage
        const savedBio = localStorage.getItem(`bio_${userData.username}`)
        // Click outside handler to close share menu
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            if (!target.closest('.share-menu-container') && !target.closest('.more-menu-container') && !target.closest('.relative')) {
                setShowShareMenu(false)
                setShowMoreMenu(false)
                setShowPhotoMenu(false)
            }
        }

        if (showShareMenu || showMoreMenu || showPhotoMenu) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [userData.username, userData.bio, showShareMenu, showMoreMenu, showPhotoMenu])

    // Load profile photo in separate effect after mount to avoid hydration issues
    useEffect(() => {
        if (!isMounted) return

        const savedPhoto = localStorage.getItem(`profilePhoto_${userData.username}`)
        if (savedPhoto) {
            setProfilePhoto(savedPhoto)
        } else {
            setProfilePhoto(null)
        }
    }, [userData.username, isMounted])

    if (!isMounted) {
        return null
    }

    // Show blocked user message if user is blocked
    if (isBlocked && !isOwnProfile) {
        return (
            <div className="w-full bg-white">
                <div className="max-w-[900px] mx-auto px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <div className="mb-6">
                            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                <User className="w-16 h-16 text-muted-foreground" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-2">
                                {userData.displayName}
                            </h2>
                            <p className="text-muted-foreground mb-6">
                                @{userData.username}
                            </p>
                        </div>
                        <div className="bg-secondary border border-border rounded-lg p-8 max-w-md mx-auto">
                            <p className="text-foreground mb-4">
                                Bu kullanıcıyı engellediniz
                            </p>
                            <button
                                onClick={handleUnblock}
                                className="px-6 py-2 bg-[#4729ff] text-white rounded-md text-sm font-medium hover:bg-[#3820cc] transition-colors"
                            >
                                Engeli Kaldır
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const handleFollow = () => {
        // Get current user
        const mockUser = localStorage.getItem("mockUser")
        if (!mockUser) return

        const currentUser = JSON.parse(mockUser)

        // 1. Update current user's following list
        const myFollowingKey = `followedUsers_${currentUser.username}`
        const myFollowing = JSON.parse(localStorage.getItem(myFollowingKey) || "{}")

        // Also update the global followedUsers for backward compatibility
        const globalFollowing = JSON.parse(localStorage.getItem("followedUsers") || "{}")

        if (isFollowing) {
            // Unfollow
            delete myFollowing[userData.username]
            delete globalFollowing[userData.username]
        } else {
            // Follow
            myFollowing[userData.username] = {
                displayName: userData.displayName,
                followedAt: new Date().toISOString()
            }
            globalFollowing[userData.username] = {
                displayName: userData.displayName,
                followedAt: new Date().toISOString()
            }
        }

        localStorage.setItem(myFollowingKey, JSON.stringify(myFollowing))
        localStorage.setItem("followedUsers", JSON.stringify(globalFollowing))

        // 2. Update target user's followers list
        const allFollowers = JSON.parse(localStorage.getItem("allFollowers") || "{}")
        if (!allFollowers[userData.username]) {
            allFollowers[userData.username] = []
        }

        if (isFollowing) {
            // Remove from followers
            allFollowers[userData.username] = allFollowers[userData.username].filter(
                (follower: any) => follower.username !== currentUser.username
            )
        } else {
            // Add to followers
            allFollowers[userData.username].push({
                username: currentUser.username,
                displayName: currentUser.displayName || currentUser.username,
                followedAt: new Date().toISOString()
            })
        }

        localStorage.setItem("allFollowers", JSON.stringify(allFollowers))
        setIsFollowing(!isFollowing)

        // Refresh stats
        window.location.reload()
    }

    const handleUnlike = (entryId: string) => {
        const likedEntries = JSON.parse(localStorage.getItem("likedEntries") || "{}")
        delete likedEntries[entryId]
        localStorage.setItem("likedEntries", JSON.stringify(likedEntries))
        // Reload liked entries to update the list
        loadLikedEntries()
    }

    const tabs = isOwnProfile ? [
        { id: "entry'ler", label: "entry'ler" },
        { id: "favoriler", label: "favoriler" },
        { id: "görseller", label: "görseller" }
    ] : [
        { id: "entry'ler", label: "entry'ler" },
        { id: "görseller", label: "görseller" }
    ]

    return (
        <div className="w-full">
            {/* Bio Edit Modal */}
            {showBioEdit && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowBioEdit(false)}>
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-foreground">Biyografi Düzenle</h3>
                            <button onClick={() => setShowBioEdit(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <textarea
                            value={bioText}
                            onChange={(e) => setBioText(e.target.value)}
                            placeholder="Kendin hakkında bir şeyler yaz..."
                            className="w-full h-32 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4729ff] resize-none"
                            maxLength={200}
                        />
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-xs text-muted-foreground">{bioText.length}/200</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowBioEdit(false)}
                                    className="px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleSaveBio}
                                    className="px-4 py-2 text-sm font-medium bg-[#4729ff] text-white rounded-md hover:bg-[#3820cc] transition-colors"
                                >
                                    Kaydet
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* User Header */}
            <div className="border-b border-border p-6">
                <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div className="relative">
                        <div
                            className={`w-32 h-32 rounded-full bg-muted flex items-center justify-center flex-shrink-0 border-4 border-white shadow-lg overflow-hidden ${isOwnProfile ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                                }`}
                            onClick={() => isOwnProfile && setShowPhotoMenu(!showPhotoMenu)}
                            title={isOwnProfile ? 'Profil fotoğrafı seçenekleri' : ''}
                        >
                            {profilePhoto || userData.avatar ? (
                                <img src={profilePhoto || userData.avatar || undefined} alt={userData.username} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-16 h-16 text-muted-foreground" />
                            )}
                        </div>

                        {/* Photo Menu */}
                        {isOwnProfile && showPhotoMenu && (
                            <div className="absolute top-full left-0 mt-2 bg-white border border-border rounded-lg shadow-lg py-2 z-50 w-48">
                                <button
                                    onClick={() => {
                                        fileInputRef.current?.click()
                                        setShowPhotoMenu(false)
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors"
                                >
                                    Fotoğrafı Değiştir
                                </button>
                                {profilePhoto && (
                                    <button
                                        onClick={() => {
                                            setProfilePhoto(null)
                                            localStorage.removeItem(`profilePhoto_${userData.username}`)
                                            setShowPhotoMenu(false)
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-secondary transition-colors"
                                    >
                                        Fotoğrafı Kaldır
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Hidden file input */}
                        {isOwnProfile && (
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        const reader = new FileReader()
                                        reader.onloadend = () => {
                                            const base64String = reader.result as string
                                            console.log('Saving profile photo for:', userData.username)
                                            setProfilePhoto(base64String)
                                            localStorage.setItem(`profilePhoto_${userData.username}`, base64String)
                                            console.log('Profile photo saved to localStorage')
                                        }
                                        reader.readAsDataURL(file)
                                    }
                                }}
                            />
                        )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-foreground mb-3">{userData.displayName}</h1>

                        {/* Badges */}
                        {userData.badges.length > 0 && (
                            <div className="flex gap-2 mb-3">
                                {userData.badges.map((badge, index) => (
                                    <div
                                        key={index}
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-md"
                                        style={{ backgroundColor: badge.color }}
                                        title={badge.title}
                                    >
                                        {badge.icon}
                                    </div>
                                ))}
                                <span className="text-xs text-muted-foreground self-center ml-2">tümü</span>
                            </div>
                        )}

                        {/* Stats */}
                        <div className="flex gap-4 text-sm mb-3">
                            <span>
                                <strong className="text-foreground">{dynamicStats.entryCount}</strong>{" "}
                                <span className="text-muted-foreground">entry</span>
                            </span>
                            <button
                                onClick={() => {
                                    // Load followers from localStorage
                                    const allFollowers = JSON.parse(localStorage.getItem("allFollowers") || "{}")
                                    const userFollowers = allFollowers[userData.username] || []
                                    setFollowersList(userFollowers)
                                    setShowFollowersModal(true)
                                }}
                                className="hover:text-[#4729ff] transition-colors cursor-pointer"
                            >
                                <strong className="text-foreground">{dynamicStats.followerCount}</strong>{" "}
                                <span className="text-muted-foreground">takipçi</span>
                            </button>
                            <button
                                onClick={() => {
                                    // Load following from localStorage - use user-specific key
                                    const userFollowedKey = `followedUsers_${userData.username}`
                                    const userFollowedUsers = JSON.parse(localStorage.getItem(userFollowedKey) || "{}")
                                    const following = Object.keys(userFollowedUsers).map(username => ({
                                        username,
                                        displayName: userFollowedUsers[username].displayName
                                    }))
                                    setFollowingList(following)
                                    setShowFollowingModal(true)
                                }}
                                className="hover:text-[#4729ff] transition-colors cursor-pointer"
                            >
                                <strong className="text-foreground">{dynamicStats.followingCount}</strong>{" "}
                                <span className="text-muted-foreground">takip</span>
                            </button>
                        </div>

                        {/* Join Date */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                            <Calendar className="w-4 h-4" />
                            <span>{userData.joinDate}</span>
                        </div>

                        {/* Bio */}
                        {bioText && (
                            <p className="text-sm text-foreground mb-4">{bioText}</p>
                        )}

                        {/* Action Buttons - Different for own profile vs others */}
                        {!isOwnProfile && (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleFollow}
                                    className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${isFollowing
                                        ? "bg-secondary text-foreground border border-border hover:bg-muted"
                                        : "bg-[#4729ff] text-white hover:bg-[#3820cc]"
                                        }`}
                                >
                                    {isFollowing ? "takip ediliyor" : "takip et"}
                                </button>
                                <div className="relative share-menu-container">
                                    <button
                                        onClick={() => setShowShareMenu(!showShareMenu)}
                                        className="p-2 rounded-full hover:bg-secondary transition-colors border border-border"
                                        title="Profili Paylaş"
                                    >
                                        <Share2 className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                    {showShareMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-lg shadow-lg py-2 z-50">
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(window.location.href)
                                                    alert('Profil linki kopyalandı!')
                                                    setShowShareMenu(false)
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors"
                                            >
                                                Linki Kopyala
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="relative more-menu-container">
                                    <button
                                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                                        className="p-2 rounded-full hover:bg-secondary transition-colors border border-border"
                                        title="Daha Fazla"
                                    >
                                        <MoreVertical className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                    {showMoreMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-lg shadow-lg py-2 z-50">
                                            <button
                                                onClick={() => {
                                                    setShowReportModal(true)
                                                    setShowMoreMenu(false)
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors"
                                            >
                                                Şikayet Et
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowBlockModal(true)
                                                    setShowMoreMenu(false)
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-secondary transition-colors"
                                            >
                                                Engelle
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {isOwnProfile && (
                            <div className="flex gap-2 relative share-menu-container">
                                <button
                                    onClick={() => setShowShareMenu(!showShareMenu)}
                                    className="p-2 rounded-full hover:bg-secondary transition-colors border border-border"
                                    title="Paylaş"
                                >
                                    <Share2 className="w-5 h-5 text-muted-foreground" />
                                </button>

                                {/* Share Menu */}
                                {showShareMenu && (
                                    <div className="absolute top-full right-0 mt-2 bg-white border border-border rounded-lg shadow-lg p-2 z-10 min-w-[200px]">
                                        <button
                                            onClick={() => {
                                                const url = window.location.href
                                                const text = `${userData.displayName} (@${userData.username}) - ekşi sözlük`
                                                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
                                                setShowShareMenu(false)
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-secondary rounded-md transition-colors"
                                        >
                                            Twitter'da Paylaş
                                        </button>
                                        <button
                                            onClick={() => {
                                                const url = window.location.href
                                                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
                                                setShowShareMenu(false)
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-secondary rounded-md transition-colors"
                                        >
                                            Facebook'ta Paylaş
                                        </button>
                                        <button
                                            onClick={() => {
                                                const url = window.location.href
                                                const text = `${userData.displayName} (@${userData.username}) - ekşi sözlük`
                                                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
                                                setShowShareMenu(false)
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-secondary rounded-md transition-colors"
                                        >
                                            WhatsApp'ta Paylaş
                                        </button>
                                        <button
                                            onClick={() => {
                                                const url = window.location.href
                                                navigator.clipboard.writeText(url)
                                                setShowShareMenu(false)
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-secondary rounded-md transition-colors"
                                        >
                                            Linki Kopyala
                                        </button>
                                    </div>
                                )}

                                <button
                                    onClick={() => setShowBioEdit(true)}
                                    className="px-4 py-2 rounded-md text-sm font-medium bg-secondary hover:bg-muted transition-colors border border-border"
                                    title="Biyografi Ekle"
                                >
                                    Biyografi Ekle
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border">
                <div className="flex gap-6 px-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-3 text-sm font-medium transition-colors relative ${activeTab === tab.id
                                ? "text-[#4729ff] border-b-2 border-[#4729ff]"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === "entry'ler" && (
                    <div>
                        {(isOwnProfile ? userEntries : userData.entries).length > 0 ? (
                            (isOwnProfile ? userEntries : userData.entries).map((entry: any) => (
                                <div key={entry.id}>
                                    {/* Entry Title - Only for user entries with topic */}
                                    {entry.topicTitle && (
                                        <div className="px-6 pt-4 pb-2">
                                            <Link href={`/baslik/${entry.topicSlug}`} className="text-base font-medium text-foreground hover:text-[#4729ff] transition-colors">
                                                {entry.topicTitle}
                                            </Link>
                                        </div>
                                    )}
                                    {!entry.topicTitle && entry.title && (
                                        <div className="px-6 pt-4 pb-2">
                                            <a href="#" className="text-base font-medium text-foreground hover:text-[#4729ff] transition-colors">
                                                {entry.title}
                                            </a>
                                        </div>
                                    )}

                                    {/* Use EntryCard component */}
                                    <EntryCard
                                        id={entry.id}
                                        content={entry.content}
                                        author={entry.author || userData.username}
                                        date={entry.date}
                                        time={entry.time}
                                        isSpecial={entry.isSpecial}
                                        onDelete={isOwnProfile ? handleDeleteEntry : undefined}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="p-6">
                                <p className="text-center text-sm text-muted-foreground py-8">
                                    yok öyle bişey
                                </p>
                            </div>
                        )}
                    </div>
                )}


                {activeTab === "favoriler" && (
                    <div>
                        {likedEntries.length > 0 ? (
                            likedEntries.map((entry) => (
                                <div key={entry.id} className="border-b border-border p-6">
                                    {/* Topic Title */}
                                    {entry.topicTitle && (
                                        <Link
                                            href={`/baslik/${entry.topicSlug || entry.topicTitle.toLowerCase().replace(/\s+/g, '-')}`}
                                            className="text-base font-medium text-foreground hover:text-[#4729ff] transition-colors mb-3 block"
                                        >
                                            {entry.topicTitle}
                                        </Link>
                                    )}

                                    {/* Entry Content */}
                                    <p className="text-base leading-relaxed text-foreground mb-4 whitespace-pre-wrap">
                                        {entry.content}
                                    </p>

                                    {/* Entry Footer */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                                            </div>
                                            <a href={`/biri/${entry.author}`} className="text-sm text-muted-foreground hover:text-[#4729ff] transition-colors">
                                                {entry.author}
                                            </a>
                                            <span className="text-sm text-muted-foreground">
                                                {entry.date} {entry.time}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleUnlike(entry.id)}
                                                className="text-[#4729ff] hover:text-[#3820cc] transition-colors"
                                                title="Favorilerden çıkar"
                                            >
                                                <Heart className="h-4 w-4 fill-current" />
                                            </button>
                                            <button className="text-muted-foreground hover:text-[#4729ff] transition-colors">
                                                <Share2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-6">
                                <p className="text-center text-sm text-muted-foreground py-8">
                                    henüz favori eklenmemiş
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "görseller" && (
                    <div className="p-6">
                        <p className="text-center text-sm text-muted-foreground py-8">
                            henüz görsel eklenmemiş
                        </p>
                    </div>
                )}
            </div>

            {/* Block Confirmation Modal */}
            {showBlockModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-border">
                        <h3 className="text-lg font-medium text-foreground mb-4">
                            Kullanıcıyı Engelle
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            <strong>@{userData.username}</strong> kullanıcısını engellemek istediğinizden emin misiniz?
                            Engellediğiniz kullanıcıların içeriklerini göremeyeceksiniz.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowBlockModal(false)}
                                className="px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleBlock}
                                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                Engelle
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-border">
                        <h3 className="text-lg font-medium text-foreground mb-4">
                            Kullanıcıyı Şikayet Et
                        </h3>

                        {/* Common Report Reasons */}
                        <div className="mb-4">
                            <label className="text-sm font-medium text-foreground mb-2 block">
                                Şikayet Sebebi
                            </label>
                            <div className="space-y-2">
                                {[
                                    "Spam içerik paylaşıyor",
                                    "Hakaret ve küfür içeriyor",
                                    "Yanıltıcı bilgi yayıyor",
                                    "Taciz edici davranışlar",
                                    "Telif hakkı ihlali"
                                ].map((reason) => (
                                    <label key={reason} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="reportReason"
                                            value={reason}
                                            checked={reportReason === reason}
                                            onChange={(e) => setReportReason(e.target.value)}
                                            className="w-4 h-4 text-[#4729ff] focus:ring-[#4729ff]"
                                        />
                                        <span className="text-sm text-foreground">{reason}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Additional Details */}
                        <div className="mb-6">
                            <label className="text-sm font-medium text-foreground mb-2 block">
                                Açıklama (İsteğe bağlı)
                            </label>
                            <textarea
                                value={reportText}
                                onChange={(e) => setReportText(e.target.value)}
                                placeholder="Şikayetinizle ilgili detayları buraya yazabilirsiniz..."
                                className="w-full h-24 px-3 py-2 text-sm border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#4729ff]"
                            />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowReportModal(false)
                                    setReportReason("")
                                    setReportText("")
                                }}
                                className="px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={() => {
                                    if (!reportReason) {
                                        alert('Lütfen bir şikayet sebebi seçin')
                                        return
                                    }
                                    // Here you would send the report to your backend
                                    console.log('Report:', { username: userData.username, reason: reportReason, text: reportText })
                                    alert('Şikayetiniz alındı. Teşekkür ederiz.')
                                    setShowReportModal(false)
                                    setReportReason("")
                                    setReportText("")
                                }}
                                className="px-4 py-2 text-sm font-medium bg-[#4729ff] text-white rounded-md hover:bg-[#3820cc] transition-colors"
                            >
                                Gönder
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Followers Modal */}
            {showFollowersModal && (
                <div
                    className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50"
                    onClick={() => setShowFollowersModal(false)}
                >
                    <div
                        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-border max-h-[80vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-foreground">
                                Takipçiler
                            </h3>
                            <button
                                onClick={() => setShowFollowersModal(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1">
                            {followersList.length > 0 ? (
                                <div className="space-y-2">
                                    {followersList.map((follower: any, index: number) => (
                                        <Link
                                            key={index}
                                            href={`/biri/${follower.username}`}
                                            className="flex items-center gap-3 p-3 hover:bg-secondary rounded-lg transition-colors"
                                            onClick={() => setShowFollowersModal(false)}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                                <User className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-foreground">{follower.displayName}</div>
                                                <div className="text-sm text-muted-foreground">@{follower.username}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">
                                    Henüz takipçi yok
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Following Modal */}
            {showFollowingModal && (
                <div
                    className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50"
                    onClick={() => setShowFollowingModal(false)}
                >
                    <div
                        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-border max-h-[80vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-foreground">
                                Takip Edilenler
                            </h3>
                            <button
                                onClick={() => setShowFollowingModal(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1">
                            {followingList.length > 0 ? (
                                <div className="space-y-2">
                                    {followingList.map((user: any, index: number) => (
                                        <Link
                                            key={index}
                                            href={`/biri/${user.username}`}
                                            className="flex items-center gap-3 p-3 hover:bg-secondary rounded-lg transition-colors"
                                            onClick={() => setShowFollowingModal(false)}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                                <User className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-foreground">{user.displayName}</div>
                                                <div className="text-sm text-muted-foreground">@{user.username}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">
                                    Henüz kimse takip edilmiyor
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
