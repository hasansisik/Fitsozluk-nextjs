"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import {
    getAllTopics,
    createTopic,
    updateTopic,
    deleteTopic,
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
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

export default function TopicPage() {
    const dispatch = useAppDispatch()
    const { topics, loading, error } = useAppSelector((state) => state.topic)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingTopic, setEditingTopic] = useState<Topic | null>(null)

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        description: ""
    })

    useEffect(() => {
        dispatch(getAllTopics({}))
    }, [dispatch])

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
    }

    const handleTitleChange = (title: string) => {
        setFormData({
            ...formData,
            title,
            slug: editingTopic ? formData.slug : generateSlug(title)
        })
    }

    const handleSubmit = async () => {
        if (!formData.title || !formData.slug) return

        if (editingTopic) {
            await dispatch(updateTopic({
                id: editingTopic._id,
                ...formData
            }))
        } else {
            await dispatch(createTopic(formData))
        }

        setIsDialogOpen(false)
        setEditingTopic(null)
        setFormData({ title: "", slug: "", description: "" })
        dispatch(getAllTopics({}))
    }

    const handleEdit = (topic: Topic) => {
        setEditingTopic(topic)
        setFormData({
            title: topic.title,
            slug: topic.slug,
            description: topic.description || ""
        })
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (confirm("Bu topic ve tüm ilgili entry'leri silmek istediğinize emin misiniz?")) {
            await dispatch(deleteTopic(id))
            dispatch(getAllTopics({}))
        }
    }

    const handleToggleActive = async (topic: Topic) => {
        await dispatch(updateTopic({
            id: topic._id,
            isActive: !topic.isActive
        }))
        dispatch(getAllTopics({}))
    }

    return (
        <div className="flex flex-col min-h-screen w-full bg-background overflow-hidden">
            {/* Header Area */}
            <div className="border-b border-border bg-background p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold tracking-tight text-foreground">Topic Yönetimi</h1>
                    <p className="text-xs text-muted-foreground">
                        Topic'leri görüntüleyin, düzenleyin ve yönetin.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {error && (
                        <span className="text-xs text-destructive font-medium mr-2">{error}</span>
                    )}
                    <Button
                        onClick={() => {
                            setEditingTopic(null)
                            setFormData({ title: "", slug: "", description: "" })
                            setIsDialogOpen(true)
                        }}
                        className="bg-[#4729ff] hover:bg-[#3820cc] text-white rounded-md px-6 font-medium transition-all active:scale-95 shadow-none"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Yeni Topic
                    </Button>
                </div>
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                <div className="w-full">
                    {loading && topics.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-[#4729ff]" />
                            <p className="text-sm text-muted-foreground animate-pulse">Topic'ler yükleniyor...</p>
                        </div>
                    ) : topics.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                            <BookOpen className="h-12 w-12 mb-4 opacity-50" />
                            <p className="text-sm">Henüz bir topic eklenmemiş.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {topics.map((topic) => (
                                <div
                                    key={topic._id}
                                    className="group flex items-center justify-between gap-4 py-4 px-6 border-b border-border transition-all duration-200 bg-background hover:bg-secondary/30"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className={cn(
                                                "font-medium transition-colors text-sm",
                                                !topic.isActive ? "text-muted-foreground line-through" : "text-foreground"
                                            )}>
                                                {topic.title}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground truncate font-mono uppercase tracking-tight">
                                            /{topic.slug}
                                        </p>
                                        {topic.description && (
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                {topic.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground"
                                            onClick={() => handleToggleActive(topic)}
                                        >
                                            {topic.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                            onClick={() => handleEdit(topic)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDelete(topic._id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Dialog for Create/Edit */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingTopic ? "Topic'i Düzenle" : "Yeni Topic"}</DialogTitle>
                        <DialogDescription>
                            Topic başlığı, slug ve açıklamasını girin.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Başlık</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                placeholder="Örn: Atatürk'ün Hiç Seçime Girmeden Ülkeyi Yönetmesi"
                                className="focus-visible:ring-[#4729ff]"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="slug">Slug (URL)</Label>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                placeholder="Örn: ataturkun-hic-secime-girmeden-ulkeyi-yonetmesi"
                                className="focus-visible:ring-[#4729ff] font-mono text-sm"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Topic hakkında kısa bir açıklama..."
                                className="focus-visible:ring-[#4729ff] min-h-[100px]"
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
                            disabled={!formData.title || !formData.slug}
                        >
                            {editingTopic ? "Güncelle" : "Oluştur"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
