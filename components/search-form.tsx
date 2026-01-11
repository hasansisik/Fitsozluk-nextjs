"use client"

import { Search, ChevronDown, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch } from "@/redux/hook"
import { getAllTopics } from "@/redux/actions/topicActions"
import { getAllEntries } from "@/redux/actions/entryActions"
import { searchUsers } from "@/redux/actions/userActions"

import { Label } from "@/components/ui/label"
import { SidebarInput } from "@/components/ui/sidebar"
import Link from "next/link"

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any>({
    topics: [],
    entries: [],
    users: []
  })
  const [showResults, setShowResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowFilters(false)
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults({ topics: [], entries: [], users: [] })
      setShowResults(false)
      return
    }

    setIsSearching(true)
    setShowResults(true)

    try {
      // Search topics
      const topicsResult = await dispatch(getAllTopics({
        search: query
      })).unwrap()

      // Search entries
      let entryParams: any = {
        search: query,
        isActive: true
      }
      if (startDate) entryParams.startDate = startDate
      if (endDate) entryParams.endDate = endDate
      if (sortOrder) entryParams.sort = sortOrder === "newest" ? "-createdAt" : "createdAt"

      const entriesResult = await dispatch(getAllEntries(entryParams)).unwrap()

      // Search users
      const usersResult = await dispatch(searchUsers({
        search: query,
        limit: 5
      })).unwrap()

      setSearchResults({
        topics: (topicsResult.topics || topicsResult || []).slice(0, 5),
        entries: (entriesResult || []).slice(0, 5),
        users: usersResult || []
      })
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults({ topics: [], entries: [], users: [] })
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    // Debounce search
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    searchTimeout.current = setTimeout(() => {
      performSearch(query)
    }, 500)
  }

  const handleApply = () => {
    performSearch(searchQuery)
    setShowFilters(false)
  }

  const handleReset = () => {
    setStartDate("")
    setEndDate("")
    setSortOrder("newest")
    performSearch(searchQuery)
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setSearchResults({ topics: [], entries: [], users: [] })
    setShowResults(false)
  }

  return (
    <form {...props} onSubmit={(e) => e.preventDefault()}>
      <div className="relative" ref={dropdownRef}>
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <div className="relative flex items-center gap-1">
          <div className="relative flex-1">
            <SidebarInput
              id="search"
              placeholder="başlık, #entry, @yazar"
              className="h-8 pl-7 pr-8"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute top-1/2 right-2 -translate-y-1/2 hover:bg-secondary rounded p-0.5"
              >
                <X className="size-3 opacity-50" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="h-8 w-8 flex items-center justify-center hover:bg-secondary rounded-md transition-colors"
            title="Filtreler"
          >
            <ChevronDown className="size-4 opacity-50" />
          </button>
        </div>

        {/* Search Results */}
        {showResults && searchQuery && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-lg shadow-lg max-h-[400px] overflow-y-auto z-50">
            {isSearching ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Aranıyor...
              </div>
            ) : (
              <>
                {/* Topics */}
                {searchResults.topics.length > 0 && (
                  <div className="p-2 border-b">
                    <p className="text-xs font-medium text-muted-foreground px-2 mb-1">Başlıklar</p>
                    {searchResults.topics.map((topic: any) => (
                      <Link
                        key={topic._id}
                        href={`/${topic.slug}`}
                        className="block px-2 py-1.5 text-sm hover:bg-secondary rounded"
                        onClick={() => {
                          setShowResults(false)
                          setSearchQuery("")
                        }}
                      >
                        {topic.title}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Users */}
                {searchResults.users.length > 0 && (
                  <div className="p-2 border-b">
                    <p className="text-xs font-medium text-muted-foreground px-2 mb-1">Yazarlar</p>
                    {searchResults.users.map((user: any) => (
                      <Link
                        key={user._id}
                        href={`/yazar/${user.nick}`}
                        className="block px-2 py-1.5 text-sm hover:bg-secondary rounded"
                        onClick={() => {
                          setShowResults(false)
                          setSearchQuery("")
                        }}
                      >
                        @{user.nick}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Entries */}
                {searchResults.entries.length > 0 && (
                  <div className="p-2">
                    <p className="text-xs font-medium text-muted-foreground px-2 mb-1">Entry'ler</p>
                    {searchResults.entries.map((entry: any) => (
                      <Link
                        key={entry._id}
                        href={`/${entry.topic?.slug || ''}`}
                        className="block px-2 py-1.5 text-sm hover:bg-secondary rounded"
                        onClick={() => {
                          setShowResults(false)
                          setSearchQuery("")
                        }}
                      >
                        <p className="line-clamp-2">{entry.content}</p>
                      </Link>
                    ))}
                  </div>
                )}

                {/* No Results */}
                {searchResults.topics.length === 0 &&
                  searchResults.users.length === 0 &&
                  searchResults.entries.length === 0 && (
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground mb-3 text-center">
                        "{searchQuery}" için sonuç bulunamadı
                      </p>
                      <Link
                        href={`/baslik-olustur?title=${encodeURIComponent(searchQuery)}`}
                        className="block w-full px-4 py-2 bg-[#ff6600] text-white rounded hover:bg-[#e65c00] transition-colors text-center text-sm"
                        onClick={() => {
                          setShowResults(false)
                        }}
                      >
                        Bu başlığı oluştur
                      </Link>
                    </div>
                  )}
              </>
            )}
          </div>
        )}

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
                  className="w-full px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-[#ff6600]"
                  placeholder="Başlangıç"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-[#ff6600]"
                  placeholder="Bitiş"
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
                onClick={handleReset}
                className="flex-1 px-3 py-1.5 text-sm border border-border rounded hover:bg-secondary transition-colors"
              >
                Sıfırla
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="flex-1 px-3 py-1.5 text-sm bg-[#ff6600] text-white rounded hover:bg-[#e65c00] transition-colors"
              >
                Uygula
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  )
}
