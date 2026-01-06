"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, User, UserPlus, Ban, Search } from "lucide-react"
import Link from "next/link"

interface TopicFiltersProps {
    topicTitle: string
    topicCreator?: string
    topicCreatorPicture?: string
}

export function TopicFilters({ topicTitle, topicCreator = "anonim", topicCreatorPicture }: TopicFiltersProps) {
    const [timeFilter, setTimeFilter] = useState("tümü")
    const [searchFilter, setSearchFilter] = useState("")
    const [isFollowing, setIsFollowing] = useState(false)
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)

    const containerRef = useRef<HTMLDivElement>(null)

    const timeOptions = [
        { value: "son-24-saat", label: "son 24 saat" },
        { value: "son-1-hafta", label: "son 1 hafta" },
        { value: "son-1-ay", label: "son 1 ay" },
        { value: "son-3-ay", label: "son 3 ay" },
        { value: "tümü", label: "tümü" }
    ]

    const searchOptions = [
        { label: "bugün" },
        { label: "ekşi şeyler'de" },
        { label: "linkler" },
        { label: "benimkiler" },
        { label: "görseller" },
        { label: "çaylaklar" }
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
        <div ref={containerRef} className="flex items-center gap-3">
            {/* Şükela Filter */}
            <div className="relative">
                <button
                    onClick={() => toggleDropdown('time')}
                    className="flex items-center gap-0.5 text-xs text-foreground hover:text-[#4729ff] transition-colors"
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
                                }}
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors ${timeFilter === option.value ? 'text-[#4729ff] font-medium' : 'text-foreground'
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
                    className="flex items-center gap-0.5 text-xs text-foreground hover:text-[#4729ff] transition-colors"
                >
                    başlıkta ara
                    <ChevronDown className="h-3 w-3 opacity-40" />
                </button>
                {openDropdown === 'search' && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded shadow-lg p-1 min-w-[200px] z-50">
                        {searchOptions.map((opt, i) => (
                            <button key={i} className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors text-foreground">
                                {opt.label}
                            </button>
                        ))}
                        <div className="p-2 border-t border-border mt-1">
                            <div className="flex gap-1">
                                <input
                                    type="text"
                                    placeholder="kelime ya da @yazar"
                                    value={searchFilter}
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                    className="flex-1 px-2 py-1.5 text-xs border border-border rounded focus:outline-none"
                                />
                                <button className="p-1.5 bg-[#82bc42] text-white rounded hover:bg-[#71a439]">
                                    <Search className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Takip Et */}
            <button
                onClick={handleFollow}
                className="text-xs text-foreground hover:text-[#4729ff] transition-colors"
            >
                {isFollowing ? "takibi bırak" : "takip et"}
            </button>

            {/* Başlığı Açan */}
            <div className="relative">
                <button
                    onClick={() => toggleDropdown('creator')}
                    className="flex items-center gap-0.5 text-xs text-foreground hover:text-[#4729ff] transition-colors"
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
                        <button
                            onClick={() => {
                                setOpenDropdown(null)
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors text-foreground"
                        >
                            takip et
                        </button>
                        <button
                            onClick={() => {
                                handleBlockTopic()
                                setOpenDropdown(null)
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors text-foreground"
                        >
                            başlıklarını engelle
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
