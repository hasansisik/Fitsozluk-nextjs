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

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        type: 'bkz' | 'hede' | 'asterisk' | 'link' | 'spoiler';
        step: 1 | 2;
        value1: string;
        value2: string;
    }>({
        isOpen: false,
        type: 'bkz',
        step: 1,
        value1: '',
        value2: '',
    })

    const insertFormatting = (before: string, after: string = "", customText?: string) => {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = customText ?? content.substring(start, end)
        const newContent = content.substring(0, start) + before + selectedText + after + content.substring(end)

        setContent(newContent)

        // Set cursor position after insertion
        setTimeout(() => {
            textarea.focus()
            const newPosition = start + before.length + selectedText.length + after.length
            textarea.setSelectionRange(newPosition, newPosition)
        }, 0)
    }

    const openHelper = (type: 'bkz' | 'hede' | 'asterisk' | 'link' | 'spoiler') => {
        const textarea = textareaRef.current
        let initialValue = ''
        if (textarea) {
            initialValue = content.substring(textarea.selectionStart, textarea.selectionEnd)
        }

        setModalConfig({
            isOpen: true,
            type,
            step: 1,
            value1: initialValue || (type === 'link' ? 'http://' : ''),
            value2: '',
        })
    }

    const handleModalSubmit = () => {
        const { type, step, value1, value2 } = modalConfig

        if (type === 'bkz') {
            // For simple bkz links, add them at the end of the content
            const trimmedContent = content.trimEnd()
            const separator = trimmedContent ? '\n\n' : ''
            const bkzText = `(bkz: ${value1})`
            setContent(trimmedContent + separator + bkzText)

            // Focus textarea and move cursor to end
            setTimeout(() => {
                const textarea = textareaRef.current
                if (textarea) {
                    textarea.focus()
                    const newPosition = trimmedContent.length + separator.length + bkzText.length
                    textarea.setSelectionRange(newPosition, newPosition)
                }
            }, 0)
        } else if (type === 'hede') {
            // Hede: insert `text` format (will be bold link in entry card)
            insertFormatting("`", "`", value1)
        } else if (type === 'asterisk') {
            // Asterisk: insert `:text` format at the end
            const trimmedContent = content.trimEnd()
            const separator = trimmedContent ? '\n\n' : ''
            const asteriskText = "`:" + value1 + "`"
            setContent(trimmedContent + separator + asteriskText)

            // Focus textarea and move cursor to end
            setTimeout(() => {
                const textarea = textareaRef.current
                if (textarea) {
                    textarea.focus()
                    const newPosition = trimmedContent.length + separator.length + asteriskText.length
                    textarea.setSelectionRange(newPosition, newPosition)
                }
            }, 0)
        } else if (type === 'link') {
            if (step === 1) {
                setModalConfig(prev => ({ ...prev, step: 2 }))
                return
            }
            insertFormatting(`(bkz: ${value1}/`, ")", value2)
        } else if (type === 'spoiler') {
            insertFormatting("-- `spoiler` --\n", "\n-- `spoiler` --", value1)
        }

        setModalConfig(prev => ({ ...prev, isOpen: false }))
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
                    onClick={() => openHelper('bkz')}
                    className="px-3 py-1.5 text-xs border border-border bg-white rounded hover:bg-secondary transition-colors font-medium"
                    title="Bakınız ver"
                >
                    (bkz:)
                </button>
                <button
                    onClick={() => openHelper('hede')}
                    className="px-3 py-1.5 text-xs border border-border bg-white rounded hover:bg-secondary transition-colors font-medium"
                    title="Görünür link (bkz: hede)"
                >
                    hede
                </button>
                <button
                    onClick={() => openHelper('asterisk')}
                    className="px-3 py-1.5 text-xs border border-border bg-white rounded hover:bg-secondary transition-colors font-medium"
                    title="Yıldızlı bakınız (metin içinde sadece * görünür)"
                >
                    *
                </button>
                <button
                    onClick={() => openHelper('spoiler')}
                    className="px-3 py-1.5 text-xs border border-border bg-white rounded hover:bg-secondary transition-colors font-medium"
                >
                    - spoiler -
                </button>
                <button
                    onClick={() => openHelper('link')}
                    className="px-3 py-1.5 text-xs border border-border bg-white rounded hover:bg-secondary transition-colors font-medium"
                >
                    http://
                </button>
            </div>

            {/* Helper Modal */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] animate-in fade-in duration-200">
                    <div className="bg-white rounded-[16px] p-6 max-w-sm w-full mx-4 shadow-2xl border border-black/5 flex flex-col items-center text-center">
                        <h3 className="text-lg font-bold text-[#1a1a1a] mb-2 leading-tight">
                            fitsozluk.com web sitesinin mesajı
                        </h3>
                        <p className="text-[#4b4b4b] text-sm mb-4">
                            {modalConfig.type === 'bkz' && "hangi başlığa bkz verilecek?"}
                            {modalConfig.type === 'hede' && "hangi başlık için link oluşturulacak?"}
                            {modalConfig.type === 'asterisk' && "hangi kelime yazılacak?"}
                            {modalConfig.type === 'link' && (modalConfig.step === 1 ? "hangi adrese gidecek?" : "verilecek linkin adı ne olacak?")}
                            {modalConfig.type === 'spoiler' && "spoiler metin olarak ne yazmak istiyorsunuz?"}
                        </p>

                        <input
                            key={`${modalConfig.type}-${modalConfig.step}`}
                            autoFocus
                            type="text"
                            value={modalConfig.step === 1 ? modalConfig.value1 : modalConfig.value2}
                            onChange={(e) => {
                                const val = e.target.value
                                setModalConfig(prev => ({
                                    ...prev,
                                    [modalConfig.step === 1 ? 'value1' : 'value2']: val
                                }))
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleModalSubmit()
                                if (e.key === 'Escape') setModalConfig(prev => ({ ...prev, isOpen: false }))
                            }}
                            className="w-full px-3 py-2 border-2 border-[#e5e7eb] rounded-[10px] text-sm focus:outline-none focus:border-[#a855f7] transition-all mb-5"
                        />

                        <div className="flex gap-3 w-full">
                            <button
                                onClick={handleModalSubmit}
                                className="flex-1 py-2.5 bg-[#8b4513] text-white rounded-full text-sm font-bold hover:bg-[#723a10] transition-colors"
                            >
                                Tamam
                            </button>
                            <button
                                onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                                className="flex-1 py-2.5 bg-[#ffdab9] text-[#1a1a1a] rounded-full text-sm font-bold hover:bg-[#fcd5b0] transition-colors"
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
