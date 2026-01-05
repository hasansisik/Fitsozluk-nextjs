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
    nick: string
    displayName: string
    picture: string | null
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
        const filtered = allEntries.filter((entry: any) => entry.author === userData.nick)
        setUserEntries(filtered)
    }

    const handleDeleteEntry = (entryId: string) => {
        const allEntries = JSON.parse(localStorage.getItem("userEntries") || "[]")
        const filtered = allEntries.filter((entry: any) => entry.id !== entryId)
        localStorage.setItem("userEntries", JSON.stringify(filtered))
        loadUserEntries()

        // Update entry count immediately
        const localStorageEntries = filtered.filter((entry: any) => entry.author === userData.nick).length
        const jsonEntries = userData.entries?.length || 0
        setDynamicStats(prev => ({
            ...prev,
            entryCount: localStorageEntries + jsonEntries
        }))
    }

    const handleSaveBio = () => {
        localStorage.setItem(`bio_${userData.nick}`, bioText)
        setShowBioEdit(false)
        // Bio is already in bioText state, so it will show immediately
    }

    const handleBlock = () => {
        const blockedUsers = JSON.parse(localStorage.getItem("blockedUsers") || "{}")
        blockedUsers[userData.nick] = true
        localStorage.setItem("blockedUsers", JSON.stringify(blockedUsers))
        setIsBlocked(true)
        setShowBlockModal(false)
        setShowMoreMenu(false)
    }

    const handleUnblock = () => {
        const blockedUsers = JSON.parse(localStorage.getItem("blockedUsers") || "{}")
        delete blockedUsers[userData.nick]
        localStorage.setItem("blockedUsers", JSON.stringify(blockedUsers))
        setIsBlocked(false)
    }

    useEffect(() => {
        setIsMounted(true)

        // Check if viewing own profile
        const mockUser = localStorage.getItem("mockUser")
        if (mockUser) {
            const user = JSON.parse(mockUser)
            setIsOwnProfile(user.nick === userData.nick)

            // Load user's own entries if viewing own profile
            if (user.nick === userData.nick) {
                loadUserEntries()
                loadLikedEntries()
            }
        }

        // Check if already following this user
        const followedUsers = JSON.parse(localStorage.getItem("followedUsers") || "{}")
        setIsFollowing(!!followedUsers[userData.nick])

        // Check if user is blocked
        const blockedUsers = JSON.parse(localStorage.getItem("blockedUsers") || "{}")
        setIsBlocked(!!blockedUsers[userData.nick])

        // Calculate dynamic stats
        // 1. Entry count - count user's actual entries from localStorage AND JSON
        const allEntries = JSON.parse(localStorage.getItem("userEntries") || "[]")
        const localStorageEntries = allEntries.filter((entry: any) => entry.author === userData.nick).length

        // For own profile, only count localStorage entries (user's actual entries)
        // For other profiles, count both localStorage and JSON entries
        let totalEntries = localStorageEntries
        if (mockUser) {
            const user = JSON.parse(mockUser)
            if (user.nick !== userData.nick) {
                // For other users, include JSON entries
                const jsonEntries = userData.entries?.length || 0
                totalEntries = localStorageEntries + jsonEntries
            }
        }

        // 2. Follower count - count who follows this user
        const allFollowers = JSON.parse(localStorage.getItem("allFollowers") || "{}")
        const userFollowers = allFollowers[userData.nick] || []

        // 3. Following count - count who this user follows
        // For all users, check if there's a followedUsers_{username} in localStorage
        const userFollowedKey = `followedUsers_${userData.nick}`
        const userFollowedUsers = JSON.parse(localStorage.getItem(userFollowedKey) || "{}")
        const followingCount = Object.keys(userFollowedUsers).length

        setDynamicStats({
            entryCount: totalEntries,
            followerCount: userFollowers.length,
            followingCount: followingCount || userData.stats.followingCount
        })

        // Load bio from localStorage
        const savedBio = localStorage.getItem(`bio_${userData.nick}`)
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
    }, [userData.nick, userData.bio, showShareMenu, showMoreMenu, showPhotoMenu])

    // Load profile photo in separate effect after mount to avoid hydration issues
    useEffect(() => {
        if (!isMounted) return

        const savedPhoto = localStorage.getItem(`profilePhoto_${userData.nick}`)
        if (savedPhoto) {
            setProfilePhoto(savedPhoto)
        } else {
            setProfilePhoto(null)
        }
    }, [userData.nick, isMounted])

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
                                @{userData.nick}
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
        const myFollowingKey = `followedUsers_${currentUser.nick}`
        const myFollowing = JSON.parse(localStorage.getItem(myFollowingKey) || "{}")

        // Also update the global followedUsers for backward compatibility
        const globalFollowing = JSON.parse(localStorage.getItem("followedUsers") || "{}")

        if (isFollowing) {
            // Unfollow
            delete myFollowing[userData.nick]
            delete globalFollowing[userData.nick]
        } else {
            // Follow
            myFollowing[userData.nick] = {
                displayName: userData.displayName,
                followedAt: new Date().toISOString()
            }
            globalFollowing[userData.nick] = {
                displayName: userData.displayName,
                followedAt: new Date().toISOString()
            }
        }

        localStorage.setItem(myFollowingKey, JSON.stringify(myFollowing))
        localStorage.setItem("followedUsers", JSON.stringify(globalFollowing))

        // 2. Update target user's followers list
        const allFollowers = JSON.parse(localStorage.getItem("allFollowers") || "{}")
        if (!allFollowers[userData.nick]) {
            allFollowers[userData.nick] = []
        }

        if (isFollowing) {
            // Remove from followers
            allFollowers[userData.nick] = allFollowers[userData.nick].filter(
                (follower: any) => follower.nick !== currentUser.nick
            )
        } else {
            // Add to followers
            allFollowers[userData.nick].push({
                nick: currentUser.nick,
                displayName: currentUser.displayName || currentUser.nick,
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
                            <h3 className="text-lg font-medium text-foreground">biyografi düzenle</h3>
                            <button onClick={() => setShowBioEdit(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <textarea
                            value={bioText}
                            onChange={(e) => setBioText(e.target.value)}
                            placeholder="kendin hakkında bir şeyler yaz..."
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
                                    iptal
                                </button>
                                <button
                                    onClick={handleSaveBio}
                                    className="px-4 py-2 text-sm font-medium bg-[#4729ff] text-white rounded-md hover:bg-[#3820cc] transition-colors"
                                >
                                    kaydet
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* User Header */}
            <div className="p-6">
                <div className="flex items-start justify-between">
                    {/* Left: User Info */}
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-foreground mb-3">{userData.nick}</h1>

                        {/* Badges - Çaylak Box Style */}
                        <div className="flex gap-2 mb-6">
                            <div className="bg-[#f2a154] text-white text-xs px-3 py-1.5 rounded-sm font-medium">
                                çaylak
                            </div>
                        </div>

                        {/* Stats - Horizontal List Style */}
                        <div className="flex gap-1.5 text-xs text-muted-foreground mb-2">
                            <span>
                                <strong className="text-foreground font-semibold">{dynamicStats.entryCount}</strong> entry
                            </span>
                            <span>•</span>
                            <button
                                onClick={() => {
                                    const allFollowers = JSON.parse(localStorage.getItem("allFollowers") || "{}")
                                    const userFollowers = allFollowers[userData.nick] || []
                                    setFollowersList(userFollowers)
                                    setShowFollowersModal(true)
                                }}
                                className="hover:text-[#4729ff]"
                            >
                                <strong className="text-foreground font-semibold">{dynamicStats.followerCount}</strong> takipçi
                            </button>
                            <span>•</span>
                            <button
                                onClick={() => {
                                    const userFollowedKey = `followedUsers_${userData.nick}`
                                    const userFollowedUsers = JSON.parse(localStorage.getItem(userFollowedKey) || "{}")
                                    const following = Object.keys(userFollowedUsers).map(nick => ({
                                        nick,
                                        displayName: userFollowedUsers[nick].displayName
                                    }))
                                    setFollowingList(following)
                                    setShowFollowingModal(true)
                                }}
                                className="hover:text-[#4729ff]"
                            >
                                <strong className="text-foreground font-semibold">{dynamicStats.followingCount}</strong> takip
                            </button>
                        </div>

                        {/* Approval Status Message */}
                        <p className="text-xs text-muted-foreground mb-6">
                            henüz 10 entry'yi tamamlamadığınızdan onay sırasında değilsiniz.
                        </p>

                        {/* Join Date with Icon */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
                            <Calendar className="w-4 h-4" />
                            <span>{userData.joinDate}</span>
                        </div>

                        {/* Social/Action Buttons */}
                        <div className="flex gap-3 mb-6">
                            <button className="p-2 border border-border rounded-full hover:bg-secondary text-muted-foreground transition-colors shadow-sm">
                                <Share2 className="w-5 h-5" />
                            </button>
                            <button className="p-2 border border-border rounded-full hover:bg-secondary text-muted-foreground transition-colors shadow-sm">
                                <ChevronDown className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Right: Avatar */}
                    <div className="relative ml-6">
                        <div
                            className={`w-36 h-36 rounded-full bg-muted flex items-center justify-center border-4 border-white shadow-sm overflow-hidden ${isOwnProfile ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                                }`}
                            onClick={() => isOwnProfile && setShowPhotoMenu(!showPhotoMenu)}
                        >
                            {profilePhoto || userData.picture ? (
                                <img src={profilePhoto || userData.picture || undefined} alt={userData.nick} className="w-full h-full object-cover" />
                            ) : (
                                <img src="https://res.cloudinary.com/da2qwsrbv/image/upload/v1767654180291.png" className="w-full h-full object-cover" />
                            )}
                        </div>

                        {isOwnProfile && showPhotoMenu && (
                            <div className="absolute top-full right-0 mt-2 bg-white border border-border rounded-lg shadow-lg py-2 z-50 w-48">
                                <button onClick={() => { fileInputRef.current?.click(); setShowPhotoMenu(false) }} className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors">Fotoğrafı Değiştir</button>
                                {profilePhoto && <button onClick={() => { setProfilePhoto(null); localStorage.removeItem(`profilePhoto_${userData.nick}`); setShowPhotoMenu(false) }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-secondary transition-colors">Fotoğrafı Kaldır</button>}
                            </div>
                        )}
                        {/* Hidden file input */}
                        {isOwnProfile && <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0]; if (file) {
                                const reader = new FileReader(); reader.onloadend = () => {
                                    const base64String = reader.result as string; setProfilePhoto(base64String); localStorage.setItem(`profilePhoto_${userData.nick}`, base64String);
                                }; reader.readAsDataURL(file);
                            }
                        }} />}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border mb-6">
                <div className="flex gap-4 px-6">
                    {["entry'ler", "favoriler", "görseller", "istatistikler"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-2 text-sm font-medium transition-colors relative ${activeTab === tab
                                ? "text-foreground after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#4729ff]"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {tab}{tab === "istatistikler" && <ChevronDown className="inline-block ml-1 w-3 h-3" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="px-6 pb-12">
                {activeTab === "entry'ler" && (
                    <div className="text-sm text-muted-foreground">
                        {(isOwnProfile ? userEntries : userData.entries).length > 0 ? (
                            (isOwnProfile ? userEntries : userData.entries).map((entry: any) => (
                                <div key={entry.id} className="mb-8">
                                    <Link href={`/baslik/${entry.topicSlug || entry.topicTitle?.toLowerCase() || ''}`} className="text-base font-bold text-foreground hover:text-[#4729ff] block mb-2">{entry.topicTitle || entry.title}</Link>
                                    <div className="text-base text-foreground leading-relaxed whitespace-pre-wrap">{entry.content}</div>
                                </div>
                            ))
                        ) : (
                            <div className="py-2">yok ki öyle bişey</div>
                        )}
                    </div>
                )}

                {activeTab === "favoriler" && (
                    <div className="text-sm text-muted-foreground">
                        {likedEntries.length > 0 ? (
                            likedEntries.map((entry) => (
                                <div key={entry.id} className="mb-8">
                                    {entry.topicTitle && (
                                        <Link
                                            href={`/baslik/${entry.topicSlug || entry.topicTitle.toLowerCase().replace(/\s+/g, '-')}`}
                                            className="text-base font-bold text-foreground hover:text-[#4729ff] block mb-2"
                                        >
                                            {entry.topicTitle}
                                        </Link>
                                    )}
                                    <div className="text-base text-foreground leading-relaxed whitespace-pre-wrap mb-4">{entry.content}</div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Link href={`/biri/${entry.author}`} className="hover:text-[#4729ff] font-medium">{entry.author}</Link>
                                            <span>•</span>
                                            <span>{entry.date} {entry.time}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => handleUnlike(entry.id)} className="text-[#4729ff] hover:text-[#3820cc] transition-colors"><Heart className="h-4 w-4 fill-current" /></button>
                                            <button className="hover:text-[#4729ff] transition-colors"><Share2 className="h-4 w-4" /></button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-2 text-sm text-muted-foreground">yok ki öyle bişey</div>
                        )}
                    </div>
                )}

                {(activeTab === "görseller" || activeTab === "istatistikler") && (
                    <div className="py-2 text-sm text-muted-foreground">yok ki öyle bişey</div>
                )}
            </div>

            {/* Modals */}
            {showBlockModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-border">
                        <h3 className="text-lg font-medium text-foreground mb-4">Kullanıcıyı Engelle</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            <strong>@{userData.nick}</strong> kullanıcısını engellemek istediğinizden emin misiniz?
                            Engellediğiniz kullanıcıların içeriklerini göremeyeceksiniz.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowBlockModal(false)} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors">iptal</button>
                            <button onClick={handleBlock} className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">engelle</button>
                        </div>
                    </div>
                </div>
            )}

            {showReportModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-border">
                        <h3 className="text-lg font-medium text-foreground mb-4">Kullanıcıyı Şikayet Et</h3>
                        <div className="mb-4">
                            <label className="text-sm font-medium text-foreground mb-2 block">Şikayet Sebebi</label>
                            <div className="space-y-2">
                                {["Spam içerik paylaşıyor", "Hakaret ve küfür içeriyor", "Yanıltıcı bilgi yayıyor", "Taciz edici davranışlar", "Telif hakkı ihlali"].map((reason) => (
                                    <label key={reason} className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="reportReason" value={reason} checked={reportReason === reason} onChange={(e) => setReportReason(e.target.value)} className="w-4 h-4 text-[#4729ff] focus:ring-[#4729ff]" />
                                        <span className="text-sm text-foreground">{reason}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="text-sm font-medium text-foreground mb-2 block">Açıklama (İsteğe bağlı)</label>
                            <textarea value={reportText} onChange={(e) => setReportText(e.target.value)} placeholder="Şikayetinizle ilgili detayları buraya yazabilirsiniz..." className="w-full h-24 px-3 py-2 text-sm border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#4729ff]" />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => { setShowReportModal(false); setReportReason(""); setReportText(""); }} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors">iptal</button>
                            <button onClick={() => { if (!reportReason) { alert('Lütfen bir şikayet sebebi seçin'); return; } setShowReportModal(false); setReportReason(""); setReportText(""); alert('Şikayetiniz alındı. Teşekkür ederiz.'); }} className="px-4 py-2 text-sm font-medium bg-[#4729ff] text-white rounded-md hover:bg-[#3820cc] transition-colors">gönder</button>
                        </div>
                    </div>
                </div>
            )}

            {showFollowersModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50" onClick={() => setShowFollowersModal(false)}>
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-border max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-foreground">takipçiler</h3>
                            <button onClick={() => setShowFollowersModal(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {followersList.length > 0 ? (
                                <div className="space-y-2">
                                    {followersList.map((follower: any, index: number) => (
                                        <Link key={index} href={`/biri/${follower.nick}`} className="flex items-center gap-3 p-3 hover:bg-secondary rounded-lg transition-colors" onClick={() => setShowFollowersModal(false)}>
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"><User className="w-5 h-5 text-muted-foreground" /></div>
                                            <div>
                                                <div className="font-medium text-foreground">{follower.displayName}</div>
                                                <div className="text-sm text-muted-foreground">@{follower.nick}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">henüz takipçi yok</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showFollowingModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50" onClick={() => setShowFollowingModal(false)}>
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-border max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-foreground">takip edilenler</h3>
                            <button onClick={() => setShowFollowingModal(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {followingList.length > 0 ? (
                                <div className="space-y-2">
                                    {followingList.map((user: any, index: number) => (
                                        <Link key={index} href={`/biri/${user.nick}`} className="flex items-center gap-3 p-3 hover:bg-secondary rounded-lg transition-colors" onClick={() => setShowFollowingModal(false)}>
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"><User className="w-5 h-5 text-muted-foreground" /></div>
                                            <div>
                                                <div className="font-medium text-foreground">{user.displayName}</div>
                                                <div className="text-sm text-muted-foreground">@{user.nick}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">henüz kimse takip edilmiyor</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
