"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, User, UserPlus, Ban } from "lucide-react"
import Link from "next/link"

interface TopicFiltersProps {
    topicTitle: string
    topicCreator?: string
}

export function TopicFilters({ topicTitle, topicCreator = "anonim" }: TopicFiltersProps) {
    const [timeFilter, setTimeFilter] = useState("tümü")
    const [searchFilter, setSearchFilter] = useState("")
    const [searchType, setSearchType] = useState("kelime")
    const [isFollowing, setIsFollowing] = useState(false)
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)

    const containerRef = useRef<HTMLDivElement>(null)

    const timeOptions = [
        { value: "son-1-saat", label: "son 1 saat" },
        { value: "son-1-hafta", label: "son 1 hafta" },
        { value: "son-1-ay", label: "son 1 ay" },
        { value: "son-6-ay", label: "son 6 ay" },
        { value: "son-1-yil", label: "son 1 yıl" },
        { value: "tümü", label: "tümü" }
    ]

    const searchTypes = [
        { value: "kelime", label: "kelime" },
        { value: "yazar", label: "yazar ismi" }
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

    const handleFollow = () => {
        setIsFollowing(!isFollowing)
    }

    const handleBlockTopic = () => {
        if (confirm(`"${topicTitle}" başlığını engellemek istediğinize emin misiniz?`)) {
            alert("Başlık engellendi")
        }
    }

    return (
        <div ref={containerRef} className="flex items-center justify-between px-6 py-3 border-b border-border">
            {/* Left Side - Filters */}
            <div className="flex items-center gap-4">
                {/* Time Filter */}
                <div className="relative">
                    <button
                        onClick={() => toggleDropdown('time')}
                        className="flex items-center gap-1 text-sm text-foreground hover:text-[#4729ff] transition-colors"
                    >
                        {timeOptions.find(opt => opt.value === timeFilter)?.label}
                        <ChevronDown className="h-3 w-3" />
                    </button>
                    {openDropdown === 'time' && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-md shadow-lg py-1 min-w-[120px] z-10">
                            {timeOptions.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        setTimeFilter(option.value)
                                        setOpenDropdown(null)
                                    }}
                                    className={`w-full px-3 py-2 text-left text-sm hover:bg-secondary transition-colors ${timeFilter === option.value ? 'text-[#4729ff]' : 'text-foreground'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Search Filter */}
                <div className="relative">
                    <button
                        onClick={() => toggleDropdown('search')}
                        className="flex items-center gap-1 text-sm text-foreground hover:text-[#4729ff] transition-colors"
                    >
                        başlıkta ara
                        <ChevronDown className="h-3 w-3" />
                    </button>
                    {openDropdown === 'search' && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-md shadow-lg p-3 min-w-[200px] z-10">
                            <select
                                value={searchType}
                                onChange={(e) => setSearchType(e.target.value)}
                                className="w-full mb-2 px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-[#4729ff]"
                            >
                                {searchTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder={searchType === "kelime" ? "kelime ara..." : "yazar ara..."}
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-[#4729ff]"
                            />
                            <button
                                onClick={() => {
                                    // Apply search
                                    setOpenDropdown(null)
                                }}
                                className="w-full mt-2 px-3 py-1 text-sm bg-[#4729ff] text-white rounded hover:bg-[#3618ee] transition-colors"
                            >
                                ara
                            </button>
                        </div>
                    )}
                </div>

                {/* Follow Button */}
                <button
                    onClick={handleFollow}
                    className="text-sm text-foreground hover:text-[#4729ff] transition-colors"
                >
                    {isFollowing ? "takip etme" : "takip et"}
                </button>

                {/* Topic Creator */}
                <div className="relative">
                    <button
                        onClick={() => toggleDropdown('creator')}
                        className="flex items-center gap-1 text-sm text-foreground hover:text-[#4729ff] transition-colors"
                    >
                        başlık hakkında
                        <ChevronDown className="h-3 w-3" />
                    </button>
                    {openDropdown === 'creator' && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-md shadow-lg py-2 min-w-[180px] z-10">
                            <Link
                                href={`/yazar/${encodeURIComponent(topicCreator)}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors"
                                onClick={() => setOpenDropdown(null)}
                            >
                                <User className="h-4 w-4" />
                                {topicCreator}
                            </Link>
                            <button
                                onClick={() => {
                                    // Follow creator logic
                                    setOpenDropdown(null)
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors"
                            >
                                <UserPlus className="h-4 w-4" />
                                kişiyi takip et
                            </button>
                            <button
                                onClick={() => {
                                    handleBlockTopic()
                                    setOpenDropdown(null)
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-secondary transition-colors"
                            >
                                <Ban className="h-4 w-4" />
                                başlık sahibini engelle
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
