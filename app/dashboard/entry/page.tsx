"use client"

import { useEffect, useState } from "react"
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
                        className="bg-[#4729ff] hover:bg-[#3820cc] text-white rounded-md px-6 font-medium transition-all active:scale-95 shadow-none"
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
                            <Loader2 className="h-8 w-8 animate-spin text-[#4729ff]" />
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
                                                <span className="text-xs font-medium text-[#4729ff]">
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
                                <SelectTrigger className="focus:ring-[#4729ff]">
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
                            <Textarea
                                id="content"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Entry içeriğini yazın..."
                                className="focus-visible:ring-[#4729ff] min-h-[200px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-md">
                            İptal
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="bg-[#4729ff] hover:bg-[#3820cc] text-white rounded-md"
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
