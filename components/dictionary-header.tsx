"use client"

import { Search, Menu, ChevronDown, User, Settings, MoreHorizontal, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import axios from "axios"
import { server } from "@/config"
import { getAllTopics } from "@/redux/actions/topicActions"
import { searchUsers, loadUser, logout } from "@/redux/actions/userActions"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getFeaturedMenus } from "@/redux/actions/menuActions"

export function DictionaryHeader() {
    const router = useRouter()
    const pathname = usePathname()
    const dispatch = useAppDispatch()
    const { user, isAuthenticated } = useAppSelector((state) => state.user)
    const { featuredMenus, additionalMenus } = useAppSelector((state) => state.menu)

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [showMoreTopics, setShowMoreTopics] = useState(false)
    const [showSettingsMenu, setShowSettingsMenu] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [showSearchResults, setShowSearchResults] = useState(false)
    const [exactMatchExists, setExactMatchExists] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
    const searchRef = useRef<HTMLDivElement>(null)
    const filterRef = useRef<HTMLDivElement>(null)
    const settingsMenuRef = useRef<HTMLDivElement>(null)
    const moreTopicsRef = useRef<HTMLDivElement>(null)
    const searchTimeout = useRef<any>(null)

    // Get current category from URL to preserve it during search
    const [currentCategory, setCurrentCategory] = useState<string>("gündem")

    // Clear search when navigating to a different page
    useEffect(() => {
        setSearchQuery("")
        setSearchResults([])
        setShowSearchResults(false)
        setShowFilters(false)
    }, [pathname])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search)
            const category = params.get('kategori') || params.get('category') || 'gündem'
            setCurrentCategory(category)
        }
    }, [router])

    useEffect(() => {
        // Load user from token if exists
        const token = localStorage.getItem("accessToken")
        if (token && !isAuthenticated) {
            dispatch(loadUser())
        }

        // Load menus and topics from backend
        dispatch(getFeaturedMenus())

        // Click outside to close all dropdowns
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchResults(false)
            }
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setShowFilters(false)
            }
            if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
                setShowSettingsMenu(false)
            }
            if (moreTopicsRef.current && !moreTopicsRef.current.contains(event.target as Node)) {
                setShowMoreTopics(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [dispatch, isAuthenticated])

    const handleSearch = async (query: string) => {
        setSearchQuery(query)

        if (query.trim().length < 2) {
            setSearchResults([])
            setExactMatchExists(false)
            setShowSearchResults(false)
            return
        }

        // Debounce search
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current)
        }

        searchTimeout.current = setTimeout(async () => {
            try {
                const results: any[] = []

                const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null
                const config = token ? {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                } : {};

                // Search topics and users directly without updating Redux store
                // This prevents sidebar from being affected by header search
                const [topicsResponse, usersResponse] = await Promise.all([
                    axios.get(`${server}/topics?search=${encodeURIComponent(query)}`, config).catch(() => ({ data: { topics: [], exactMatchExists: false } })),
                    axios.get(`${server}/auth/search-users?search=${encodeURIComponent(query)}&limit=5`, config).catch((err) => {
                        console.error("User search error:", err)
                        return { data: { success: false, users: [] } }
                    })
                ])

                console.log("Topics response:", topicsResponse.data)
                console.log("Users response:", usersResponse.data)

                // Set global existence flag
                setExactMatchExists(topicsResponse.data.exactMatchExists || false)

                // Add topics to results
                const topics = topicsResponse.data.topics || []
                topics.slice(0, 5).forEach((topic: any) => {
                    results.push({
                        type: 'topic',
                        title: topic.title,
                        slug: topic.slug,
                        entryCount: topic.entryCount
                    })
                })

                // Add users to results - handle different response formats
                let users = []
                if (usersResponse.data.users) {
                    users = usersResponse.data.users
                } else if (Array.isArray(usersResponse.data)) {
                    users = usersResponse.data
                }

                console.log("Users array:", users)
                users.forEach((user: any) => {
                    results.push({
                        type: 'user',
                        nick: user.nick,
                        _id: user._id
                    })
                })

                console.log("Final results:", results)
                setSearchResults(results)
                setShowSearchResults(results.length > 0)
            } catch (error) {
                console.error("Search error:", error)
            }
        }, 300)
    }

    const handleLogout = async () => {
        await dispatch(logout())
        setShowSettingsMenu(false)
        router.push("/")
    }

    const getMenuHref = (href: string) => {
        if (!href) return "/";

        // If href doesn't start with /, add it (e.g., "debe" -> "/debe")
        if (!href.startsWith('/') && !href.startsWith('http')) {
            href = `/${href}`;
        }

        const excluded = ['/', '/debe', '/giris', '/kayitol', '/ayarlar', '/arama', '/istatistikler'];
        if (excluded.includes(href) || href.startsWith('http') || href.startsWith('/biri/')) return href;
        if (href.startsWith('/basliklar/')) return href;
        if (href.startsWith('/kanal/')) return href.replace('/kanal/', '/basliklar/');

        let cleanHref = href;
        if (cleanHref.startsWith('/')) cleanHref = cleanHref.substring(1);
        return `/basliklar/${cleanHref}`;
    }

    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b border-border">
            {/* Top Row: Logo, Search, User Actions */}
            <div className="w-full bg-white">
                <div className="max-w-[1300px] mx-auto px-6 lg:px-8">
                    <div className="flex h-16 items-center relative">
                        {/* Logo */}
                        <Link href="/" className="mr-4 lg:mr-6 flex items-center space-x-2 flex-shrink-0">
                            <div className="flex items-center">
                                <Image
                                    src="/fitsözlük.png"
                                    alt="fitsözlük"
                                    width={140}
                                    height={35}
                                    className="h-6 lg:h-8 w-auto"
                                    priority
                                />
                            </div>
                        </Link>

                        {/* Search Bar - Centered */}
                        <div ref={searchRef} className="absolute left-1/2 -translate-x-1/2 w-full max-w-md px-4">
                            <form onSubmit={async (e) => {
                                e.preventDefault()
                                if (searchQuery.trim().length >= 2) {
                                    // First, check if a topic with this exact title exists globally
                                    try {
                                        const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null
                                        const config = token ? {
                                            headers: {
                                                Authorization: `Bearer ${token}`,
                                            },
                                        } : {};

                                        const response = await axios.get(`${server}/topics?search=${encodeURIComponent(searchQuery)}`, config)

                                        // If exact match exists anywhere in DB
                                        if (response.data.exactMatchExists) {
                                            // Generate slug from search query to navigate directly
                                            // Even if we can't see the exact topic object in 'topics' list, we know it exists
                                            const generatedSlug = searchQuery.trim()
                                                .toLowerCase()
                                                .replace(/ /g, '-')
                                                .replace(/[^\w-]+/g, '')

                                            router.push(`/${generatedSlug}`)
                                            setShowSearchResults(false)
                                            setSearchQuery("")
                                            return
                                        }
                                    } catch (error) {
                                        console.error("Topic global check error:", error)
                                    }

                                    // If no exact match, go to search results page
                                    const params = new URLSearchParams({
                                        q: searchQuery,
                                        ...(startDate && { startDate }),
                                        ...(endDate && { endDate }),
                                        sort: sortOrder,
                                        kategori: currentCategory
                                    })
                                    router.push(`/arama?${params.toString()}`)
                                    setShowSearchResults(false)
                                }
                            }}>
                                <div className="relative">
                                    <button
                                        type="submit"
                                        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 cursor-pointer hover:text-orange-500 transition-colors"
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
                                        className="w-full rounded-md border-2 border-input bg-background pl-10 pr-20 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-[#ff6600]"
                                    />
                                    {/* Clear button */}
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchQuery("")
                                                setSearchResults([])
                                                setShowSearchResults(false)
                                            }}
                                            className="absolute right-12 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center hover:bg-secondary rounded-md transition-colors"
                                            title="Temizle"
                                        >
                                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                                        </button>
                                    )}
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
                                                            className="w-full px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-[#ff6600]"
                                                        />
                                                        <input
                                                            type="date"
                                                            value={endDate}
                                                            onChange={(e) => setEndDate(e.target.value)}
                                                            className="w-full px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-[#ff6600]"
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
                                                                className="w-4 h-4 text-[#ff6600] focus:ring-[#ff6600]"
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
                                                                className="w-4 h-4 text-[#ff6600] focus:ring-[#ff6600]"
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
                                                                    sort: sortOrder,
                                                                    category: currentCategory
                                                                })
                                                                router.push(`/arama?${params.toString()}`)
                                                                setShowFilters(false)
                                                            } else {
                                                                setShowFilters(false)
                                                            }
                                                        }}
                                                        className="flex-1 px-3 py-1.5 text-sm bg-[#ff6600] text-white rounded hover:bg-[#e65c00] transition-colors"
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
                                                    href={result.type === 'topic' ? `/${result.slug}` : `/yazar/${result.nick}`}
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
                                        href={`/yazar/${user.nick}`}
                                        className="p-2 text-foreground hover:text-[#ff6600] transition-colors"
                                        title="Profilim"
                                    >
                                        <User className="h-5 w-5" />
                                    </Link>

                                    <div ref={settingsMenuRef} className="relative">
                                        <button
                                            onClick={() => {
                                                setShowSettingsMenu(!showSettingsMenu)
                                                setShowMoreTopics(false) // Close more topics when opening settings
                                            }}
                                            className="p-2 text-foreground hover:text-[#ff6600] transition-colors"
                                            title="Ayarlar"
                                        >
                                            <Settings className="h-5 w-5" />
                                        </button>

                                        {/* Settings Dropdown Menu */}
                                        {showSettingsMenu && (
                                            <div className="absolute top-full right-0 mt-2 bg-white border border-border rounded-md shadow-lg py-2 min-w-[200px] z-50">
                                                <Link
                                                    href={`/yazar/${user.nick}`}
                                                    className="block px-4 py-2 text-sm text-foreground hover:bg-secondary hover:text-[#ff6600] transition-colors"
                                                    onClick={() => setShowSettingsMenu(false)}
                                                >
                                                    Profil Ayarları
                                                </Link>
                                                <Link
                                                    href="/ayarlar"
                                                    className="block px-4 py-2 text-sm text-foreground hover:bg-secondary hover:text-[#ff6600] transition-colors"
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
                                        className="text-sm font-medium text-foreground hover:text-[#ff6600] transition-colors"
                                    >
                                        giriş
                                    </Link>
                                    <Link
                                        href="/kayitol"
                                        className="rounded-md bg-[#ff6600] px-4 py-2 text-sm font-medium text-white hover:bg-[#e65c00] transition-colors"
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

                        {featuredMenus.map((menu) => {
                            // Normalize category from label for consistency with backend
                            const category = menu.label.replace('#', '').trim().toLocaleLowerCase('tr-TR');

                            // Normalize href to always have leading slash for comparison
                            const normalizedHref = menu.href.startsWith('/') ? menu.href : `/${menu.href}`;

                            // Check if this menu's href is a special route or page
                            const isSpecialRoute = normalizedHref === '/debe' ||
                                normalizedHref === '/giris' ||
                                normalizedHref === '/kayitol' ||
                                normalizedHref === '/ayarlar' ||
                                normalizedHref === '/arama' ||
                                normalizedHref === '/istatistikler' ||
                                menu.href.startsWith('http') ||
                                menu.href.startsWith('/biri/') ||
                                menu.href.startsWith('/basliklar/');

                            // If it's a special route/page, use getMenuHref
                            // Otherwise, treat it as a category filter for the homepage
                            const href = isSpecialRoute
                                ? getMenuHref(menu.href)
                                : `/?kategori=${category}`;

                            return (
                                <Link
                                    key={menu._id}
                                    href={href}
                                    className="text-sm font-medium text-foreground hover:text-[#ff6600] hover:underline transition-colors whitespace-nowrap"
                                >
                                    {menu.label}
                                </Link>
                            );
                        })}

                        {/* More Topics Dropdown */}
                        {additionalMenus.length > 0 && (
                            <div ref={moreTopicsRef} className="relative flex-shrink-0">
                                <button
                                    onClick={() => {
                                        setShowMoreTopics(!showMoreTopics)
                                        setShowSettingsMenu(false) // Close settings when opening more topics
                                    }}
                                    className="text-sm text-foreground hover:text-[#ff6600] transition-colors flex items-center"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </button>

                                {/* Dropdown Menu */}
                                {showMoreTopics && (
                                    <div className="absolute top-full right-0 mt-1 bg-white border border-border rounded-md shadow-lg py-2 min-w-[180px] z-50">
                                        {additionalMenus.map((menu) => {
                                            const category = menu.label.replace('#', '').trim().toLocaleLowerCase('tr-TR');

                                            // Normalize href to always have leading slash for comparison
                                            const normalizedHref = menu.href.startsWith('/') ? menu.href : `/${menu.href}`;

                                            const isSpecialRoute = normalizedHref === '/debe' ||
                                                normalizedHref === '/giris' ||
                                                normalizedHref === '/kayitol' ||
                                                normalizedHref === '/ayarlar' ||
                                                normalizedHref === '/arama' ||
                                                normalizedHref === '/istatistikler' ||
                                                menu.href.startsWith('http') ||
                                                menu.href.startsWith('/biri/') ||
                                                menu.href.startsWith('/basliklar/');

                                            const href = isSpecialRoute
                                                ? getMenuHref(menu.href)
                                                : `/?kategori=${category}`;

                                            return (
                                                <Link
                                                    key={menu._id}
                                                    href={href}
                                                    className="block px-4 py-2 text-sm text-foreground hover:bg-secondary hover:text-[#ff6600] transition-colors"
                                                    onClick={() => setShowMoreTopics(false)}
                                                >
                                                    {menu.label}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </nav>
                </div>
            </div>

        </header>
    )
}
