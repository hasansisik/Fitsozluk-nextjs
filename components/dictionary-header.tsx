"use client"

import { Search, Menu, ChevronDown, User, Settings, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import topicsData from "@/data/topics.json"
import usersData from "@/data/users-profile.json"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { loadUser, logout } from "@/redux/actions/userActions"
import { getFeaturedMenus } from "@/redux/actions/menuActions"
import { getFeaturedTopics } from "@/redux/actions/topicActions"

export function DictionaryHeader() {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { user, isAuthenticated } = useAppSelector((state) => state.user)
    const { featuredMenus, additionalMenus } = useAppSelector((state) => state.menu)
    const { featuredTopics, additionalTopics } = useAppSelector((state) => state.topic)

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [showMoreTopics, setShowMoreTopics] = useState(false)
    const [showSettingsMenu, setShowSettingsMenu] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [showSearchResults, setShowSearchResults] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
    const searchRef = useRef<HTMLDivElement>(null)
    const filterRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Load user from token if exists
        const token = localStorage.getItem("accessToken")
        if (token && !isAuthenticated) {
            dispatch(loadUser())
        }

        // Load menus and topics from backend
        dispatch(getFeaturedMenus())
        dispatch(getFeaturedTopics())

        // Click outside to close search results and filters
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchResults(false)
            }
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setShowFilters(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [dispatch, isAuthenticated])

    const handleSearch = (query: string) => {
        setSearchQuery(query)

        if (query.trim().length < 2) {
            setSearchResults([])
            setShowSearchResults(false)
            return
        }

        const lowerQuery = query.toLowerCase()
        const results: any[] = []

        // Search topics
        topicsData.forEach((topic: any) => {
            if (topic.title.toLowerCase().includes(lowerQuery)) {
                results.push({
                    type: 'topic',
                    title: topic.title,
                    slug: topic.slug,
                    entryCount: topic.entryCount
                })
            }
        })

        // Search users
        usersData.forEach((user: any) => {
            if (user.nick?.toLowerCase().includes(lowerQuery) ||
                user.displayName.toLowerCase().includes(lowerQuery)) {
                results.push({
                    type: 'user',
                    nick: user.nick,
                    displayName: user.displayName
                })
            }
        })

        setSearchResults(results.slice(0, 10)) // Limit to 10 results
        setShowSearchResults(results.length > 0)
    }

    const handleLogout = async () => {
        await dispatch(logout())
        setShowSettingsMenu(false)
        router.push("/")
    }

    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b border-border">
            {/* Top Row: Logo, Search, User Actions */}
            <div className="w-full bg-white">
                <div className="max-w-[1300px] mx-auto px-6 lg:px-8">
                    <div className="flex h-14 items-center relative">
                        {/* Logo */}
                        <Link href="/" className="mr-4 lg:mr-6 flex items-center space-x-2 flex-shrink-0">
                            <div className="flex items-center">
                                <Image
                                    src="/fitsözlük.png"
                                    alt="fitsözlük"
                                    width={160}
                                    height={40}
                                    className="h-8 lg:h-10 w-auto"
                                    priority
                                />
                            </div>
                        </Link>

                        {/* Search Bar - Centered */}
                        <div ref={searchRef} className="absolute left-1/2 -translate-x-1/2 w-full max-w-md px-4">
                            <form onSubmit={(e) => {
                                e.preventDefault()
                                if (searchQuery.trim().length >= 2) {
                                    const params = new URLSearchParams({
                                        q: searchQuery,
                                        ...(startDate && { startDate }),
                                        ...(endDate && { endDate }),
                                        sort: sortOrder
                                    })
                                    router.push(`/arama?${params.toString()}`)
                                    setShowSearchResults(false)
                                }
                            }}>
                                <div className="relative">
                                    <button
                                        type="submit"
                                        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 cursor-pointer hover:text-blue-500 transition-colors"
                                    >
                                        <Search className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                    <input
                                        type="text"
                                        placeholder="başlık, #entry, @yazar"
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        onFocus={() => {
                                            if (searchQuery.length >= 2) {
                                                setShowSearchResults(true)
                                                setShowFilters(false)
                                            }
                                        }}
                                        className="w-full rounded-md border-2 border-input bg-background pl-10 pr-12 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 focus-visible:ring-offset-0"
                                    />
                                    <div ref={filterRef} className="absolute right-2 top-1/2 -translate-y-1/2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowFilters(!showFilters)
                                                setShowSearchResults(false)
                                            }}
                                            className="h-8 w-8 flex items-center justify-center hover:bg-secondary rounded-md transition-colors"
                                            title="Filtreler"
                                        >
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        </button>

                                        {/* Filter Dropdown */}
                                        {showFilters && (
                                            <div className="absolute top-full right-0 mt-2 bg-white border border-border rounded-lg shadow-lg p-4 z-50 min-w-[280px]">
                                                <h3 className="text-sm font-medium mb-3">Filtreler</h3>

                                                {/* Date Range */}
                                                <div className="mb-4">
                                                    <label className="text-xs text-muted-foreground mb-2 block">
                                                        Tarih Aralığı
                                                    </label>
                                                    <div className="space-y-2">
                                                        <input
                                                            type="date"
                                                            value={startDate}
                                                            onChange={(e) => setStartDate(e.target.value)}
                                                            className="w-full px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-[#4729ff]"
                                                        />
                                                        <input
                                                            type="date"
                                                            value={endDate}
                                                            onChange={(e) => setEndDate(e.target.value)}
                                                            className="w-full px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-[#4729ff]"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Sort Order */}
                                                <div className="mb-4">
                                                    <label className="text-xs text-muted-foreground mb-2 block">
                                                        Sıralama
                                                    </label>
                                                    <div className="space-y-2">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="sortOrder"
                                                                value="newest"
                                                                checked={sortOrder === "newest"}
                                                                onChange={(e) => setSortOrder(e.target.value as "newest")}
                                                                className="w-4 h-4 text-[#4729ff] focus:ring-[#4729ff]"
                                                            />
                                                            <span className="text-sm">Yeniden Eskiye</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="sortOrder"
                                                                value="oldest"
                                                                checked={sortOrder === "oldest"}
                                                                onChange={(e) => setSortOrder(e.target.value as "oldest")}
                                                                className="w-4 h-4 text-[#4729ff] focus:ring-[#4729ff]"
                                                            />
                                                            <span className="text-sm">Eskiden Yeniye</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setStartDate("")
                                                            setEndDate("")
                                                            setSortOrder("newest")
                                                        }}
                                                        className="flex-1 px-3 py-1.5 text-sm border border-border rounded hover:bg-secondary transition-colors"
                                                    >
                                                        Sıfırla
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (searchQuery.trim().length >= 2) {
                                                                const params = new URLSearchParams({
                                                                    q: searchQuery,
                                                                    ...(startDate && { startDate }),
                                                                    ...(endDate && { endDate }),
                                                                    sort: sortOrder
                                                                })
                                                                router.push(`/arama?${params.toString()}`)
                                                                setShowFilters(false)
                                                            } else {
                                                                setShowFilters(false)
                                                            }
                                                        }}
                                                        className="flex-1 px-3 py-1.5 text-sm bg-[#4729ff] text-white rounded hover:bg-[#3820cc] transition-colors"
                                                    >
                                                        Uygula
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Search Results Dropdown */}
                                    {showSearchResults && searchResults.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                                            {searchResults.map((result, index) => (
                                                <Link
                                                    key={index}
                                                    href={result.type === 'topic' ? `/baslik/${result.slug}` : `/biri/${result.nick}`}
                                                    onClick={() => {
                                                        setShowSearchResults(false)
                                                        setSearchQuery("")
                                                    }}
                                                    className="block px-4 py-3 hover:bg-secondary transition-colors border-b border-border last:border-b-0"
                                                >
                                                    {result.type === 'topic' ? (
                                                        <div>
                                                            <div className="text-sm font-medium text-foreground">{result.title}</div>
                                                            <div className="text-xs text-muted-foreground mt-1">{result.entryCount} entry</div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <div className="text-sm font-medium text-foreground">@{result.nick}</div>
                                                            <div className="text-xs text-muted-foreground mt-1">kullanıcı</div>
                                                        </div>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* User Actions */}
                        <div className="hidden md:flex items-center space-x-3 ml-auto flex-shrink-0">
                            {isAuthenticated && user ? (
                                // Logged in: Show profile and settings icons
                                <>
                                    <Link
                                        href={`/biri/${user.nick}`}
                                        className="p-2 text-foreground hover:text-[#4729ff] transition-colors"
                                        title="Profilim"
                                    >
                                        <User className="h-5 w-5" />
                                    </Link>

                                    <div className="relative">
                                        <button
                                            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                                            className="p-2 text-foreground hover:text-[#4729ff] transition-colors"
                                            title="Ayarlar"
                                        >
                                            <Settings className="h-5 w-5" />
                                        </button>

                                        {/* Settings Dropdown Menu */}
                                        {showSettingsMenu && (
                                            <div className="absolute top-full right-0 mt-2 bg-white border border-border rounded-md shadow-lg py-2 min-w-[200px] z-50">
                                                <Link
                                                    href={`/biri/${user.nick}`}
                                                    className="block px-4 py-2 text-sm text-foreground hover:bg-secondary hover:text-[#4729ff] transition-colors"
                                                    onClick={() => setShowSettingsMenu(false)}
                                                >
                                                    Profil Ayarları
                                                </Link>
                                                <Link
                                                    href="/ayarlar"
                                                    className="block px-4 py-2 text-sm text-foreground hover:bg-secondary hover:text-[#4729ff] transition-colors"
                                                    onClick={() => setShowSettingsMenu(false)}
                                                >
                                                    Hesap Ayarları
                                                </Link>
                                                <div className="border-t border-border my-1"></div>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-secondary transition-colors"
                                                >
                                                    Çıkış Yap
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                // Logged out: Show login and register buttons
                                <>
                                    <Link
                                        href="/giris"
                                        className="text-sm font-medium text-foreground hover:text-[#4729ff] transition-colors"
                                    >
                                        giriş
                                    </Link>
                                    <Link
                                        href="/kayitol"
                                        className="rounded-md bg-[#4729ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#3820cc] transition-colors"
                                    >
                                        kayıt ol
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden ml-auto p-2 flex-shrink-0"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Topic Navigation */}
            <div className="hidden md:block bg-white">
                <div className="max-w-[1300px] mx-auto px-6 lg:px-8">
                    <nav className="flex items-center justify-between h-10">
                        {/* Main Topics - Spread evenly across full width */}
                        {featuredTopics.map((topic) => (
                            <Link
                                key={topic._id}
                                href={topic.href}
                                className="text-sm font-medium text-foreground hover:text-[#4729ff] hover:underline transition-colors whitespace-nowrap"
                            >
                                {topic.label}
                            </Link>
                        ))}

                        {/* More Topics Dropdown */}
                        {additionalTopics.length > 0 && (
                            <div className="relative flex-shrink-0">
                                <button
                                    onClick={() => setShowMoreTopics(!showMoreTopics)}
                                    className="text-sm text-foreground hover:text-[#4729ff] transition-colors flex items-center"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </button>

                                {/* Dropdown Menu */}
                                {showMoreTopics && (
                                    <div className="absolute top-full right-0 mt-1 bg-white border border-border rounded-md shadow-lg py-2 min-w-[180px] z-50">
                                        {additionalTopics.map((topic) => (
                                            <Link
                                                key={topic._id}
                                                href={topic.href}
                                                className="block px-4 py-2 text-sm text-foreground hover:bg-secondary hover:text-[#4729ff] transition-colors"
                                                onClick={() => setShowMoreTopics(false)}
                                            >
                                                {topic.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </nav>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-border">
                    <div className="px-6 py-4 space-y-3">
                        {featuredMenus.map((menu) => (
                            <Link
                                key={menu._id}
                                href={menu.href}
                                className="block text-sm text-foreground hover:text-[#4729ff] transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {menu.label}
                            </Link>
                        ))}
                        {additionalMenus.map((menu) => (
                            <Link
                                key={menu._id}
                                href={menu.href}
                                className="block text-sm text-muted-foreground hover:text-[#4729ff] transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {menu.label}
                            </Link>
                        ))}
                        <div className="border-t border-border pt-3 mt-3 space-y-3">
                            <Link
                                href="/giris"
                                className="block text-sm font-medium text-foreground hover:text-[#4729ff] transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                giriş
                            </Link>
                            <Link
                                href="/kayitol"
                                className="block text-sm font-medium text-[#4729ff] hover:text-[#3820cc] transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                kayıt ol
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
