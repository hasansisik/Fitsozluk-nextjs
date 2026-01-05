"use client"

import { useState, useRef } from "react"

interface EntryFormProps {
    topicTitle?: string
    topicSlug?: string
    remainingEntries?: number
    onEntrySubmit?: () => void
}

export function EntryForm({ topicTitle = "kedisiz sokaklar istiyoruz", topicSlug = "", remainingEntries = 83, onEntrySubmit }: EntryFormProps) {
    const [content, setContent] = useState("")
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const insertFormatting = (before: string, after: string = "") => {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = content.substring(start, end)
        const newContent = content.substring(0, start) + before + selectedText + after + content.substring(end)

        setContent(newContent)

        // Set cursor position after insertion
        setTimeout(() => {
            textarea.focus()
            const newPosition = start + before.length + selectedText.length
            textarea.setSelectionRange(newPosition, newPosition)
        }, 0)
    }

    const handleSubmit = () => {
        if (!content.trim()) {
            alert("Entry içeriği boş olamaz!")
            return
        }

        // Get current user
        const mockUser = localStorage.getItem("mockUser")
        if (!mockUser) {
            alert("Giriş yapmalısınız!")
            return
        }

        const user = JSON.parse(mockUser)

        // Create new entry with consistent date format
        const now = new Date()
        const day = String(now.getDate()).padStart(2, '0')
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const year = now.getFullYear()
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')

        const newEntry = {
            id: `entry-${now.getTime()}`,
            content: content.trim(),
            author: user.nick,
            date: `${day}.${month}.${year}`,
            time: `${hours}:${minutes}`,
            isSpecial: false,
            topicTitle: topicTitle,
            topicSlug: topicSlug
        }

        // Get existing entries from localStorage or use empty array
        const existingEntries = JSON.parse(localStorage.getItem("userEntries") || "[]")

        // Add new entry to the beginning
        existingEntries.unshift(newEntry)

        // Save to localStorage
        localStorage.setItem("userEntries", JSON.stringify(existingEntries))

        setContent("")

        // Call callback to refresh entries
        if (onEntrySubmit) {
            onEntrySubmit()
        }
    }

    return (
        <div className="border-t border-border bg-[#f8f9fa] p-6">
            {/* Entry count */}
            {remainingEntries > 0 && (
                <div className="text-center text-sm text-muted-foreground mb-4">
                    {remainingEntries} entry daha
                </div>
            )}

            {/* Formatting toolbar */}
            <div className="flex gap-2 mb-3 flex-wrap">
                <button
                    onClick={() => insertFormatting("(bkz: ", ")")}
                    className="px-3 py-1.5 text-sm border border-border bg-white rounded hover:bg-secondary transition-colors"
                >
                    (bkz:)
                </button>
                <button
                    onClick={() => insertFormatting("hede")}
                    className="px-3 py-1.5 text-sm border border-border bg-white rounded hover:bg-secondary transition-colors"
                >
                    hede
                </button>
                <button
                    onClick={() => insertFormatting("*", "*")}
                    className="px-3 py-1.5 text-sm border border-border bg-white rounded hover:bg-secondary transition-colors"
                >
                    *
                </button>
                <button
                    onClick={() => insertFormatting("-- `spoiler` --\n", "\n-- `spoiler` --")}
                    className="px-3 py-1.5 text-sm border border-border bg-white rounded hover:bg-secondary transition-colors"
                >
                    - spoiler -
                </button>
                <button
                    onClick={() => insertFormatting("http://")}
                    className="px-3 py-1.5 text-sm border border-border bg-white rounded hover:bg-secondary transition-colors"
                >
                    http://
                </button>
            </div>

            {/* Textarea */}
            <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`"${topicTitle}" hakkında bilgi verin`}
                className="w-full min-h-[200px] p-4 text-sm border border-border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-[#4729ff] bg-white"
            />

            {/* Bottom controls */}
            <div className="flex items-center justify-end mt-3">
                <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-[#4729ff] text-white rounded-md text-sm font-medium hover:bg-[#3820cc] transition-colors"
                >
                    yayımla
                </button>
            </div>
        </div>
    )
}
