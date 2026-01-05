"use client"

import { Search, ChevronDown } from "lucide-react"
import { useState, useEffect, useRef } from "react"

import { Label } from "@/components/ui/label"
import { SidebarInput } from "@/components/ui/sidebar"

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  const [showFilters, setShowFilters] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowFilters(false)
      }
    }

    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showFilters])

  const handleApply = () => {
    // Apply filters logic here
    console.log("Filters applied:", { startDate, endDate, sortOrder })
    setShowFilters(false)
  }

  const handleReset = () => {
    setStartDate("")
    setEndDate("")
    setSortOrder("newest")
  }

  return (
    <form {...props}>
      <div className="relative" ref={dropdownRef}>
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <div className="relative flex items-center gap-1">
          <div className="relative flex-1">
            <SidebarInput
              id="search"
              placeholder="Ara..."
              className="h-8 pl-7 pr-2"
            />
            <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
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
                  placeholder="Başlangıç"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-[#4729ff]"
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
                onClick={handleReset}
                className="flex-1 px-3 py-1.5 text-sm border border-border rounded hover:bg-secondary transition-colors"
              >
                Sıfırla
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="flex-1 px-3 py-1.5 text-sm bg-[#4729ff] text-white rounded hover:bg-[#3820cc] transition-colors"
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
