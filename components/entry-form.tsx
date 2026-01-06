import { useState, useRef } from "react"
import { useAppDispatch } from "@/redux/hook"
import { createEntry } from "@/redux/actions/entryActions"
import { Loader2 } from "lucide-react"

interface EntryFormProps {
    topicTitle?: string
    topicId?: string
    remainingEntries?: number
    onEntrySubmit?: () => void
}

export function EntryForm({ topicTitle = "", topicId = "", remainingEntries = 0, onEntrySubmit }: EntryFormProps) {
    const [content, setContent] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const dispatch = useAppDispatch()

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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            handleSubmit()
        }
    }

    const handleSubmit = async () => {
        if (!content.trim() || isSubmitting) {
            return
        }

        if (!topicId) {
            alert("Başlık bilgisi bulunamadı!")
            return
        }

        setIsSubmitting(true)
        try {
            const result = await dispatch(createEntry({
                content: content.trim(),
                topic: topicId
            })).unwrap()

            if (result) {
                setContent("")
                if (onEntrySubmit) {
                    onEntrySubmit()
                }
            }
        } catch (error: any) {
            alert(error || "Entry gönderilirken bir hata oluştu.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="p-0">
            {/* Formatting toolbar */}
            <div className="flex gap-2 mb-3 flex-wrap">
                <button
                    onClick={() => insertFormatting("(bkz: ", ")")}
                    className="px-3 py-1.5 text-xs border border-border bg-white rounded hover:bg-secondary transition-colors font-medium"
                >
                    (bkz:)
                </button>
                <button
                    onClick={() => insertFormatting("hede")}
                    className="px-3 py-1.5 text-xs border border-border bg-white rounded hover:bg-secondary transition-colors font-medium"
                >
                    hede
                </button>
                <button
                    onClick={() => insertFormatting("*", "*")}
                    className="px-3 py-1.5 text-xs border border-border bg-white rounded hover:bg-secondary transition-colors font-medium"
                >
                    *
                </button>
                <button
                    onClick={() => insertFormatting("-- `spoiler` --\n", "\n-- `spoiler` --")}
                    className="px-3 py-1.5 text-xs border border-border bg-white rounded hover:bg-secondary transition-colors font-medium"
                >
                    - spoiler -
                </button>
                <button
                    onClick={() => insertFormatting("http://")}
                    className="px-3 py-1.5 text-xs border border-border bg-white rounded hover:bg-secondary transition-colors font-medium"
                >
                    http://
                </button>
            </div>

            {/* Textarea */}
            <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`"${topicTitle}" hakkında bilgi verin`}
                className="w-full min-h-[160px] p-4 text-sm border border-border rounded-md resize-y focus:outline-none focus:ring-1 focus:ring-[#4729ff] bg-white"
            />

            {/* Bottom controls */}
            <div className="flex items-center justify-between mt-3">
                <div className="text-[10px] text-muted-foreground italic">
                    (Ctrl/Cmd + Enter ile yayımla)
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !content.trim()}
                    className="px-6 py-2 bg-[#4729ff] text-white rounded-md text-sm font-medium hover:bg-[#3820cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            gönderiliyor...
                        </>
                    ) : (
                        "yayımla"
                    )}
                </button>
            </div>
        </div>
    )
}
