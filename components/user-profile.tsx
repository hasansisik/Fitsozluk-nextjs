"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Share2, Calendar, ChevronDown, User, X, Camera, MoreHorizontal, Settings, Ban, Trash2, Heart, Shield, Star, Award, Search, MessageSquare, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { useRouter } from "next/navigation"
import { editProfile, loadUser, followUser, unfollowUser } from "@/redux/actions/userActions"

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
    topicTitle?: string
    topicSlug?: string
    author?: string
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
    title?: string
}

interface UserProfileProps {
    userData: UserProfileData
}

export function UserProfile({ userData }: UserProfileProps) {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { user, isAuthenticated } = useAppSelector((state) => state.user)

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
    const [bioText, setBioText] = useState(userData.bio || "")
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

    const handleSaveBio = () => {
        localStorage.setItem(`bio_${userData.nick}`, bioText)
        setShowBioEdit(false)
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

        if (isAuthenticated && user) {
            setIsOwnProfile(user.nick?.toLowerCase() === userData.nick?.toLowerCase())

            // Check if already following
            if (user.following && user.following.includes(userData.id)) {
                setIsFollowing(true)
            } else {
                // Fallback to localStorage for mock functionality if needed
                const followedUsers = JSON.parse(localStorage.getItem("followedUsers") || "{}")
                setIsFollowing(!!followedUsers[userData.nick])
            }
        }

        // Check if user is blocked
        const blockedUsers = JSON.parse(localStorage.getItem("blockedUsers") || "{}")
        setIsBlocked(!!blockedUsers[userData.nick])

        // Load specific entries
        loadUserEntries()
        loadLikedEntries()

        // Sync dynamic stats
        setDynamicStats({
            entryCount: (userData.entries?.length || 0) + userEntries.length,
            followerCount: userData.stats?.followerCount || 0,
            followingCount: userData.stats?.followingCount || 0
        })

        // Bio from localStorage
        const savedBio = localStorage.getItem(`bio_${userData.nick}`)
        if (savedBio) setBioText(savedBio)

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            if (!target.closest('.share-menu-container') && !target.closest('.more-menu-container')) {
                setShowShareMenu(false)
                setShowMoreMenu(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [userData.nick, isAuthenticated, user, isMounted])

    useEffect(() => {
        if (!isMounted) return
        const savedPhoto = localStorage.getItem(`profilePhoto_${userData.nick}`)
        if (savedPhoto) setProfilePhoto(savedPhoto)
    }, [userData.nick, isMounted])

    if (!isMounted) return null

    if (isBlocked && !isOwnProfile) {
        return (
            <div className="w-full bg-white">
                <div className="max-w-[900px] mx-auto px-6 lg:px-8 py-16 text-center">
                    <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <User className="w-16 h-16 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{userData.displayName}</h2>
                    <p className="text-muted-foreground mb-6">@{userData.nick}</p>
                    <div className="bg-secondary p-8 rounded-lg max-w-md mx-auto">
                        <p className="mb-4">Bu kullanıcıyı engellediniz</p>
                        <button onClick={handleUnblock} className="px-6 py-2 bg-[#4729ff] text-white rounded-md">Engeli Kaldır</button>
                    </div>
                </div>
            </div>
        )
    }

    const handleFollow = async () => {
        if (!isAuthenticated) {
            router.push('/giris')
            return
        }

        if (isFollowing) {
            await dispatch(unfollowUser(userData.id))
            setDynamicStats(prev => ({ ...prev, followerCount: prev.followerCount - 1 }))
        } else {
            await dispatch(followUser(userData.id))
            setDynamicStats(prev => ({ ...prev, followerCount: prev.followerCount + 1 }))
        }
        setIsFollowing(!isFollowing)
    }

    const tabs = [
        { id: "entry'ler", label: "entry'ler" },
        { id: "beğeniler", label: "beğeniler" },
        { id: "beğenilmeyenler", label: "beğenilmeyenler" },
        { id: "favoriler", label: "favoriler" }
    ]

    return (
        <div className="w-full">
            {/* Bio Edit Modal */}
            {showBioEdit && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowBioEdit(false)}>
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">biyografi düzenle</h3>
                            <button onClick={() => setShowBioEdit(false)}><X className="w-5 h-5" /></button>
                        </div>
                        <textarea
                            value={bioText}
                            onChange={(e) => setBioText(e.target.value)}
                            className="w-full h-32 p-3 border rounded-md focus:ring-2 focus:ring-[#4729ff] outline-none"
                            maxLength={200}
                        />
                        <div className="flex justify-between mt-4">
                            <span className="text-xs text-muted-foreground">{bioText.length}/200</span>
                            <div className="flex gap-2">
                                <button onClick={() => setShowBioEdit(false)} className="px-4 py-2 text-sm font-medium">iptal</button>
                                <button onClick={handleSaveBio} className="px-4 py-2 text-sm font-medium bg-[#4729ff] text-white rounded-md">kaydet</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <h1 className="text-2xl font-bold">{userData.nick}</h1>
                            {!isOwnProfile && (
                                <button
                                    onClick={handleFollow}
                                    className={`px-4 py-1 rounded-full text-xs font-semibold transition-all ${isFollowing ? "bg-secondary text-foreground" : "bg-[#4729ff] text-white"
                                        }`}
                                >
                                    {isFollowing ? "takipten vazgeç" : "takip et"}
                                </button>
                            )}
                        </div>

                        <div className="flex gap-2 mb-6">
                            <div className={`text-white text-xs px-3 py-1.5 rounded-sm font-medium ${userData.title === 'çaylak' ? 'bg-[#f2a154]' :
                                userData.title === 'yazar' ? 'bg-[#4729ff]' :
                                    userData.title === 'usta' ? 'bg-[#2ecc71]' :
                                        userData.title === 'moderatör' ? 'bg-[#e74c3c]' :
                                            userData.title === 'admin' ? 'bg-[#9b59b6]' : 'bg-[#f2a154]'
                                }`}>
                                {userData.title || 'çaylak'}
                            </div>
                        </div>

                        <div className="flex gap-1.5 text-xs text-muted-foreground mb-2">
                            <span><strong className="text-foreground">{dynamicStats.entryCount}</strong> entry</span>
                            <span>•</span>
                            <button onClick={() => setShowFollowersModal(true)} className="hover:text-[#4729ff]">
                                <strong className="text-foreground">{dynamicStats.followerCount}</strong> takipçi
                            </button>
                            <span>•</span>
                            <button onClick={() => setShowFollowingModal(true)} className="hover:text-[#4729ff]">
                                <strong className="text-foreground">{dynamicStats.followingCount}</strong> takip
                            </button>
                        </div>

                        <p className="text-xs text-muted-foreground mb-6">henüz 10 entry'yi tamamlamadığınızdan onay sırasında değilsiniz.</p>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
                            <Calendar className="w-4 h-4" />
                            <span>{userData.joinDate}</span>
                        </div>

                        <div className="flex gap-3 mb-6">
                            <button className="p-2 border rounded-full hover:bg-secondary transition-colors"><Share2 className="w-5 h-5" /></button>
                            <button className="p-2 border rounded-full hover:bg-secondary transition-colors"><ChevronDown className="w-5 h-5" /></button>
                        </div>
                    </div>

                    <div className="relative ml-6">
                        <div
                            className={`w-36 h-36 rounded-full bg-muted flex items-center justify-center border-4 border-white shadow-sm overflow-hidden ${isOwnProfile ? 'cursor-pointer hover:opacity-80' : ''}`}
                            onClick={() => isOwnProfile && setShowPhotoMenu(!showPhotoMenu)}
                        >
                            {profilePhoto || userData.picture ? (
                                <img src={profilePhoto || userData.picture || undefined} className="w-full h-full object-cover" alt={userData.nick} />
                            ) : (
                                <img src="https://res.cloudinary.com/da2qwsrbv/image/upload/v1767654180291.png" className="w-full h-full object-cover" alt="default" />
                            )}
                        </div>
                        {isOwnProfile && showPhotoMenu && (
                            <div className="absolute top-full right-0 mt-2 bg-white border rounded-lg shadow-lg py-2 z-50 w-48">
                                <button onClick={() => fileInputRef.current?.click()} className="w-full text-left px-4 py-2 text-sm hover:bg-secondary">Fotoğrafı Değiştir</button>
                                {profilePhoto && <button onClick={() => { setProfilePhoto(null); localStorage.removeItem(`profilePhoto_${userData.nick}`) }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-secondary">Fotoğrafı Kaldır</button>}
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0]; if (file) {
                                const reader = new FileReader(); reader.onloadend = () => {
                                    const base64 = reader.result as string; setProfilePhoto(base64); localStorage.setItem(`profilePhoto_${userData.nick}`, base64);
                                }; reader.readAsDataURL(file);
                            }
                        }} />
                    </div>
                </div>
            </div>

            <div className="border-b mb-6">
                <div className="flex gap-4 px-6 overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-2 text-sm font-medium relative whitespace-nowrap ${activeTab === tab.id
                                ? "text-foreground after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#4729ff]"
                                : "text-muted-foreground hover:text-foreground"}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-6 pb-12">
                {activeTab === "entry'ler" && (
                    <div className="text-sm text-muted-foreground">
                        {(isOwnProfile ? userEntries : userData.entries).length > 0 ? (
                            (isOwnProfile ? userEntries : userData.entries).map((entry: any) => (
                                <div key={entry.id} className="mb-8">
                                    <Link href={`/${entry.topicSlug || entry.topicTitle?.toLowerCase() || ''}`} className="text-base font-bold text-foreground hover:text-[#4729ff] block mb-2">{entry.topicTitle || entry.title}</Link>
                                    <div className="text-base text-foreground whitespace-pre-wrap">{entry.content}</div>
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
                            likedEntries.map((e) => (
                                <div key={e.id} className="mb-8">
                                    <Link href={`/${e.topicSlug || e.topicTitle?.toLowerCase().replace(/\s+/g, '-')}`} className="text-base font-bold block mb-2 text-foreground">{e.topicTitle}</Link>
                                    <div className="text-base text-foreground whitespace-pre-wrap mb-4">{e.content}</div>
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex gap-2">
                                            <Link href={`/yazar/${e.author}`} className="hover:text-[#4729ff] font-medium">{e.author}</Link>
                                            <span>•</span>
                                            <span>{e.date} {e.time}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-2">yok ki öyle bişey</div>
                        )}
                    </div>
                )}

                {(activeTab === "beğeniler" || activeTab === "beğenilmeyenler") && (
                    <div className="py-2 text-sm">yok ki öyle bişey</div>
                )}
            </div>

            {showFollowersModal && (
                <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowFollowersModal(false)}>
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between mb-4">
                            <h3 className="text-lg font-medium">takipçiler</h3>
                            <button onClick={() => setShowFollowersModal(false)}><X className="w-5 h-5" /></button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto">
                            <p className="text-center text-muted-foreground py-8">henüz takipçi yok</p>
                        </div>
                    </div>
                </div>
            )}

            {showFollowingModal && (
                <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowFollowingModal(false)}>
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between mb-4">
                            <h3 className="text-lg font-medium">takip edilenler</h3>
                            <button onClick={() => setShowFollowingModal(false)}><X className="w-5 h-5" /></button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto">
                            <p className="text-center text-muted-foreground py-8">henüz kimse takip edilmiyor</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
