"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, User, UserPlus, Ban, Search } from "lucide-react"
import Link from "next/link"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { blockUser, followUser, unfollowUser } from "@/redux/actions/userActions"

interface TopicFiltersProps {
    topicTitle: string
    topicId?: string
    topicCreator?: string
    topicCreatorId?: string
    topicCreatorPicture?: string
    onSearch?: (query: string) => void
    onFilterChange?: (timeRange: string, filterType: string) => void
    isFollowing?: boolean
    onFollowToggle?: () => void
}

export function TopicFilters({ topicTitle, topicId, topicCreator = "anonim", topicCreatorId, topicCreatorPicture, onSearch, onFilterChange, isFollowing = false, onFollowToggle }: TopicFiltersProps) {
    const [timeFilter, setTimeFilter] = useState("tümü")
    const [searchFilter, setSearchFilter] = useState("")
    const [selectedFilterType, setSelectedFilterType] = useState("")
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)
    const [showBlockDialog, setShowBlockDialog] = useState(false)
    const [isUserFollowing, setIsUserFollowing] = useState(false)
    const { user, isAuthenticated } = useAppSelector(state => state.user)
    const dispatch = useAppDispatch()
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (user && user.following && topicCreatorId) {
            setIsUserFollowing(user.following.includes(topicCreatorId))
        } else {
            setIsUserFollowing(false)
        }
    }, [user, topicCreatorId])

    const timeOptions = [
        { value: "son-24-saat", label: "son 24 saat" },
        { value: "son-1-hafta", label: "son 1 hafta" },
        { value: "son-1-ay", label: "son 1 ay" },
        { value: "son-3-ay", label: "son 3 ay" },
        { value: "tümü", label: "tümü" }
    ]

    const searchOptions = [
        { value: "bugün", label: "bugün" },
        { value: "linkler", label: "linkler" },
        { value: "benimkiler", label: "benimkiler" },
        { value: "görseller", label: "görseller" },
        { value: "çaylaklar", label: "çaylaklar" }
    ]

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpenDropdown(null)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const toggleDropdown = (dropdown: string) => {
        setOpenDropdown(openDropdown === dropdown ? null : dropdown)
    }

    const handleSearch = () => {
        if (onSearch && searchFilter.trim()) {
            onSearch(searchFilter.trim())
            setOpenDropdown(null)
        }
    }

    const handleBlockUser = () => {
        if (!isAuthenticated) return alert("Bu işlem için giriş yapmalısınız.")
        if (!topicCreatorId) return alert("Kullanıcı bilgisi bulunamadı.")
        setShowBlockDialog(true)
    }

    const confirmBlockUser = async () => {
        if (!topicCreatorId) return

        try {
            await dispatch(blockUser(topicCreatorId)).unwrap()
            // Reload user data to sync blocked users list
            const { loadUser } = await import('@/redux/actions/userActions')
            await dispatch(loadUser()).unwrap()
            setShowBlockDialog(false)
            alert("Kullanıcı engellendi. Artık bu kullanıcının başlıklarını ve içeriklerini görmeyeceksiniz.")
            // Redirect to home to avoid showing blocked content
            window.location.href = '/'
        } catch (error: any) {
            alert(error || "Engel işlemi başarısız.")
        }
    }

    const handleFollowUser = async () => {
        if (!isAuthenticated) return alert("Bu işlem için giriş yapmalısınız.")
        if (!topicCreatorId) return alert("Kullanıcı bilgisi bulunamadı.")

        try {
            if (isUserFollowing) {
                await dispatch(unfollowUser(topicCreatorId)).unwrap()
                alert("Kullanıcı takipten çıkarıldı.")
            } else {
                await dispatch(followUser(topicCreatorId)).unwrap()
                alert("Kullanıcı takip edildi.")
            }

            // Reload user data to update the following list in Redux
            const { loadUser } = await import('@/redux/actions/userActions')
            await dispatch(loadUser()).unwrap()

        } catch (error: any) {
            alert(error || "İşlem başarısız")
        }
    }

    return (
        <div ref={containerRef} className="flex items-center flex-wrap gap-x-3 gap-y-2">
            {/* Time Range Filter */}
            <div className="relative">
                <button
                    onClick={() => toggleDropdown('time')}
                    className="flex items-center gap-0.5 text-xs text-foreground hover:text-[#ff6600] transition-colors"
                >
                    şükela
                    <ChevronDown className="h-3 w-3 opacity-40" />
                </button>
                {openDropdown === 'time' && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded shadow-lg py-1 min-w-[150px] z-50">
                        {timeOptions.map(option => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    setTimeFilter(option.value)
                                    setOpenDropdown(null)
                                    if (onFilterChange) {
                                        onFilterChange(option.value, selectedFilterType)
                                    }
                                }}
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors ${timeFilter === option.value ? 'text-[#ff6600] font-medium' : 'text-foreground'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Başlıkta Ara */}
            <div className="relative">
                <button
                    onClick={() => toggleDropdown('search')}
                    className="flex items-center gap-0.5 text-xs text-foreground hover:text-[#ff6600] transition-colors"
                >
                    başlıkta ara
                    <ChevronDown className="h-3 w-3 opacity-40" />
                </button>
                {openDropdown === 'search' && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded shadow-lg p-1 min-w-[200px] z-50">
                        {searchOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    setSelectedFilterType(opt.value)
                                    setOpenDropdown(null)
                                    if (onFilterChange) {
                                        onFilterChange(timeFilter, opt.value)
                                    }
                                }}
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors ${selectedFilterType === opt.value ? 'text-[#ff6600] font-medium' : 'text-foreground'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                        <div className="border-t border-border my-1"></div>
                        <div className="p-2 border-t border-border mt-1">
                            <div className="flex gap-1">
                                <input
                                    type="text"
                                    placeholder="kelime ya da @yazar"
                                    value={searchFilter}
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="flex-1 px-2 py-1.5 text-xs border border-border rounded focus:outline-none"
                                />
                                <button
                                    onClick={handleSearch}
                                    className="p-1.5 bg-[#82bc42] text-white rounded hover:bg-[#71a439]"
                                >
                                    <Search className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Takip Et (Topic Follow - kept as receives prop) */}
            {isAuthenticated && (
                <button
                    onClick={onFollowToggle}
                    className="text-xs text-foreground hover:text-[#ff6600] transition-colors"
                >
                    {isFollowing ? "takibi bırak" : "takip et"}
                </button>
            )}

            {/* Başlığı Açan dropdown */}
            <div className="relative">
                <button
                    onClick={() => toggleDropdown('creator')}
                    className="flex items-center gap-0.5 text-xs text-foreground hover:text-[#ff6600] transition-colors"
                >
                    başlığı açan
                    <ChevronDown className="h-3 w-3 opacity-40" />
                </button>
                {openDropdown === 'creator' && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded shadow-lg py-1 min-w-[180px] z-50">
                        <Link
                            href={`/yazar/${encodeURIComponent(topicCreator)}`}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-[#82bc42] hover:bg-secondary transition-colors font-medium"
                            onClick={() => setOpenDropdown(null)}
                        >
                            @{topicCreator}
                        </Link>
                        {isAuthenticated && (
                            <>
                                <button
                                    onClick={() => {
                                        handleFollowUser()
                                        setOpenDropdown(null)
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors text-foreground"
                                >
                                    {isUserFollowing ? "takibi bırak" : "takip et"}
                                </button>
                                <button
                                    onClick={() => {
                                        handleBlockUser()
                                        setOpenDropdown(null)
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors text-foreground"
                                >
                                    başlıklarını engelle
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
            {/* Block User Dialog */}
            {showBlockDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4 shadow-2xl border border-border">
                        <div className="mb-4">
                            <h3 className="text-lg font-medium text-foreground mb-2">Kullanıcıyı Engelle</h3>
                            <p className="text-sm text-muted-foreground">@{topicCreator} adlı kullanıcıyı engellemek istiyor musunuz? Başlıklarını artık görmeyeceksiniz.</p>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowBlockDialog(false)} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-secondary transition-colors">İptal</button>
                            <button onClick={confirmBlockUser} className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">Engelle</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
