"use client"

import { Search, Menu, ChevronDown, User, Settings, MoreHorizontal, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import axios from "axios"
import { server } from "@/config"
import { loadUser, logout } from "@/redux/actions/userActions"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getFeaturedMenus } from "@/redux/actions/menuActions"
import AccountSwitcher from "@/components/AccountSwitcher"
import { oauthConfig, endpoints } from "@/config"
import { Skeleton } from "@/components/ui/skeleton"

export function DictionaryHeader() {
    const router = useRouter()
    const pathname = usePathname()
    const dispatch = useAppDispatch()
    const { user, isAuthenticated, loading } = useAppSelector((state) => state.user)
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
    const [isInitialLoading, setIsInitialLoading] = useState(true)

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
            dispatch(loadUser()).finally(() => {
                setIsInitialLoading(false)
            })
        } else {
            setIsInitialLoading(false)
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

        // Fitmail Auth Success Listener
        const authChannel = new BroadcastChannel("fitmail_auth_channel");
        const handleAuthMessage = (event: MessageEvent) => {
            if (event.data.type === "FITMAIL_AUTH_SUCCESS") {
                if (event.data.user && event.data.user.token) {
                    const token = event.data.user.token;
                    localStorage.setItem("accessToken", token);
                    document.cookie = `token=${token}; path=/; max-age=${365 * 24 * 60 * 60}`;
                }
                // Reload page to update UI and close popup
                authChannel.close();
                window.location.reload();
            }
        };
        authChannel.onmessage = handleAuthMessage;

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            authChannel.close();
        }
    }, [dispatch, isAuthenticated])

    const handleFitmailAuth = (mode: "login" | "register" = "login") => {
        const state = Math.random().toString(36).substring(7);
        localStorage.setItem('oauth_state', state);
        const authUrl = `${endpoints.oauth.authorize}?client_id=${oauthConfig.clientId}&redirect_uri=${encodeURIComponent(oauthConfig.redirectUri)}&response_type=code&scope=${encodeURIComponent(oauthConfig.scope)}&state=${state}${mode === 'register' ? '&prompt=register' : ''}`;

        // Calculate popup position (centered relative to current window)
        const width = 500;
        const height = 650;

        // Fix for dual-screen monitors
        const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
        const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

        const windowWidth = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        const windowHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

        const left = ((windowWidth / 2) - (width / 2)) + dualScreenLeft;
        const top = ((windowHeight / 2) - (height / 2)) + dualScreenTop;

        // Open window first
        const popup = window.open(
            "about:blank",
            "FitmailAuth",
            `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
        );

        if (popup) {
            // Inject a loading UI immediately to avoid any 404 flash
            popup.document.write(`
                <html>
                    <head>
                        <title>Yönlendiriliyorsunuz...</title>
                        <style>
                            body {
                                margin: 0;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                                min-h: 100vh;
                                height: 100vh;
                                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                                background: white;
                            }
                            .loader {
                                border: 3px solid #f3f3f3;
                                border-top: 3px solid #ff6600;
                                border-radius: 50%;
                                width: 40px;
                                height: 40px;
                                animation: spin 1s linear infinite;
                                margin-bottom: 20px;
                            }
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                            .text {
                                color: #ff6600;
                                font-weight: 500;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="loader"></div>
                        <div class="text">Fitmail'e yönlendiriliyorsunuz...</div>
                    </body>
                </html>
            `);

            // Redirect after a tiny delay
            setTimeout(() => {
                popup.location.href = authUrl;
                popup.focus();
            }, 100);
        }
    };

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

                const [topicsResponse, usersResponse] = await Promise.all([
                    axios.get(`${server}/topics?search=${encodeURIComponent(query)}`, config).catch(() => ({ data: { topics: [], exactMatchExists: false } })),
                    axios.get(`${server}/auth/search-users?search=${encodeURIComponent(query)}&limit=5`, config).catch((err) => {
                        console.error("User search error:", err)
                        return { data: { success: false, users: [] } }
                    })
                ])
                setExactMatchExists(topicsResponse.data.exactMatchExists || false)

                const topics = topicsResponse.data.topics || []
                topics.slice(0, 5).forEach((topic: any) => {
                    results.push({
                        type: 'topic',
                        title: topic.title,
                        slug: topic.slug,
                        entryCount: topic.entryCount
                    })
                })

                let users = []
                if (usersResponse.data.users) {
                    users = usersResponse.data.users
                } else if (Array.isArray(usersResponse.data)) {
                    users = usersResponse.data
                }

                users.forEach((user: any) => {
                    results.push({
                        type: 'user',
                        nick: user.nick,
                        _id: user._id
                    })
                })

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
                        <Link href="/" className="mr-2 lg:mr-6 flex items-center space-x-2 flex-shrink-0">
                            <div className="flex items-center">
                                {/* Desktop Logo */}
                                <Image
                                    src="/fitsözlük.png"
                                    alt="fitsözlük"
                                    width={140}
                                    height={35}
                                    className="hidden lg:block h-6 w-auto"
                                    priority
                                />
                                {/* Mobile Logo */}
                                <Image
                                    src="/fiticon.png"
                                    alt="fitsözlük"
                                    width={32}
                                    height={32}
                                    className="lg:hidden h-8 w-auto"
                                    priority
                                />
                            </div>
                        </Link>

                        {/* Search Bar - Centered on desktop, flex-1 on mobile */}
                        <div ref={searchRef} className="flex-1 lg:absolute lg:left-1/2 lg:-translate-x-1/2 w-full lg:max-w-md px-2 lg:px-4">
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
                                        className="w-full rounded-md border-2 border-input bg-background pl-9 lg:pl-10 pr-16 lg:pr-20 py-1.5 lg:py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-[#ff6600]"
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
                                            className="h-8 w-8 flex items-center justify-center bg-[#ffa500] hover:bg-[#ff8c00] rounded-md transition-colors"
                                            title="Filtreler"
                                        >
                                            <ChevronDown className="h-4 w-4 text-white" />
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


                        {/* User Actions - Desktop Only */}
                        <div className="hidden lg:flex items-center space-x-1 ml-auto flex-shrink-0 min-w-[150px] justify-end">
                            {(loading || isInitialLoading) ? (
                                <Skeleton className="w-24 h-9 rounded-md" />
                            ) : isAuthenticated && user && (user.nick || user.name) ? (
                                <>
                                    <Link
                                        href={`/yazar/${user.nick || user._id}`}
                                        className="p-2 text-foreground hover:text-[#ff6600] transition-colors"
                                        title="Profilim"
                                    >
                                        <User className="h-5 w-5" />
                                    </Link>
                                    <Link
                                        href="/ayarlar"
                                        className="p-2 text-foreground hover:text-[#ff6600] transition-colors"
                                        title="Ayarlar"
                                    >
                                        <Settings className="h-5 w-5" />
                                    </Link>
                                    <AccountSwitcher currentUser={{
                                        name: user.name || user.nick || "Kullanıcı",
                                        email: user.email || "",
                                        picture: user.picture || user.profile?.picture || ""
                                    }} />
                                </>
                            ) : (
                                <button
                                    onClick={() => handleFitmailAuth("login")}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#ff6600] rounded-full hover:bg-[#ff6600]/5 transition-all"
                                >
                                    <User className="h-4 w-4" />
                                    giriş yap
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Topic Navigation */}
            <div className="bg-white border-t border-border/50">
                <div className="max-w-[1300px] mx-auto px-4 lg:px-8">
                    <nav className="flex items-center h-10">
                        {/* Scrollable Container for Topics and Auth */}
                        <div className="flex-1 overflow-x-auto no-scrollbar scroll-smooth flex items-center">
                            <div className="flex items-center space-x-4 lg:space-x-0 lg:justify-between lg:w-full">
                                {/* Main Topics */}
                                {featuredMenus.map((menu) => {
                                    const category = menu.label.replace('#', '').trim().toLocaleLowerCase('tr-TR');
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

                                    const isGundemOrDebe = normalizedHref === '/debe' || normalizedHref === '/';

                                    const mobileHref = (isSpecialRoute && !isGundemOrDebe)
                                        ? getMenuHref(menu.href)
                                        : `/gundem?category=${category}`;

                                    const desktopHref = isSpecialRoute
                                        ? getMenuHref(menu.href)
                                        : `/?kategori=${category}`;

                                    return (
                                        <div key={menu._id}>
                                            <Link
                                                href={desktopHref}
                                                className="text-sm font-medium text-foreground hover:text-[#ff6600] hover:underline transition-colors whitespace-nowrap hidden lg:block"
                                            >
                                                {menu.label}
                                            </Link>
                                            <Link
                                                href={mobileHref}
                                                className="text-sm font-medium text-foreground hover:text-[#ff6600] hover:underline transition-colors whitespace-nowrap block lg:hidden"
                                            >
                                                {menu.label}
                                            </Link>
                                        </div>
                                    );
                                })}

                                {/* Mobile User Actions - Visible only on mobile */}
                                <div className="flex lg:hidden items-center space-x-4">
                                    {(loading || isInitialLoading) ? (
                                        <Skeleton className="w-14 h-4 rounded" />
                                    ) : isAuthenticated && user ? (
                                        <>

                                            <Link
                                                href={`/yazar/${user.nick}`}
                                                className="text-foreground hover:text-[#ff6600] transition-colors"
                                                title="Profilim"
                                            >
                                                <User className="h-5 w-5" />
                                            </Link>
                                            <Link
                                                href="/ayarlar"
                                                className="text-foreground hover:text-[#ff6600] transition-colors"
                                                title="Ayarlar"
                                            >
                                                <Settings className="h-5 w-5" />
                                            </Link>
                                            <AccountSwitcher currentUser={{
                                                name: user.name || user.nick || "Kullanıcı",
                                                email: user.email || "",
                                                picture: user.picture || user.profile?.picture || ""
                                            }} />
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleFitmailAuth("login")}
                                            className="flex items-center gap-1.5 px-3 py-1 text-sm font-medium text-[#ff6600] whitespace-nowrap"
                                        >
                                            <User className="h-3.5 w-3.5" />
                                            giriş yap
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* More Topics Dropdown - Outside scrollable to prevent clipping */}
                        {additionalMenus.length > 0 && (
                            <div ref={moreTopicsRef} className="relative flex-shrink-0 ml-4 pl-3 border-l border-border/50">
                                <button
                                    onClick={() => {
                                        setShowMoreTopics(!showMoreTopics)
                                        setShowSettingsMenu(false)
                                    }}
                                    className="text-sm text-foreground hover:text-[#ff6600] transition-colors flex items-center"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </button>

                                {/* Dropdown Menu */}
                                {showMoreTopics && (
                                    <div className="absolute top-full right-0 mt-2 bg-white border border-border rounded-md shadow-xl py-2 min-w-[200px] z-[60]">
                                        {additionalMenus.map((menu) => {
                                            const category = menu.label.replace('#', '').trim().toLocaleLowerCase('tr-TR');
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

                                            const isGundemOrDebe = normalizedHref === '/debe' || normalizedHref === '/';

                                            const mobileHref = (isSpecialRoute && !isGundemOrDebe)
                                                ? getMenuHref(menu.href)
                                                : `/gundem?category=${category}`;

                                            const desktopHref = isSpecialRoute
                                                ? getMenuHref(menu.href)
                                                : `/?kategori=${category}`;

                                            return (
                                                <div key={menu._id}>
                                                    <Link
                                                        href={desktopHref}
                                                        className="px-4 py-2.5 text-sm text-foreground hover:bg-secondary hover:text-[#ff6600] transition-colors hidden lg:block"
                                                        onClick={() => setShowMoreTopics(false)}
                                                    >
                                                        {menu.label}
                                                    </Link>
                                                    <Link
                                                        href={mobileHref}
                                                        className="px-4 py-2.5 text-sm text-foreground hover:bg-secondary hover:text-[#ff6600] transition-colors block lg:hidden"
                                                        onClick={() => setShowMoreTopics(false)}
                                                    >
                                                        {menu.label}
                                                    </Link>
                                                </div>
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
