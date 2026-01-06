"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Check, X, FileText } from "lucide-react"
import axios from "axios"
import { server } from "@/config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import RichTextEditor from "@/components/ui/richtexteditor"

interface Page {
    _id: string
    title: string
    slug: string
    content: string
    isActive: boolean
}

export default function PagesDashboard() {
    const [pages, setPages] = useState<Page[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editPage, setEditPage] = useState<Partial<Page> | null>(null)
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        fetchPages()
    }, [])

    const fetchPages = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get(`${server}/pages`)
            setPages(data.pages)
        } catch (error) {
            console.error("Pages fetch error:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateNew = () => {
        setEditPage({
            title: "",
            slug: "",
            content: "",
            isActive: true
        })
        setIsEditing(true)
    }

    const handleEdit = (page: Page) => {
        setEditPage(page)
        setIsEditing(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bu sayfayı silmek istediğinize emin misiniz?")) return

        try {
            const token = localStorage.getItem("accessToken")
            await axios.delete(`${server}/pages/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setPages(pages.filter(p => p._id !== id))
            setStatusMessage({ type: 'success', text: 'Sayfa başarıyla silindi' })
        } catch (error: any) {
            setStatusMessage({ type: 'error', text: error.response?.data?.message || 'Silme işlemi başarısız' })
        }
    }

    const handleSave = async () => {
        if (!editPage?.title || !editPage?.slug) {
            alert("Başlık ve slug zorunludur")
            return
        }

        try {
            const token = localStorage.getItem("accessToken")
            const config = { headers: { Authorization: `Bearer ${token}` } }

            let response
            if (editPage._id) {
                // Update
                response = await axios.patch(`${server}/pages/${editPage._id}`, editPage, config)
            } else {
                // Create
                response = await axios.post(`${server}/pages`, editPage, config)
            }

            setStatusMessage({ type: 'success', text: response.data.message })
            setIsEditing(false)
            setEditPage(null)
            fetchPages()
        } catch (error: any) {
            setStatusMessage({ type: 'error', text: error.response?.data?.message || 'Kaydetme işlemi başarısız' })
        }
    }

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Yükleniyor...</div>
    }

    return (
        <div className="flex-1 w-full bg-slate-50 min-h-screen">
            <div className="p-6 max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Sayfa Yönetimi</h1>
                        <p className="text-slate-500 text-sm">Dinamik içerik sayfalarını buradan yönetin</p>
                    </div>
                    {!isEditing && (
                        <Button onClick={handleCreateNew} className="bg-[#4729ff] hover:bg-[#3820cc]">
                            <Plus className="w-4 h-4 mr-2" />
                            Yeni Sayfa Ekle
                        </Button>
                    )}
                </div>

                {statusMessage && (
                    <div className={`p-4 mb-6 rounded-lg flex items-center justify-between ${statusMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        <div className="flex items-center">
                            {statusMessage.type === 'success' ? <Check className="w-5 h-5 mr-2" /> : <X className="w-5 h-5 mr-2" />}
                            {statusMessage.text}
                        </div>
                        <button onClick={() => setStatusMessage(null)}>
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {isEditing ? (
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Sayfa Başlığı</label>
                                <Input
                                    value={editPage?.title}
                                    onChange={e => setEditPage({ ...editPage, title: e.target.value })}
                                    placeholder="Örn: Kullanım Koşulları"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Sayfa Slug (URL)</label>
                                <Input
                                    value={editPage?.slug}
                                    onChange={e => setEditPage({ ...editPage, slug: e.target.value })}
                                    placeholder="Örn: kullanim-kosullari"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 mb-6">
                            <label className="text-sm font-medium text-slate-700">İçerik</label>
                            <RichTextEditor
                                content={editPage?.content || ""}
                                onChange={html => setEditPage({ ...editPage, content: html })}
                                placeholder="Sayfa içeriğini buraya yazın..."
                            />
                        </div>

                        <div className="flex items-center gap-2 mb-6">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={editPage?.isActive}
                                onChange={e => setEditPage({ ...editPage, isActive: e.target.checked })}
                                className="w-4 h-4 text-[#4729ff] rounded"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
                                Sayfayı Yayınla
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t">
                            <Button variant="outline" onClick={() => { setIsEditing(false); setEditPage(null); }}>
                                İptal
                            </Button>
                            <Button onClick={handleSave} className="bg-[#4729ff] hover:bg-[#3820cc]">
                                Kaydet
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {pages.length === 0 ? (
                            <div className="bg-white p-12 text-center rounded-xl border border-dashed text-muted-foreground">
                                <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                Henüz sayfa eklenmemiş.
                            </div>
                        ) : (
                            pages.map(page => (
                                <div key={page._id} className="bg-white p-4 rounded-xl shadow-sm border flex items-center justify-between hover:border-[#4729ff]/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-[#4729ff]/5 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-[#4729ff]" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">{page.title}</h3>
                                            <p className="text-xs text-slate-500">/{page.slug}</p>
                                        </div>
                                        {!page.isActive && (
                                            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Taslak</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(page)} title="Düzenle">
                                            <Edit className="w-4 h-4 text-slate-600" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(page._id)} title="Sil">
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
