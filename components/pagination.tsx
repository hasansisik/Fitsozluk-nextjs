"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

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
        <div className="flex items-center justify-end gap-2 py-4 px-6">
            {/* Previous Button - Only show if not on first page */}
            {currentPage > 1 && (
                <button
                    onClick={handlePrevPage}
                    className="flex items-center justify-center h-9 w-9 rounded border border-border text-foreground hover:bg-secondary transition-colors"
                    aria-label="Önceki sayfa"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
            )}

            {/* Current Page Dropdown */}
            <select
                value={currentPage}
                onChange={handleSelectChange}
                className="h-9 px-3 pr-8 rounded border border-border bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#4729ff] cursor-pointer"
            >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <option key={page} value={page}>
                        {page}
                    </option>
                ))}
            </select>

            {/* Separator */}
            <span className="text-muted-foreground">/</span>

            {/* Total Pages - Click to go to last page */}
            <button
                onClick={handleTotalPagesClick}
                className="h-9 w-16 px-3 rounded border border-border bg-white text-sm text-center hover:bg-secondary transition-colors focus:outline-none focus:ring-1 focus:ring-[#4729ff]"
                title="Son sayfaya git"
            >
                {totalPages}
            </button>

            {/* Next Button */}
            <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center h-9 w-9 rounded border transition-colors ${currentPage === totalPages
                        ? 'border-border text-muted-foreground cursor-not-allowed bg-secondary'
                        : 'border-border text-foreground hover:bg-secondary'
                    }`}
                aria-label="Sonraki sayfa"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    )
}
