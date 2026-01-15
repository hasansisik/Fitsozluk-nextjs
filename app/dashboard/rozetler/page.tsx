"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getAllBadges, createBadge, updateBadge, deleteBadge } from "@/redux/actions/badgeActions"
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
import { Plus, Pencil, Trash2, Loader2, Award, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { uploadImageToCloudinary } from "@/utils/cloudinary"

export default function BadgesPage() {
    const dispatch = useAppDispatch()
    const { badges, loading } = useAppSelector((state) => state.badge)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingBadge, setEditingBadge] = useState<any>(null)
    const [uploading, setUploading] = useState(false)
    const [previewImage, setPreviewImage] = useState<string>("")

    const [formData, setFormData] = useState({
        name: "",
        icon: "",
        description: ""
    })

    useEffect(() => {
        dispatch(getAllBadges())
    }, [dispatch])

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Lütfen bir görsel dosyası seçin')
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Görsel boyutu 5MB\'dan küçük olmalıdır')
            return
        }

        try {
            setUploading(true)
            const imageUrl = await uploadImageToCloudinary(file)
            setFormData({ ...formData, icon: imageUrl })
            setPreviewImage(imageUrl)
        } catch (error) {
            console.error('Upload error:', error)
            alert('Görsel yüklenirken bir hata oluştu')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async () => {
        if (!formData.name || !formData.icon) {
            alert("Rozet ismi ve görseli gereklidir")
            return
        }

        try {
            if (editingBadge) {
                await dispatch(updateBadge({
                    id: editingBadge._id,
                    ...formData
                })).unwrap()
            } else {
                await dispatch(createBadge(formData)).unwrap()
            }

            setIsDialogOpen(false)
            setEditingBadge(null)
            setFormData({ name: "", icon: "", description: "" })
            setPreviewImage("")
            dispatch(getAllBadges())
        } catch (error: any) {
            alert(error || "İşlem başarısız")
        }
    }

    const handleEdit = (badge: any) => {
        setEditingBadge(badge)
        setFormData({
            name: badge.name,
            icon: badge.icon,
            description: badge.description || ""
        })
        setPreviewImage(badge.icon)
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (confirm("Bu rozeti silmek istediğinize emin misiniz? Bu rozete sahip tüm kullanıcılardan kaldırılacaktır.")) {
            try {
                await dispatch(deleteBadge(id)).unwrap()
                dispatch(getAllBadges())
            } catch (error: any) {
                alert(error || "Rozet silinemedi")
            }
        }
    }

    const handleDialogClose = () => {
        setIsDialogOpen(false)
        setEditingBadge(null)
        setFormData({ name: "", icon: "", description: "" })
        setPreviewImage("")
    }

    return (
        <div className="flex flex-col min-h-screen w-full bg-background overflow-hidden">
            {/* Header Area */}
            <div className="border-b border-border bg-background p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold tracking-tight text-foreground">Rozet Yönetimi</h1>
                    <p className="text-xs text-muted-foreground">
                        Rozetleri görüntüleyin, düzenleyin ve yönetin.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => {
                            setEditingBadge(null)
                            setFormData({ name: "", icon: "", description: "" })
                            setPreviewImage("")
                            setIsDialogOpen(true)
                        }}
                        className="bg-[#ff6600] hover:bg-[#e65c00] text-white rounded-md px-6 font-medium transition-all active:scale-95 shadow-none"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Yeni Rozet
                    </Button>
                </div>
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                <div className="w-full">
                    {loading && badges.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-[#ff6600]" />
                            <p className="text-sm text-muted-foreground animate-pulse">Rozetler yükleniyor...</p>
                        </div>
                    ) : badges.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                            <Award className="h-12 w-12 mb-4 opacity-50" />
                            <p className="text-sm">Henüz bir rozet eklenmemiş.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {badges.map((badge) => (
                                <div
                                    key={badge._id}
                                    className="group flex items-center justify-between gap-4 py-4 px-6 border-b border-border transition-all duration-200 bg-background hover:bg-secondary/30"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <img
                                            src={badge.icon}
                                            alt={badge.name}
                                            className="w-12 h-12 rounded-full border-2 border-border object-cover flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="font-medium text-sm text-foreground">
                                                    {badge.name}
                                                </span>
                                            </div>
                                            {badge.description && (
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {badge.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                            onClick={() => handleEdit(badge)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDelete(badge._id)}
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
            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingBadge ? "Rozet Düzenle" : "Yeni Rozet"}</DialogTitle>
                        <DialogDescription>
                            Rozet ismi, görseli ve açıklamasını girin.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Rozet İsmi</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Örn: Aktif Üye"
                                className="focus-visible:ring-[#ff6600]"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="icon">Rozet Görseli</Label>
                            <div className="flex flex-col gap-3">
                                {previewImage && (
                                    <div className="relative w-24 h-24 rounded-full border-2 border-border overflow-hidden">
                                        <img
                                            src={previewImage}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => {
                                                setFormData({ ...formData, icon: "" })
                                                setPreviewImage("")
                                            }}
                                            className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 hover:bg-destructive/90"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        disabled={uploading}
                                        onClick={() => document.getElementById('badge-image-upload')?.click()}
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Yükleniyor...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-4 w-4 mr-2" />
                                                Görsel Yükle
                                            </>
                                        )}
                                    </Button>
                                    <input
                                        id="badge-image-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    PNG, JPG veya GIF formatında, maksimum 5MB
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Rozet hakkında kısa bir açıklama..."
                                className="focus-visible:ring-[#ff6600] min-h-[80px]"
                                maxLength={200}
                            />
                            <p className="text-xs text-muted-foreground text-right">
                                {formData.description.length}/200
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleDialogClose} className="rounded-md">
                            İptal
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="bg-[#ff6600] hover:bg-[#e65c00] text-white rounded-md"
                            disabled={!formData.name || !formData.icon || uploading}
                        >
                            {editingBadge ? "Güncelle" : "Oluştur"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
