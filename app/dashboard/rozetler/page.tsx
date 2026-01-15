"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getAllBadges, createBadge, updateBadge, deleteBadge } from "@/redux/actions/badgeActions"
import { Plus, Edit, Trash2, X, Loader2 } from "lucide-react"
import Image from "next/image"

export default function BadgesPage() {
    const dispatch = useAppDispatch()
    const { badges, loading } = useAppSelector((state) => state.badge)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedBadge, setSelectedBadge] = useState<any>(null)
    const [formData, setFormData] = useState({
        name: "",
        icon: "",
        description: ""
    })

    useEffect(() => {
        dispatch(getAllBadges())
    }, [dispatch])

    const handleCreate = async () => {
        if (!formData.name || !formData.icon) {
            alert("Rozet ismi ve görseli gereklidir")
            return
        }

        try {
            await dispatch(createBadge(formData)).unwrap()
            setShowCreateModal(false)
            setFormData({ name: "", icon: "", description: "" })
            dispatch(getAllBadges())
        } catch (error: any) {
            alert(error || "Rozet oluşturulamadı")
        }
    }

    const handleUpdate = async () => {
        if (!selectedBadge) return

        try {
            await dispatch(updateBadge({
                id: selectedBadge._id,
                ...formData
            })).unwrap()
            setShowEditModal(false)
            setSelectedBadge(null)
            setFormData({ name: "", icon: "", description: "" })
            dispatch(getAllBadges())
        } catch (error: any) {
            alert(error || "Rozet güncellenemedi")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bu rozeti silmek istediğinize emin misiniz? Bu rozete sahip tüm kullanıcılardan kaldırılacaktır.")) {
            return
        }

        try {
            await dispatch(deleteBadge(id)).unwrap()
            dispatch(getAllBadges())
        } catch (error: any) {
            alert(error || "Rozet silinemedi")
        }
    }

    const openEditModal = (badge: any) => {
        setSelectedBadge(badge)
        setFormData({
            name: badge.name,
            icon: badge.icon,
            description: badge.description || ""
        })
        setShowEditModal(true)
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Rozetler</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#ff6600] text-white rounded-md hover:bg-[#e65c00] transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Yeni Rozet
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#ff6600]" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {badges.map((badge) => (
                        <div
                            key={badge._id}
                            className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={badge.icon}
                                        alt={badge.name}
                                        className="w-12 h-12 rounded-full border-2 border-border"
                                    />
                                    <div>
                                        <h3 className="font-semibold">{badge.name}</h3>
                                        {badge.description && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {badge.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditModal(badge)}
                                        className="p-1 hover:bg-secondary rounded transition-colors"
                                        title="Düzenle"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(badge._id)}
                                        className="p-1 hover:bg-red-50 text-red-600 rounded transition-colors"
                                        title="Sil"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {badges.length === 0 && !loading && (
                <div className="text-center py-12 text-muted-foreground">
                    Henüz rozet eklenmemiş
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Yeni Rozet Oluştur</h2>
                            <button onClick={() => setShowCreateModal(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Rozet İsmi *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-[#ff6600] outline-none"
                                    placeholder="Örn: Aktif Üye"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Görsel URL *
                                </label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-[#ff6600] outline-none"
                                    placeholder="https://example.com/badge.png"
                                />
                                {formData.icon && (
                                    <img
                                        src={formData.icon}
                                        alt="Preview"
                                        className="w-12 h-12 rounded-full border-2 border-border mt-2"
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Açıklama
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-[#ff6600] outline-none"
                                    rows={3}
                                    maxLength={200}
                                    placeholder="Rozet açıklaması"
                                />
                                <div className="text-xs text-muted-foreground mt-1">
                                    {formData.description.length}/200
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-secondary transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleCreate}
                                className="flex-1 px-4 py-2 bg-[#ff6600] text-white rounded-md hover:bg-[#e65c00] transition-colors"
                            >
                                Oluştur
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Rozet Düzenle</h2>
                            <button onClick={() => setShowEditModal(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Rozet İsmi *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-[#ff6600] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Görsel URL *
                                </label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-[#ff6600] outline-none"
                                />
                                {formData.icon && (
                                    <img
                                        src={formData.icon}
                                        alt="Preview"
                                        className="w-12 h-12 rounded-full border-2 border-border mt-2"
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Açıklama
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-[#ff6600] outline-none"
                                    rows={3}
                                    maxLength={200}
                                />
                                <div className="text-xs text-muted-foreground mt-1">
                                    {formData.description.length}/200
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-secondary transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="flex-1 px-4 py-2 bg-[#ff6600] text-white rounded-md hover:bg-[#e65c00] transition-colors"
                            >
                                Güncelle
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
