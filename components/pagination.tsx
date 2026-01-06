"use client"

import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onPageChange(Number(e.target.value))
    }

    const handleTotalPagesClick = () => {
        onPageChange(totalPages)
    }

    const handlePrevPage = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1)
        }
    }

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1)
        }
    }

    return (
        <div className="flex items-center justify-end gap-1.5 py-0 px-0">
            {/* Previous Button - Only show if not on first page */}
            {currentPage > 1 && (
                <button
                    onClick={handlePrevPage}
                    className="flex items-center justify-center h-8 w-8 rounded border border-border text-foreground hover:bg-secondary transition-colors"
                    aria-label="Önceki sayfa"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                </button>
            )}

            {/* Current Page Dropdown */}
            <div className="relative h-8">
                <select
                    value={currentPage}
                    onChange={handleSelectChange}
                    className="appearance-none h-8 pl-2 pr-6 rounded border border-border bg-white text-xs focus:outline-none cursor-pointer"
                >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <option key={page} value={page}>
                            {page}
                        </option>
                    ))}
                </select>
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                    <ChevronDown className="h-3 w-3" />
                </div>
            </div>

            {/* Separator */}
            <span className="text-muted-foreground text-xs">/</span>

            {/* Total Pages - Click to go to last page */}
            <button
                onClick={handleTotalPagesClick}
                className="h-8 min-w-[32px] px-2 rounded border border-border bg-white text-xs text-center hover:bg-secondary transition-colors focus:outline-none"
                title="Son sayfaya git"
            >
                {totalPages}
            </button>

            {/* Next Button */}
            <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center h-8 w-8 rounded border transition-colors ${currentPage === totalPages
                    ? 'border-border text-muted-foreground cursor-not-allowed bg-secondary'
                    : 'border-border text-foreground hover:bg-secondary'
                    }`}
                aria-label="Sonraki sayfa"
            >
                <ChevronRight className="h-3.5 w-3.5" />
            </button>
        </div>
    )
}
