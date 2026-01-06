"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import {
    getAllTopics,
    createTopic,
    updateTopic,
    deleteTopic,
    reorderTopics,
    Topic
} from "@/redux/actions/topicActions"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, GripVertical, Pencil, Trash2, Eye, EyeOff, Star, StarOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SortableItemProps {
    topic: Topic
    onEdit: (topic: Topic) => void
    onDelete: (id: string) => void
    onToggleActive: (topic: Topic) => void
    onToggleFeatured: (topic: Topic) => void
}

function SortableItem({ topic, onEdit, onDelete, onToggleActive, onToggleFeatured }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: topic._id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group flex items-center justify-between gap-4 py-4 px-6 border-b border-border transition-all duration-200",
                isDragging ? "bg-secondary" : "bg-background hover:bg-secondary/30"
            )}
        >
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <button
                    className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground transition-colors"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="h-4 w-4" />
                </button>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn(
                            "font-medium transition-colors text-sm",
                            !topic.isActive ? "text-muted-foreground line-through" : "text-foreground"
                        )}>
                            {topic.label}
                        </span>
                        <div className="flex gap-1.5">
                            {topic.isFeatured && (
                                <span className="h-2 w-2 rounded-full bg-indigo-500" title="Öne Çıkan" />
                            )}
                        </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate font-mono uppercase tracking-tight">
                        {topic.href}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-8 w-8 transition-colors",
                        topic.isFeatured ? "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" : "text-muted-foreground"
                    )}
                    onClick={() => onToggleFeatured(topic)}
                >
                    {topic.isFeatured ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    onClick={() => onToggleActive(topic)}
                >
                    {topic.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => onEdit(topic)}
                >
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(topic._id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

export default function BasliklarPage() {
    const dispatch = useAppDispatch()
    const { topics, loading, error } = useAppSelector((state) => state.topic)
    const [localTopics, setLocalTopics] = useState<Topic[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingTopic, setEditingTopic] = useState<Topic | null>(null)

    const [formData, setFormData] = useState({
        label: "",
        href: "",
        isFeatured: true
    })

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    useEffect(() => {
        dispatch(getAllTopics({}))
    }, [dispatch])

    useEffect(() => {
        setLocalTopics(topics)
    }, [topics])

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setLocalTopics((items) => {
                const oldIndex = items.findIndex((item) => item._id === active.id)
                const newIndex = items.findIndex((item) => item._id === over.id)
                const newItems = arrayMove(items, oldIndex, newIndex)

                const reorderPayload = newItems.map((item, index) => ({
                    id: item._id,
                    order: index
                }))

                dispatch(reorderTopics({ topics: reorderPayload }))
                return newItems
            })
        }
    }

    const handleSubmit = async () => {
        if (!formData.label || !formData.href) return

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
        setFormData({ label: "", href: "", isFeatured: true })
        dispatch(getAllTopics({}))
    }

    const handleEdit = (topic: Topic) => {
        setEditingTopic(topic)
        setFormData({
            label: topic.label,
            href: topic.href,
            isFeatured: topic.isFeatured
        })
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (confirm("Silmek istediğinize emin misiniz?")) {
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

    const handleToggleFeatured = async (topic: Topic) => {
        await dispatch(updateTopic({
            id: topic._id,
            isFeatured: !topic.isFeatured
        }))
        dispatch(getAllTopics({}))
    }

    return (
        <div className="flex flex-col min-h-screen w-full bg-background overflow-hidden">
            {/* Header Area Area - Moved to Top */}
            <div className="border-b border-border bg-background p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold tracking-tight text-foreground">Başlık Yönetimi</h1>
                    <p className="text-xs text-muted-foreground">
                        Sürükleyerek sıralayın, düzenleyin ve öne çıkarın.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {error && (
                        <span className="text-xs text-destructive font-medium mr-2">{error}</span>
                    )}
                    <Button
                        onClick={() => {
                            setEditingTopic(null)
                            setFormData({ label: "", href: "", isFeatured: true })
                            setIsDialogOpen(true)
                        }}
                        className="bg-[#4729ff] hover:bg-[#3820cc] text-white rounded-md px-6 font-medium transition-all active:scale-95 shadow-none"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Yeni Başlık
                    </Button>
                </div>
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                <div className="w-full">
                    {loading && localTopics.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-[#4729ff]" />
                            <p className="text-sm text-muted-foreground animate-pulse">Başlıklar yükleniyor...</p>
                        </div>
                    ) : localTopics.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                            <p className="text-sm">Henüz bir başlık eklenmemiş.</p>
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={localTopics.map(t => t._id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="flex flex-col">
                                    {localTopics.map((topic) => (
                                        <SortableItem
                                            key={topic._id}
                                            topic={topic}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            onToggleActive={handleToggleActive}
                                            onToggleFeatured={handleToggleFeatured}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
            </div>

            {/* Dialog for Create/Edit */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingTopic ? "Başlığı Düzenle" : "Yeni Başlık"}</DialogTitle>
                        <DialogDescription>
                            Başlık adını ve yönlendirilecek linki girin.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="label">Başlık Adı</Label>
                            <Input
                                id="label"
                                value={formData.label}
                                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                placeholder="Örn: Gündem"
                                className="focus-visible:ring-[#4729ff]"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="href">Link (URL)</Label>
                            <Input
                                id="href"
                                value={formData.href}
                                onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                                placeholder="Örn: /gundem"
                                className="focus-visible:ring-[#4729ff]"
                            />
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                            <input
                                type="checkbox"
                                id="isFeatured"
                                checked={formData.isFeatured}
                                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-[#4729ff] focus:ring-[#4729ff]"
                            />
                            <Label htmlFor="isFeatured" className="text-sm font-normal cursor-pointer">
                                Bu başlığı öne çıkar
                            </Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-md">
                            İptal
                        </Button>
                        <Button onClick={handleSubmit} className="bg-[#4729ff] hover:bg-[#3820cc] text-white rounded-md">
                            {editingTopic ? "Güncelle" : "Oluştur"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
