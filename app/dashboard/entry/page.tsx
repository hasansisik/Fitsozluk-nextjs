"use client"

import { useEffect, useState, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import {
    getAllEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    Entry
} from "@/redux/actions/entryActions"
import {
    getAllTopics,
    Topic
} from "@/redux/actions/topicActions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

export default function EntryPage() {
    const dispatch = useAppDispatch()
    const { entries, loading, error } = useAppSelector((state) => state.entry)
    const { topics } = useAppSelector((state) => state.topic)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingEntry, setEditingEntry] = useState<Entry | null>(null)

    const [formData, setFormData] = useState({
        content: "",
        topic: ""
    })
    const textareaRef = useRef<HTMLTextAreaElement>(null)

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
        const selectedText = customText ?? formData.content.substring(start, end)
        const newContent = formData.content.substring(0, start) + before + selectedText + after + formData.content.substring(end)

        setFormData(prev => ({ ...prev, content: newContent }))

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
            initialValue = formData.content.substring(textarea.selectionStart, textarea.selectionEnd)
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
            insertFormatting("(bkz: ", ")", value1)
        } else if (type === 'hede') {
            if (step === 1) {
                setModalConfig(prev => ({ ...prev, step: 2 }))
                return
            }
            insertFormatting(`(bkz: ${value1}/`, ")", value2)
        } else if (type === 'asterisk') {
            insertFormatting("(bkz: *", "*)", value1)
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

    useEffect(() => {
        dispatch(getAllEntries({}))
        dispatch(getAllTopics({}))
    }, [dispatch])

    const handleSubmit = async () => {
        if (!formData.content || !formData.topic) return

        if (editingEntry) {
            await dispatch(updateEntry({
                id: editingEntry._id,
                content: formData.content
            }))
        } else {
            await dispatch(createEntry(formData))
        }

        setIsDialogOpen(false)
        setEditingEntry(null)
        setFormData({ content: "", topic: "" })
        dispatch(getAllEntries({}))
    }

    const handleEdit = (entry: Entry) => {
        setEditingEntry(entry)
        setFormData({
            content: entry.content,
            topic: entry.topic._id
        })
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (confirm("Silmek istediğinize emin misiniz?")) {
            await dispatch(deleteEntry(id))
            dispatch(getAllEntries({}))
        }
    }

    const handleToggleActive = async (entry: Entry) => {
        await dispatch(updateEntry({
            id: entry._id,
            isActive: !entry.isActive
        }))
        dispatch(getAllEntries({}))
    }

    return (
        <div className="flex flex-col min-h-screen w-full bg-background overflow-hidden">
            {/* Header Area */}
            <div className="border-b border-border bg-background p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold tracking-tight text-foreground">Entry Yönetimi</h1>
                    <p className="text-xs text-muted-foreground">
                        Entry'leri görüntüleyin, düzenleyin ve yönetin.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {error && (
                        <span className="text-xs text-destructive font-medium mr-2">{error}</span>
                    )}
                    <Button
                        onClick={() => {
                            setEditingEntry(null)
                            setFormData({ content: "", topic: "" })
                            setIsDialogOpen(true)
                        }}
                        className="bg-[#ff6600] hover:bg-[#e65c00] text-white rounded-md px-6 font-medium transition-all active:scale-95 shadow-none"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Yeni Entry
                    </Button>
                </div>
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                <div className="w-full">
                    {loading && entries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-[#ff6600]" />
                            <p className="text-sm text-muted-foreground animate-pulse">Entry'ler yükleniyor...</p>
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                            <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                            <p className="text-sm">Henüz bir entry eklenmemiş.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {entries.map((entry) => (
                                <div
                                    key={entry._id}
                                    className="group flex flex-col gap-3 py-4 px-6 border-b border-border transition-all duration-200 bg-background hover:bg-secondary/30"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-medium text-[#ff6600]">
                                                    {entry.topic.title}
                                                </span>
                                                <span className="text-xs text-muted-foreground">•</span>
                                                <span className="text-xs text-muted-foreground">
                                                    @{entry.author.nick}
                                                </span>
                                                {!entry.isActive && (
                                                    <>
                                                        <span className="text-xs text-muted-foreground">•</span>
                                                        <span className="text-xs text-red-500">Pasif</span>
                                                    </>
                                                )}
                                            </div>
                                            <p className={cn(
                                                "text-sm text-foreground whitespace-pre-wrap",
                                                !entry.isActive && "opacity-50 line-through"
                                            )}>
                                                {entry.content}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                                <span>❤️ {entry.favoriteCount}</span>
                                                <span>•</span>
                                                <span>{new Date(entry.createdAt || "").toLocaleDateString('tr-TR')}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground"
                                                onClick={() => handleToggleActive(entry)}
                                            >
                                                {entry.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                onClick={() => handleEdit(entry)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(entry._id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Dialog for Create/Edit */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editingEntry ? "Entry'yi Düzenle" : "Yeni Entry"}</DialogTitle>
                        <DialogDescription>
                            Entry içeriğini ve topic'i seçin.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="topic">Topic</Label>
                            <Select
                                value={formData.topic}
                                onValueChange={(value) => setFormData({ ...formData, topic: value })}
                                disabled={!!editingEntry}
                            >
                                <SelectTrigger className="focus:ring-[#ff6600]">
                                    <SelectValue placeholder="Topic seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    {topics.map((topic) => (
                                        <SelectItem key={topic._id} value={topic._id}>
                                            {topic.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="content">İçerik</Label>

                            {/* Formatting toolbar */}
                            <div className="flex gap-2 mb-1 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => openHelper('bkz')}
                                    className="px-2 py-1 text-[10px] border border-border bg-white rounded hover:bg-secondary transition-colors font-medium"
                                >
                                    (bkz:)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => openHelper('hede')}
                                    className="px-2 py-1 text-[10px] border border-border bg-white rounded hover:bg-secondary transition-colors font-medium"
                                >
                                    hede
                                </button>
                                <button
                                    type="button"
                                    onClick={() => openHelper('asterisk')}
                                    className="px-2 py-1 text-[10px] border border-border bg-white rounded hover:bg-secondary transition-colors font-medium"
                                >
                                    *
                                </button>
                                <button
                                    type="button"
                                    onClick={() => openHelper('spoiler')}
                                    className="px-2 py-1 text-[10px] border border-border bg-white rounded hover:bg-secondary transition-colors font-medium"
                                >
                                    - spoiler -
                                </button>
                                <button
                                    type="button"
                                    onClick={() => openHelper('link')}
                                    className="px-2 py-1 text-[10px] border border-border bg-white rounded hover:bg-secondary transition-colors font-medium"
                                >
                                    http://
                                </button>
                            </div>

                            <Textarea
                                id="content"
                                ref={textareaRef}
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Entry içeriğini yazın..."
                                className="focus-visible:ring-[#ff6600] min-h-[200px]"
                            />
                        </div>
                    </div>

                    {/* Helper Modal */}
                    {modalConfig.isOpen && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] animate-in fade-in duration-200">
                            <div className="bg-white rounded-[20px] p-8 max-w-sm w-full mx-4 shadow-2xl border border-black/5 flex flex-col items-center text-center">
                                <h3 className="text-lg font-bold text-[#1a1a1a] mb-2 leading-tight">
                                    fitsozluk.com mesajı
                                </h3>
                                <p className="text-[#4b4b4b] text-sm mb-6">
                                    {modalConfig.type === 'bkz' && "hangi başlığa bkz verilecek?"}
                                    {modalConfig.type === 'hede' && (modalConfig.step === 1 ? "hangi başlık için link oluşturulacak?" : "verilecek linkin adı ne olacak?")}
                                    {modalConfig.type === 'asterisk' && "yıldız içinde ne görünecek?"}
                                    {modalConfig.type === 'link' && (modalConfig.step === 1 ? "hangi adrese gidecek?" : "verilecek linkin adı ne olacak?")}
                                    {modalConfig.type === 'spoiler' && "spoiler metni ne olacak?"}
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
                                    className="w-full px-4 py-2 border-2 border-[#e5e7eb] rounded-[10px] text-base focus:outline-none focus:border-[#ff6600] transition-all mb-6"
                                />

                                <div className="flex gap-3 w-full">
                                    <Button
                                        onClick={handleModalSubmit}
                                        className="flex-1 bg-[#8b4513] hover:bg-[#723a10] text-white rounded-full font-bold"
                                    >
                                        Tamam
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                                        className="flex-1 bg-[#ffdab9] hover:bg-[#fcd5b0] text-[#1a1a1a] rounded-full font-bold border-none"
                                    >
                                        İptal
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-md">
                            İptal
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="bg-[#ff6600] hover:bg-[#e65c00] text-white rounded-md"
                            disabled={!formData.content || !formData.topic}
                        >
                            {editingEntry ? "Güncelle" : "Oluştur"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
