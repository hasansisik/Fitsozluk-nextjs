"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import {
    getAllAds,
    createAd,
    updateAd,
    deleteAd,
    Ad
} from "@/redux/actions/adActions"
import { uploadImageToCloudinary } from "@/utils/cloudinary"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, Image as ImageIcon, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdItemProps {
    ad: Ad
    onEdit: (ad: Ad) => void
    onDelete: (id: string) => void
    onToggleActive: (ad: Ad) => void
}

function AdItem({ ad, onEdit, onDelete, onToggleActive }: AdItemProps) {
    return (
        <div className="group flex items-center justify-between gap-4 py-4 px-6 border-b border-border bg-background hover:bg-secondary/30 transition-all duration-200">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="h-12 w-20 bg-muted rounded overflow-hidden border border-border flex items-center justify-center flex-shrink-0">
                    {ad.imageUrl ? (
                        <img src={ad.imageUrl} alt="Ad Preview" className="h-full w-full object-cover" />
                    ) : (
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn(
                            "font-medium text-sm",
                            !ad.isActive ? "text-muted-foreground line-through" : "text-foreground"
                        )}>
                            {ad.location.toUpperCase()} - {ad.type.toUpperCase()}
                        </span>
                        {!ad.isActive && (
                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase font-medium">Pasif</span>
                        )}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate font-mono uppercase tracking-tight flex items-center gap-1">
                        <ExternalLink className="h-2.5 w-2.5" />
                        {ad.linkUrl}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    onClick={() => onToggleActive(ad)}
                    title={ad.isActive ? "Pasif Yap" : "Aktif Yap"}
                >
                    {ad.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => onEdit(ad)}
                    title="Düzenle"
                >
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(ad._id)}
                    title="Sil"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

export default function AdsPage() {
    const dispatch = useAppDispatch()
    const { ads, loading, error } = useAppSelector((state) => state.ad)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingAd, setEditingAd] = useState<Ad | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    const [formData, setFormData] = useState({
        location: "anasayfa",
        type: "top",
        imageUrl: "",
        linkUrl: "",
        isActive: true
    })

    useEffect(() => {
        dispatch(getAllAds())
    }, [dispatch])

    const handleSubmit = async () => {
        if (!formData.location || !formData.type || !formData.imageUrl) return

        if (editingAd) {
            await dispatch(updateAd({
                id: editingAd._id,
                ...formData
            }))
        } else {
            await dispatch(createAd(formData))
        }

        setIsDialogOpen(false)
        setEditingAd(null)
        setFormData({
            location: "anasayfa",
            type: "top",
            imageUrl: "",
            linkUrl: "",
            isActive: true
        })
        dispatch(getAllAds())
    }

    const handleEdit = (ad: Ad) => {
        setEditingAd(ad)
        setFormData({
            location: ad.location,
            type: ad.type,
            imageUrl: ad.imageUrl,
            linkUrl: ad.linkUrl,
            isActive: ad.isActive
        })
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (confirm("Bu reklamı silmek istediğinize emin misiniz?")) {
            await dispatch(deleteAd(id))
            dispatch(getAllAds())
        }
    }

    const handleToggleActive = async (ad: Ad) => {
        await dispatch(updateAd({
            id: ad._id,
            isActive: !ad.isActive
        }))
        dispatch(getAllAds())
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        try {
            const url = await uploadImageToCloudinary(file)
            setFormData({ ...formData, imageUrl: url })
        } catch (error: any) {
            console.error("Upload failed:", error)
            alert("Görsel yüklenirken bir hata oluştu.")
        } finally {
            setIsUploading(false)
        }
    }

    const locations = ["anasayfa", "basliklar", "entry", "arama"]
    const types = ["top", "sidebar"]

    return (
        <div className="flex flex-col min-h-screen w-full bg-background overflow-hidden font-sans">
            {/* Header Area */}
            <div className="border-b border-border bg-background p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold tracking-tight text-foreground">Reklam Yönetimi</h1>
                    <p className="text-xs text-muted-foreground">
                        Ana sayfa, başlıklar, entry ve arama sayfalarındaki reklam alanlarını yönetin.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {error && (
                        <span className="text-xs text-destructive font-medium mr-2">{error}</span>
                    )}
                    <Button
                        onClick={() => {
                            setEditingAd(null)
                            setFormData({
                                location: "anasayfa",
                                type: "top",
                                imageUrl: "",
                                linkUrl: "",
                                isActive: true
                            })
                            setIsDialogOpen(true)
                        }}
                        className="bg-[#4729ff] hover:bg-[#3820cc] text-white rounded-md px-6 font-medium transition-all active:scale-95 shadow-none"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Yeni Reklam
                    </Button>
                </div>
            </div>

            {/* Tabs Style Filter (Optional but good for UX) */}
            <div className="border-b border-border bg-muted/20 px-6 py-2 flex gap-4 overflow-x-auto scrollbar-hide">
                {["hepsi", ...locations].map((loc) => (
                    <button
                        key={loc}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-1 whitespace-nowrap"
                    >
                        {loc.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="w-full">
                    {loading && ads.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-[#4729ff]" />
                            <p className="text-sm text-muted-foreground animate-pulse">Reklamlar yükleniyor...</p>
                        </div>
                    ) : ads.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                            <p className="text-sm">Henüz bir reklam eklenmemiş.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {ads.map((ad) => (
                                <AdItem
                                    key={ad._id}
                                    ad={ad}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onToggleActive={handleToggleActive}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Dialog for Create/Edit */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingAd ? "Reklamı Düzenle" : "Yeni Reklam"}</DialogTitle>
                        <DialogDescription>
                            Reklamın görüneceği sayfa, pozisyon ve görsel bilgilerini girin.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="location">Konum</Label>
                                <Select
                                    value={formData.location}
                                    onValueChange={(val) => setFormData({ ...formData, location: val })}
                                >
                                    <SelectTrigger id="location" className="focus:ring-[#4729ff]">
                                        <SelectValue placeholder="Sayfa seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="anasayfa">Ana Sayfa</SelectItem>
                                        <SelectItem value="basliklar">Başlıklar</SelectItem>
                                        <SelectItem value="entry">Entry/Topic</SelectItem>
                                        <SelectItem value="arama">Arama</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="type">Tür</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val) => setFormData({ ...formData, type: val })}
                                >
                                    <SelectTrigger id="type" className="focus:ring-[#4729ff]">
                                        <SelectValue placeholder="Tür seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="top">Üst (Banner)</SelectItem>
                                        <SelectItem value="sidebar">Yan (Kare)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="imageFile">Görsel Seç</Label>
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-2">
                                    <Input
                                        id="imageFile"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="focus-visible:ring-[#4729ff] cursor-pointer file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-[#4729ff] hover:file:bg-indigo-100"
                                        disabled={isUploading}
                                    />
                                    {isUploading && (
                                        <div className="flex items-center justify-center px-3">
                                            <Loader2 className="h-4 w-4 animate-spin text-[#4729ff]" />
                                        </div>
                                    )}
                                </div>

                                {formData.imageUrl && (
                                    <div className="relative h-24 w-full rounded-md border border-dashed border-border overflow-hidden bg-muted flex items-center justify-center">
                                        <img
                                            src={formData.imageUrl}
                                            alt="Preview"
                                            className="h-full w-full object-contain"
                                        />
                                        <div className="absolute top-1 right-1 bg-[#4729ff] text-white text-[8px] px-1 rounded">yüklendi</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="linkUrl">Yönlendirme Linki</Label>
                            <Input
                                id="linkUrl"
                                value={formData.linkUrl}
                                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                                placeholder="https://..."
                                className="focus-visible:ring-[#4729ff]"
                            />
                        </div>

                        <div className="flex items-center space-x-2 mt-2">
                            <input
                                type="checkbox"
                                id="isActiveAd"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-[#4729ff] focus:ring-[#4729ff]"
                            />
                            <Label htmlFor="isActiveAd" className="text-sm font-normal cursor-pointer">
                                Bu reklamı hemen yayına al
                            </Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-md">
                            İptal
                        </Button>
                        <Button onClick={handleSubmit} className="bg-[#4729ff] hover:bg-[#3820cc] text-white rounded-md" disabled={isUploading}>
                            {isUploading ? "Görsel Yükleniyor..." : (editingAd ? "Güncelle" : "Oluştur")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
