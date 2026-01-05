"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import {
    getAllMenus,
    createMenu,
    updateMenu,
    deleteMenu,
    reorderMenus,
    Menu,
    CreateMenuPayload,
} from "@/redux/actions/menuActions"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Plus, Pencil, Trash2, X } from "lucide-react"

// Sortable Menu Item Component
function SortableMenuItem({
    menu,
    onEdit,
    onDelete
}: {
    menu: Menu
    onEdit: (menu: Menu) => void
    onDelete: (id: string) => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: menu._id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 p-4 bg-white border border-border rounded-lg hover:shadow-sm transition-shadow"
        >
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-secondary rounded"
            >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
            </button>

            <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                <div>
                    <p className="font-medium">{menu.label}</p>
                    <p className="text-xs text-muted-foreground">{menu.href}</p>
                </div>
                <div className="text-sm">
                    <span className={`px-2 py-1 rounded ${menu.isFeatured ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                        {menu.isFeatured ? 'Ana Menü' : 'Dropdown'}
                    </span>
                </div>
                <div className="text-sm">
                    <span className={`px-2 py-1 rounded ${menu.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {menu.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                </div>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => onEdit(menu)}
                        className="p-2 hover:bg-secondary rounded transition-colors"
                        title="Düzenle"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onDelete(menu._id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded transition-colors"
                        title="Sil"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function MenusPage() {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.user)
    const { menus, loading } = useAppSelector((state) => state.menu)

    const [localMenus, setLocalMenus] = useState<Menu[]>([])
    const [showModal, setShowModal] = useState(false)
    const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
    const [formData, setFormData] = useState<CreateMenuPayload>({
        label: "",
        href: "",
        isActive: true,
        isFeatured: false,
        type: "other",
    })

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    useEffect(() => {
        // Check admin access
        if (user?.role !== "admin") {
            router.push("/dashboard")
            return
        }

        // Load menus
        dispatch(getAllMenus())
    }, [dispatch, user, router])

    useEffect(() => {
        setLocalMenus(menus)
    }, [menus])

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setLocalMenus((items) => {
                const oldIndex = items.findIndex((item) => item._id === active.id)
                const newIndex = items.findIndex((item) => item._id === over.id)
                const newItems = arrayMove(items, oldIndex, newIndex)

                // Update order in backend
                const reorderData = newItems.map((item, index) => ({
                    id: item._id,
                    order: index,
                }))
                dispatch(reorderMenus({ menus: reorderData }))

                return newItems
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (editingMenu) {
            await dispatch(updateMenu({ id: editingMenu._id, ...formData }))
        } else {
            await dispatch(createMenu(formData))
        }

        setShowModal(false)
        setEditingMenu(null)
        setFormData({
            label: "",
            href: "",
            isActive: true,
            isFeatured: false,
            type: "other",
        })
        dispatch(getAllMenus())
    }

    const handleEdit = (menu: Menu) => {
        setEditingMenu(menu)
        setFormData({
            label: menu.label,
            href: menu.href,
            isActive: menu.isActive,
            isFeatured: menu.isFeatured,
            type: menu.type,
        })
        setShowModal(true)
    }

    const handleDelete = async (id: string) => {
        if (confirm("Bu menüyü silmek istediğinizden emin misiniz?")) {
            await dispatch(deleteMenu(id))
            dispatch(getAllMenus())
        }
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setEditingMenu(null)
        setFormData({
            label: "",
            href: "",
            isActive: true,
            isFeatured: false,
            type: "other",
        })
    }

    if (loading && localMenus.length === 0) {
        return (
            <div className="flex-1 p-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4729ff]"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Menü Yönetimi</h1>
                        <p className="text-muted-foreground mt-1">
                            Menüleri sürükle-bırak ile sıralayın ve düzenleyin
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#4729ff] text-white rounded-md hover:bg-[#3820cc] transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Yeni Menü
                    </button>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={localMenus.map((m) => m._id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-3">
                            {localMenus.map((menu) => (
                                <SortableMenuItem
                                    key={menu._id}
                                    menu={menu}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                {localMenus.length === 0 && (
                    <div className="text-center py-12 bg-secondary rounded-lg">
                        <p className="text-muted-foreground">Henüz menü eklenmemiş</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="mt-4 text-[#4729ff] hover:underline"
                        >
                            İlk menüyü ekleyin
                        </button>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">
                                    {editingMenu ? "Menü Düzenle" : "Yeni Menü Ekle"}
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-1 hover:bg-secondary rounded"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Etiket
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.label}
                                        onChange={(e) =>
                                            setFormData({ ...formData, label: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4729ff]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Link (href)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.href}
                                        onChange={(e) =>
                                            setFormData({ ...formData, href: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4729ff]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Tip</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                type: e.target.value as any,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4729ff]"
                                    >
                                        <option value="other">Diğer</option>
                                        <option value="home">Ana Sayfa</option>
                                        <option value="special">Özel</option>
                                        <option value="channel">Kanal</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isFeatured}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    isFeatured: e.target.checked,
                                                })
                                            }
                                            className="w-4 h-4 text-[#4729ff] rounded focus:ring-[#4729ff]"
                                        />
                                        <span className="text-sm">Ana Menüde Göster</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    isActive: e.target.checked,
                                                })
                                            }
                                            className="w-4 h-4 text-[#4729ff] rounded focus:ring-[#4729ff]"
                                        />
                                        <span className="text-sm">Aktif</span>
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-secondary transition-colors"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-[#4729ff] text-white rounded-md hover:bg-[#3820cc] transition-colors"
                                    >
                                        {editingMenu ? "Güncelle" : "Ekle"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
