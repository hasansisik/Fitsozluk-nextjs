"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Share2, Calendar, ChevronDown, User, X, Camera, MoreHorizontal, Settings, Ban, Trash2, Heart, Shield, Star, Award, Search, MessageSquare, ExternalLink, Flag, Pencil, Twitter, Facebook, MessageCircle, Send, Copy } from "lucide-react"
import Link from "next/link"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { useRouter } from "next/navigation"
import { editProfile, loadUser, followUser, unfollowUser, getFollowers, getFollowing, blockUser, unblockUser } from "@/redux/actions/userActions"
import { getAllEntries, deleteEntry } from "@/redux/actions/entryActions"
import { createReport } from "@/redux/actions/reportActions"
import { EntryCard } from "./entry-card"
import { getFollowedTopics } from "@/redux/actions/topicActions"

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
    noteText?: string
    setNoteText?: (text: string) => void
    handleSaveNote?: (e?: any) => void
    showSavedMessage?: boolean
}

export function UserProfile({ userData, noteText, setNoteText, handleSaveNote, showSavedMessage }: UserProfileProps) {
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
    const [profilePhoto, setProfilePhoto] = useState<string | null>(userData.picture || null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [showPhotoMenu, setShowPhotoMenu] = useState(false)
    const [bioText, setBioText] = useState(userData.bio || "")
    const [entries, setEntries] = useState<any[]>([])
    const [followedTopics, setFollowedTopics] = useState<any[]>([])
    const [loadingEntries, setLoadingEntries] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const [displayedEntryCount, setDisplayedEntryCount] = useState(10)
    const photoMenuRef = useRef<HTMLDivElement>(null)
    const reportModalRef = useRef<HTMLDivElement>(null)

    const fetchTabEntries = async () => {
        if (!userData.id) return
        setLoadingEntries(true)
        try {
            let params: any = { isActive: true }

            if (activeTab === "entry'ler") {
                params.author = userData.id
            } else if (activeTab === "beğeniler") {
                params.likedBy = userData.id
            } else if (activeTab === "beğenilmeyenler") {
                params.dislikedBy = userData.id
            } else if (activeTab === "favoriler") {
                params.favoritedBy = userData.id
            } else if (activeTab === "takip edilen başlıklar") {
                // Fetch followed topics
                const result = await dispatch(getFollowedTopics()).unwrap()
                setFollowedTopics(result)
                setLoadingEntries(false)
                return
            }

            const result = await dispatch(getAllEntries(params)).unwrap()
            setEntries(result)

            // Sync entry count for current tab
            if (activeTab === "entry'ler") {
                setDynamicStats(prev => ({ ...prev, entryCount: result.length }))
            }
        } catch (error) {
            console.error("Entries fetching error:", error)
        } finally {
            setLoadingEntries(false)
        }
    }

    const fetchFollowers = async () => {
        try {
            const result = await dispatch(getFollowers(userData.id)).unwrap();
            setFollowersList(result);
        } catch (error) {
            console.error("Followers fetching error:", error);
        }
    }

    const fetchFollowing = async () => {
        try {
            const result = await dispatch(getFollowing(userData.id)).unwrap();
            setFollowingList(result);
        } catch (error) {
            console.error("Following fetching error:", error);
        }
    }

    const handleSaveBio = async () => {
        try {
            await dispatch(editProfile({
                nick: user.nick,
                email: user.email,
                bio: bioText
            })).unwrap()
            setShowBioEdit(false)
        } catch (error) {
            console.error("Bio update error:", error)
            alert("Biyografi güncellenemedi.")
        }
    }

    const handleDeleteEntry = async (id: string) => {
        try {
            await dispatch(deleteEntry(id)).unwrap()
            setEntries(prev => prev.filter(entry => entry._id !== id))
            setDynamicStats(prev => ({ ...prev, entryCount: prev.entryCount - 1 }))
        } catch (error: any) {
            alert(error || "Entry silinemedi.")
        }
    }

    const handleBlock = async () => {
        if (!isAuthenticated) {
            alert("Bu işlem için giriş yapmalısınız.")
            return
        }

        try {
            await dispatch(blockUser(userData.id)).unwrap()
            await dispatch(loadUser()).unwrap() // Reload user data to sync blocked users
            setIsBlocked(true)
            setShowBlockModal(false)
            setShowMoreMenu(false)
            alert("Kullanıcı engellendi. Artık bu kullanıcının içeriklerini görmeyeceksiniz.")
            // Redirect to home to avoid showing blocked content
            router.push('/')
        } catch (error: any) {
            alert(error || "Engelleme işlemi başarısız.")
        }
    }

    const handleUnblock = async () => {
        try {
            await dispatch(unblockUser(userData.id)).unwrap()
            await dispatch(loadUser()).unwrap() // Reload user data to sync blocked users
            setIsBlocked(false)
            alert("Engel kaldırıldı.")
            window.location.reload() // Reload to show unblocked content
        } catch (error: any) {
            alert(error || "Engel kaldırma işlemi başarısız.")
        }
    }

    useEffect(() => {
        setIsMounted(true)

        // Scroll to top when component mounts
        window.scrollTo({ top: 0, behavior: 'smooth' })

        if (isAuthenticated && user) {
            setIsOwnProfile(user.nick?.toLowerCase() === userData.nick?.toLowerCase())

            if (user.following && user.following.includes(userData.id)) {
                setIsFollowing(true)
            }

            // Check if user is blocked from Redux state
            if (user.blockedUsers && Array.isArray(user.blockedUsers)) {
                const isUserBlocked = user.blockedUsers.some((blockedUser: any) => {
                    // blockedUsers can be array of IDs or objects with _id
                    const blockedId = typeof blockedUser === 'string' ? blockedUser : blockedUser._id
                    return blockedId === userData.id
                })
                setIsBlocked(isUserBlocked)
            }
        }

        // Initial fetch
        fetchTabEntries()

        // Sync dynamic stats initial
        setDynamicStats({
            entryCount: userData.stats?.entryCount || 0,
            followerCount: userData.stats?.followerCount || 0,
            followingCount: userData.stats?.followingCount || 0
        })

        if (userData.bio) setBioText(userData.bio)

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            if (!target.closest('.share-menu-container') && !target.closest('.more-menu-container')) {
                setShowShareMenu(false)
                setShowMoreMenu(false)
            }
            // Close photo menu when clicking outside
            if (photoMenuRef.current && !photoMenuRef.current.contains(event.target as Node)) {
                setShowPhotoMenu(false)
            }
            // Close report modal when clicking outside
            if (reportModalRef.current && !reportModalRef.current.contains(event.target as Node)) {
                setShowReportModal(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [userData.id, userData.nick, isAuthenticated, user, isMounted])

    useEffect(() => {
        if (isMounted) {
            // Reset displayed count and scroll to top when tab changes
            setDisplayedEntryCount(10)
            window.scrollTo({ top: 0, behavior: 'smooth' })
            fetchTabEntries()
        }
    }, [activeTab])

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
                        <button onClick={handleUnblock} className="px-6 py-2 bg-[#ff6600] text-white rounded-md">Engeli Kaldır</button>
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

    const handleReport = async () => {
        if (!reportReason) {
            alert("Lütfen bir şikayet nedeni seçin")
            return
        }
        if (!reportText.trim()) {
            alert("Lütfen şikayet açıklaması girin")
            return
        }

        try {
            await dispatch(createReport({
                reportType: 'user',
                reportedUserId: userData.id,
                reason: reportReason,
                description: reportText
            })).unwrap()

            alert("Şikayetiniz başarıyla gönderildi")
            setShowReportModal(false)
            setReportReason("")
            setReportText("")
            setShowMoreMenu(false)
        } catch (error: any) {
            alert(error || "Şikayet gönderilemedi")
        }
    }

    const tabs = [
        { id: "entry'ler", label: "entry'ler" },
        { id: "beğeniler", label: "beğeniler" },
        { id: "beğenilmeyenler", label: "beğenilmeyenler" },
        { id: "favoriler", label: "favoriler" },
        { id: "takip edilen başlıklar", label: "takip edilen başlıklar" }
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
                            className="w-full h-32 p-3 border rounded-md focus:ring-2 focus:ring-[#ff6600] outline-none"
                            maxLength={200}
                        />
                        <div className="flex justify-between mt-4">
                            <span className="text-xs text-muted-foreground">{bioText.length}/200</span>
                            <div className="flex gap-2">
                                <button onClick={() => setShowBioEdit(false)} className="px-4 py-2 text-sm font-medium">iptal</button>
                                <button onClick={handleSaveBio} className="px-4 py-2 text-sm font-medium bg-[#ff6600] text-white rounded-md">kaydet</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div ref={reportModalRef} className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">Şikayet Et</h3>
                            <button onClick={() => setShowReportModal(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 mb-4">
                            <button
                                onClick={() => setReportReason("spam")}
                                className={`w-full text-left px-4 py-3 border rounded-md transition-colors ${reportReason === "spam" ? "border-[#ff6600] bg-[#ff6600]/5" : "border-border hover:bg-secondary"
                                    }`}
                            >
                                Spam
                            </button>
                            <button
                                onClick={() => setReportReason("harassment")}
                                className={`w-full text-left px-4 py-3 border rounded-md transition-colors ${reportReason === "harassment" ? "border-[#ff6600] bg-[#ff6600]/5" : "border-border hover:bg-secondary"
                                    }`}
                            >
                                Hakaret Veya Nefret
                            </button>
                            <button
                                onClick={() => setReportReason("inappropriate")}
                                className={`w-full text-left px-4 py-3 border rounded-md transition-colors ${reportReason === "inappropriate" ? "border-[#ff6600] bg-[#ff6600]/5" : "border-border hover:bg-secondary"
                                    }`}
                            >
                                Uygunsuz İçerik
                            </button>
                            <button
                                onClick={() => setReportReason("copyright")}
                                className={`w-full text-left px-4 py-3 border rounded-md transition-colors ${reportReason === "copyright" ? "border-[#ff6600] bg-[#ff6600]/5" : "border-border hover:bg-secondary"
                                    }`}
                            >
                                Copyright
                            </button>
                            <button
                                onClick={() => setReportReason("other")}
                                className={`w-full text-left px-4 py-3 border rounded-md transition-colors ${reportReason === "other" ? "border-[#ff6600] bg-[#ff6600]/5" : "border-border hover:bg-secondary"
                                    }`}
                            >
                                Other
                            </button>
                        </div>

                        <textarea
                            value={reportText}
                            onChange={(e) => setReportText(e.target.value)}
                            placeholder="Şikayet açıklaması (zorunlu)"
                            className="w-full h-24 p-3 border rounded-md focus:ring-2 focus:ring-[#ff6600] outline-none mb-4"
                            maxLength={500}
                        />

                        <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">{reportText.length}/500</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-secondary"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleReport}
                                    className="px-4 py-2 text-sm font-medium bg-[#ff6600] text-white rounded-md hover:bg-[#e65c00]"
                                >
                                    Gönder
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            <div className="p-4 px-0 lg:p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        {/* 1. Nick */}
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">{userData.nick}</h1>
                        </div>

                        {/* 2. Title */}
                        <div className="mb-4">
                            <span className="text-sm font-medium text-muted-foreground/80 lowercase">
                                {userData.title || 'çaylak'}
                                {dynamicStats.entryCount > 0 && <span className="ml-1">({dynamicStats.entryCount})</span>}
                            </span>
                        </div>

                        {/* 3. Badges */}
                        {userData.badges && userData.badges.length > 0 && (
                            <div className="flex items-center gap-2 mb-5 group/badges">
                                <div className="flex gap-1.5">
                                    {userData.badges.slice(0, 4).map((badge: any) => (
                                        <div key={badge._id} className="relative group/badge">
                                            <img
                                                src={badge.icon}
                                                alt={badge.name}
                                                className="w-10 h-10 rounded-full border border-border hover:border-[#ff6600] transition-colors cursor-pointer object-cover p-0.5 bg-white"
                                                title={badge.name}
                                            />
                                            {badge.description && (
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-[10px] rounded opacity-0 group-hover/badge:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                    {badge.description}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <Link
                                    href={`/rozetler/${userData.nick}`}
                                    className="text-xs text-muted-foreground hover:text-[#ff6600] italic ml-1 transition-colors"
                                >
                                    tümü
                                </Link>
                            </div>
                        )}

                        {/* 4. Stats */}
                        <div className="flex gap-2 text-xs text-muted-foreground mb-3">
                            <span><strong className="text-foreground font-bold">{dynamicStats.entryCount}</strong> entry</span>
                            <span className="opacity-40">·</span>
                            <button onClick={() => { setShowFollowersModal(true); fetchFollowers(); }} className="hover:text-[#ff6600]">
                                <strong className="text-foreground font-bold">{dynamicStats.followerCount}</strong> takipçi
                            </button>
                            <span className="opacity-40">·</span>
                            <button onClick={() => { setShowFollowingModal(true); fetchFollowing(); }} className="hover:text-[#ff6600]">
                                <strong className="text-foreground font-bold">{dynamicStats.followingCount}</strong> takip
                            </button>
                        </div>

                        {/* Bio (Optional, keeping it where it fits best) */}
                        {userData.bio && (
                            <p className="text-sm text-foreground mb-5 whitespace-pre-wrap">{userData.bio}</p>
                        )}

                        {/* 5. Join Date */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{userData.joinDate}</span>
                        </div>

                        {/* 6. Actions */}
                        <div className="flex flex-wrap items-center gap-3 mb-8">
                            {!isOwnProfile && (
                                <button
                                    onClick={handleFollow}
                                    className={`h-11 px-10 rounded-full text-sm font-bold transition-all shadow-sm ${isFollowing
                                        ? "bg-secondary text-foreground hover:bg-secondary/80"
                                        : "bg-[#81c744] text-white hover:bg-[#72b33a]"
                                        }`}
                                >
                                    {isFollowing ? "takipten vazgeç" : "takip et"}
                                </button>
                            )}

                            <div className="flex items-center gap-2">
                                {!isOwnProfile && (
                                    <button
                                        className="w-11 h-11 flex items-center justify-center border border-border rounded-full hover:bg-secondary transition-colors text-muted-foreground"
                                        title="Mesaj Gönder"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                    </button>
                                )}

                                <div className="relative share-menu-container">
                                    <button
                                        onClick={() => setShowShareMenu(!showShareMenu)}
                                        className="w-11 h-11 flex items-center justify-center border border-border rounded-full hover:bg-secondary transition-colors text-muted-foreground"
                                    >
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                    {showShareMenu && (
                                        <div className="absolute left-0 top-full mt-2 bg-white border border-border rounded-md shadow-lg py-2 min-w-[180px] z-50">
                                            <button
                                                onClick={() => {
                                                    const url = window.location.href;
                                                    const text = `${userData.nick} - Fitsözlük`;
                                                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                                                    setShowShareMenu(false);
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                                            >
                                                <Twitter className="h-4 w-4" />
                                                Twitter'da Paylaş
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const url = window.location.href;
                                                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                                                    setShowShareMenu(false);
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                                            >
                                                <Facebook className="h-4 w-4" />
                                                Facebook'ta Paylaş
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const url = window.location.href;
                                                    const text = `${userData.nick} - Fitsözlük`;
                                                    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                                                    setShowShareMenu(false);
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                                            >
                                                <MessageCircle className="h-4 w-4" />
                                                WhatsApp'ta Paylaş
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const url = window.location.href;
                                                    const text = `${userData.nick} - Fitsözlük`;
                                                    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
                                                    setShowShareMenu(false);
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                                            >
                                                <Send className="h-4 w-4" />
                                                Telegram'da Paylaş
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const url = window.location.href;
                                                    navigator.clipboard.writeText(url);
                                                    alert('Link kopyalandı!');
                                                    setShowShareMenu(false);
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                                            >
                                                <Copy className="h-4 w-4" />
                                                Linki Kopyala
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {isOwnProfile ? (
                                    <button
                                        onClick={() => setShowBioEdit(true)}
                                        className="w-11 h-11 flex items-center justify-center border border-border rounded-full hover:bg-secondary transition-colors text-muted-foreground"
                                        title="Biyografiyi Düzenle"
                                    >
                                        <Pencil className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <div className="relative more-menu-container">
                                        <button
                                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                                            className="w-11 h-11 flex items-center justify-center border border-border rounded-full hover:bg-secondary transition-colors text-muted-foreground"
                                        >
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                        {showMoreMenu && (
                                            <div className="absolute top-full right-0 mt-2 bg-white border border-border rounded-lg shadow-lg py-2 z-50 w-48">
                                                <button
                                                    onClick={() => {
                                                        setShowReportModal(true);
                                                        setShowMoreMenu(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-secondary flex items-center gap-2"
                                                >
                                                    <Flag className="w-4 h-4" />
                                                    Şikayet Et
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div ref={photoMenuRef} className="relative ml-6">
                        <div
                            className={`w-36 h-36 rounded-full bg-muted flex items-center justify-center border-4 border-white shadow-sm overflow-hidden ${isOwnProfile ? 'cursor-pointer hover:opacity-80' : ''}`}
                            onClick={() => isOwnProfile && setShowPhotoMenu(!showPhotoMenu)}
                        >
                            {profilePhoto ? (
                                <img src={profilePhoto} className="w-full h-full object-cover" alt={userData.nick} />
                            ) : (
                                <User className="w-16 h-16 text-muted-foreground" />
                            )}
                        </div>
                        {isOwnProfile && showPhotoMenu && (
                            <div className="absolute top-full right-0 mt-2 bg-white border rounded-lg shadow-lg py-2 z-50 w-48">
                                <button onClick={() => { fileInputRef.current?.click(); setShowPhotoMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-secondary">{profilePhoto ? 'Fotoğrafı Değiştir' : 'Fotoğraf Yükle'}</button>
                                {profilePhoto && <button onClick={() => {
                                    setProfilePhoto(null);
                                    localStorage.removeItem(`profilePhoto_${userData.nick}`);
                                    setShowPhotoMenu(false);
                                    window.dispatchEvent(new Event('profilePhotoUpdated'));
                                }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-secondary">Fotoğrafı Kaldır</button>}
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0]; if (file) {
                                const reader = new FileReader(); reader.onloadend = () => {
                                    const base64 = reader.result as string;
                                    setProfilePhoto(base64);
                                    localStorage.setItem(`profilePhoto_${userData.nick}`, base64);
                                    setShowPhotoMenu(false);
                                    window.dispatchEvent(new Event('profilePhotoUpdated'));
                                }; reader.readAsDataURL(file);
                            }
                        }} />
                    </div>
                </div>
            </div>

            <div className="border-b mb-6">
                <div className="flex gap-4 px-2 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-2 text-sm font-medium relative whitespace-nowrap ${activeTab === tab.id
                                ? "text-foreground after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#ff6600]"
                                : "text-muted-foreground hover:text-foreground"}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-6 pb-12">
                {loadingEntries ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-[#ff6600] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : activeTab === "takip edilen başlıklar" ? (
                    <div className="space-y-8">
                        {followedTopics.length > 0 ? (
                            followedTopics.map((topic) => (
                                <div key={topic._id} className="border-b border-border/40 pb-8 last:border-0">
                                    <div className="mb-4">
                                        <Link
                                            href={`/${topic.slug}`}
                                            className="text-xl font-bold text-[#1a1a1a] hover:text-[#ff6600] transition-colors leading-tight"
                                        >
                                            {topic.title}
                                        </Link>
                                    </div>
                                    {topic.firstEntry ? (
                                        <EntryCard
                                            id={topic.firstEntry._id}
                                            content={topic.firstEntry.content}
                                            author={topic.firstEntry.author?.nick}
                                            authorPicture={topic.firstEntry.author?.picture}
                                            date={new Date(topic.firstEntry.createdAt).toLocaleDateString('tr-TR')}
                                            time={new Date(topic.firstEntry.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                            favoriteCount={topic.firstEntry.favoriteCount}
                                            likeCount={topic.firstEntry.likeCount}
                                            dislikeCount={topic.firstEntry.dislikeCount}
                                            isLiked={topic.firstEntry.likes?.includes(user?._id)}
                                            isDisliked={topic.firstEntry.dislikes?.includes(user?._id)}
                                            isFavorited={topic.firstEntry.favorites?.includes(user?._id)}
                                            onDelete={handleDeleteEntry}
                                            topicTitle={topic.title}
                                            topicSlug={topic.slug}
                                        />
                                    ) : (
                                        <div className="flex gap-2 text-xs text-muted-foreground">
                                            <span>{topic.entryCount || 0} entry</span>
                                            {topic.createdAt && (
                                                <>
                                                    <span>•</span>
                                                    <span>{new Date(topic.createdAt).toLocaleDateString('tr-TR')}</span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-12">Henüz takip edilen başlık yok</p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {entries.length > 0 ? (
                            <>
                                {entries.slice(0, displayedEntryCount).map((entry) => (
                                    <div key={entry._id} className="border-b border-border/40 pb-8 last:border-0">
                                        <div className="mb-4">
                                            <Link
                                                href={`/${entry.topic?.slug || ''}`}
                                                className="text-lg font-bold text-foreground hover:text-[#ff6600] transition-colors"
                                            >
                                                {entry.topic?.title}
                                            </Link>
                                        </div>
                                        <EntryCard
                                            id={entry._id}
                                            content={entry.content}
                                            author={entry.author?.nick}
                                            authorPicture={entry.author?.picture}
                                            date={new Date(entry.createdAt).toLocaleDateString('tr-TR')}
                                            time={new Date(entry.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                            favoriteCount={entry.favoriteCount}
                                            likeCount={entry.likeCount}
                                            dislikeCount={entry.dislikeCount}
                                            isLiked={entry.likes?.includes(user?._id)}
                                            isDisliked={entry.dislikes?.includes(user?._id)}
                                            isFavorited={entry.favorites?.includes(user?._id)}
                                            onDelete={handleDeleteEntry}
                                        />
                                    </div>
                                ))}

                                {/* Show More Button */}
                                {entries.length > displayedEntryCount && (
                                    <div className="flex justify-center pt-4">
                                        <button
                                            onClick={() => setDisplayedEntryCount(prev => prev + 10)}
                                            className="px-6 py-2 text-sm font-medium text-[#ff6600] border border-[#ff6600] rounded-md hover:bg-[#ff6600] hover:text-white transition-colors"
                                        >
                                            daha fazla göster ({entries.length - displayedEntryCount} entry daha)
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : null}
                    </div>
                )}
            </div>

            {
                showFollowersModal && (
                    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowFollowersModal(false)}>
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between mb-4">
                                <h3 className="text-lg font-medium">takipçiler</h3>
                                <button onClick={() => setShowFollowersModal(false)}><X className="w-5 h-5" /></button>
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto space-y-4">
                                {followersList.length > 0 ? (
                                    followersList.map(user => (
                                        <Link key={user._id} href={`/yazar/${user.nick}`} className="flex items-center gap-3 hover:bg-secondary p-2 rounded-lg transition-colors" onClick={() => setShowFollowersModal(false)}>
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                                {user.picture ? (
                                                    <img src={user.picture} alt={user.nick} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-5 h-5 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-foreground">@{user.nick}</div>
                                                <div className="text-xs text-muted-foreground">{user.title || 'çaylak'}</div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">henüz takipçi yok</p>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showFollowingModal && (
                    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowFollowingModal(false)}>
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between mb-4">
                                <h3 className="text-lg font-medium">takip edilenler</h3>
                                <button onClick={() => setShowFollowingModal(false)}><X className="w-5 h-5" /></button>
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto space-y-4">
                                {followingList.length > 0 ? (
                                    followingList.map(user => (
                                        <Link key={user._id} href={`/yazar/${user.nick}`} className="flex items-center gap-3 hover:bg-secondary p-2 rounded-lg transition-colors" onClick={() => setShowFollowingModal(false)}>
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                                {user.picture ? (
                                                    <img src={user.picture} alt={user.nick} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-5 h-5 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-foreground">@{user.nick}</div>
                                                <div className="text-xs text-muted-foreground">{user.title || 'çaylak'}</div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">henüz kimse takip edilmiyor</p>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Mobile Notes Section */}
            <div className="block xl:hidden p-6 px-4 border-t mt-12 bg-gray-50/50">
                <div className="max-w-2xl mx-auto">
                    <div className="flex flex-col items-center mb-6">
                        <h3 className="text-[11px] font-semibold text-muted-foreground/50 mb-4 uppercase tracking-[0.2em]">notlar</h3>
                        <textarea
                            value={noteText}
                            onChange={(e) => setNoteText && setNoteText(e.target.value)}
                            placeholder="yazar hakkındaki notlarım"
                            className="w-full h-32 p-4 text-sm border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#ff6600] bg-white transition-all shadow-sm"
                        />
                        <div className="w-full flex justify-end mt-3">
                            <button
                                onClick={handleSaveNote}
                                className="bg-[#ff6600] text-white px-8 py-2.5 rounded-md text-sm font-medium hover:bg-[#e65c00] transition-colors shadow-sm active:scale-95"
                            >
                                kaydet
                            </button>
                        </div>
                        {showSavedMessage && (
                            <div className="mt-2 text-sm text-[#ff6600] font-medium animate-pulse">
                                ✓ kaydedildi
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    )
}
