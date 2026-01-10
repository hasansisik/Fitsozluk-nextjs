"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import {
    getAllUsers,
    deleteUser,
    updateUserRole,
    updateUserStatus,
    updateUserTitle,
} from "@/redux/actions/userActions"
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
import { Trash2, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface User {
    _id: string
    nick: string
    email: string
    role: string
    status: string
    title: string
    createdAt: string
}

export default function KullanicilarPage() {
    const dispatch = useAppDispatch()
    const { allUsers, usersLoading, usersError, user: currentUser } = useAppSelector((state) => state.user)
    const [searchTerm, setSearchTerm] = useState("")
    const [roleFilter, setRoleFilter] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [titleFilter, setTitleFilter] = useState<string>("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<User | null>(null)
    const [pendingChanges, setPendingChanges] = useState<Record<string, { role?: string; status?: string; title?: string }>>({})
    const [isSaving, setIsSaving] = useState(false)

    const itemsPerPage = 20

    useEffect(() => {
        const params: Record<string, string> = {
            page: currentPage.toString(),
            limit: itemsPerPage.toString(),
        }

        if (searchTerm) params.search = searchTerm
        if (roleFilter !== "all") params.role = roleFilter
        if (statusFilter !== "all") params.status = statusFilter

        dispatch(getAllUsers(params))
    }, [dispatch, currentPage, searchTerm, roleFilter, statusFilter])

    const handleRoleChange = (userId: string, newRole: string) => {
        setPendingChanges(prev => ({
            ...prev,
            [userId]: { ...prev[userId], role: newRole }
        }))
    }

    const handleStatusChange = (userId: string, newStatus: string) => {
        setPendingChanges(prev => ({
            ...prev,
            [userId]: { ...prev[userId], status: newStatus }
        }))
    }

    const handleTitleChange = (userId: string, newTitle: string) => {
        setPendingChanges(prev => ({
            ...prev,
            [userId]: { ...prev[userId], title: newTitle }
        }))
    }

    const handleSaveChanges = async () => {
        setIsSaving(true)
        try {
            for (const [userId, changes] of Object.entries(pendingChanges)) {
                if (changes.role) {
                    await dispatch(updateUserRole({ id: userId, role: changes.role }))
                }
                if (changes.status) {
                    await dispatch(updateUserStatus({ id: userId, status: changes.status }))
                }
                if (changes.title) {
                    await dispatch(updateUserTitle({ id: userId, title: changes.title }))
                }
            }
            setPendingChanges({})
            dispatch(getAllUsers({ page: currentPage.toString(), limit: itemsPerPage.toString() }))
        } catch (error) {
            console.error('Save error:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteClick = (user: User) => {
        if (user._id === currentUser._id) {
            alert("Kendinizi silemezsiniz!")
            return
        }
        if (user.role === "admin") {
            alert("Admin kullanıcıları silemezsiniz!")
            return
        }
        setUserToDelete(user)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (userToDelete) {
            await dispatch(deleteUser(userToDelete._id))
            setDeleteDialogOpen(false)
            setUserToDelete(null)
            dispatch(getAllUsers({ page: currentPage.toString(), limit: itemsPerPage.toString() }))
        }
    }

    const filteredUsers = allUsers.filter((user: User) => {
        if (titleFilter !== "all" && user.title !== titleFilter) return false
        return true
    })

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

    return (
        <div className="flex flex-col min-h-screen w-full bg-background overflow-hidden">
            {/* Header */}
            <div className="border-b border-border bg-background p-6">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold tracking-tight text-foreground">Kullanıcı Yönetimi</h1>
                            <p className="text-xs text-muted-foreground">
                                Kullanıcıları görüntüleyin, düzenleyin ve yönetin.
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Kullanıcı ara (nick veya email)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 focus-visible:ring-[#4729ff]"
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Rol Filtrele" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tüm Roller</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="user">Kullanıcı</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Durum Filtrele" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tüm Durumlar</SelectItem>
                                <SelectItem value="active">Aktif</SelectItem>
                                <SelectItem value="inactive">Pasif</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={titleFilter} onValueChange={setTitleFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Unvan Filtrele" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tüm Unvanlar</SelectItem>
                                <SelectItem value="çaylak">Çaylak</SelectItem>
                                <SelectItem value="yazar">Yazar</SelectItem>
                                <SelectItem value="usta">Usta</SelectItem>
                                <SelectItem value="moderatör">Moderatör</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Save Button - Shows when there are pending changes */}
                    {Object.keys(pendingChanges).length > 0 && (
                        <div className="flex items-center gap-3 pt-3 border-t border-border">
                            <Button
                                onClick={handleSaveChanges}
                                disabled={isSaving}
                                className="bg-[#4729ff] hover:bg-[#3820cc] text-white"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Kaydediliyor...
                                    </>
                                ) : (
                                    `Değişiklikleri Kaydet (${Object.keys(pendingChanges).length})`
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setPendingChanges({})}
                                disabled={isSaving}
                            >
                                İptal
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                <div className="w-full">
                    {usersLoading && filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-[#4729ff]" />
                            <p className="text-sm text-muted-foreground animate-pulse">Kullanıcılar yükleniyor...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                            <p className="text-sm">Kullanıcı bulunamadı.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {/* Table Header */}
                            <div className="hidden md:grid md:grid-cols-12 gap-4 py-3 px-6 border-b border-border bg-secondary/30 text-xs font-medium text-muted-foreground uppercase tracking-tight">
                                <div className="col-span-2">Nick</div>
                                <div className="col-span-3">Email</div>
                                <div className="col-span-2">Rol</div>
                                <div className="col-span-2">Durum</div>
                                <div className="col-span-2">Unvan</div>
                                <div className="col-span-1 text-right">İşlemler</div>
                            </div>

                            {/* Table Rows */}
                            {filteredUsers.map((user: User) => (
                                <div
                                    key={user._id}
                                    className={cn(
                                        "grid grid-cols-1 md:grid-cols-12 gap-4 py-4 px-6 border-b border-border transition-all duration-200",
                                        "bg-background hover:bg-secondary/30"
                                    )}
                                >
                                    {/* Mobile Layout */}
                                    <div className="md:hidden space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-sm">{user.nick}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDeleteClick(user)}
                                                disabled={user._id === currentUser._id || user.role === "admin"}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Select
                                                value={pendingChanges[user._id]?.role || user.role}
                                                onValueChange={(value) => handleRoleChange(user._id, value)}
                                            >
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                    <SelectItem value="user">Kullanıcı</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Select
                                                value={pendingChanges[user._id]?.status || user.status}
                                                onValueChange={(value) => handleStatusChange(user._id, value)}
                                            >
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Aktif</SelectItem>
                                                    <SelectItem value="inactive">Pasif</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Select
                                                value={pendingChanges[user._id]?.title || user.title}
                                                onValueChange={(value) => handleTitleChange(user._id, value)}
                                            >
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="çaylak">Çaylak</SelectItem>
                                                    <SelectItem value="yazar">Yazar</SelectItem>
                                                    <SelectItem value="usta">Usta</SelectItem>
                                                    <SelectItem value="moderatör">Moderatör</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Desktop Layout */}
                                    <div className="hidden md:contents">
                                        <div className="col-span-2 flex items-center">
                                            <span className="font-medium text-sm truncate">{user.nick}</span>
                                        </div>
                                        <div className="col-span-3 flex items-center">
                                            <span className="text-sm text-muted-foreground truncate">{user.email}</span>
                                        </div>
                                        <div className="col-span-2 flex items-center">
                                            <Select
                                                value={pendingChanges[user._id]?.role || user.role}
                                                onValueChange={(value) => handleRoleChange(user._id, value)}
                                            >
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                    <SelectItem value="user">Kullanıcı</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-2 flex items-center">
                                            <Select
                                                value={pendingChanges[user._id]?.status || user.status}
                                                onValueChange={(value) => handleStatusChange(user._id, value)}
                                            >
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Aktif</SelectItem>
                                                    <SelectItem value="inactive">Pasif</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-2 flex items-center">
                                            <Select
                                                value={pendingChanges[user._id]?.title || user.title}
                                                onValueChange={(value) => handleTitleChange(user._id, value)}
                                            >
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="çaylak">Çaylak</SelectItem>
                                                    <SelectItem value="yazar">Yazar</SelectItem>
                                                    <SelectItem value="usta">Usta</SelectItem>
                                                    <SelectItem value="moderatör">Moderatör</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-1 flex items-center justify-end">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDeleteClick(user)}
                                                disabled={user._id === currentUser._id || user.role === "admin"}
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

            {/* Pagination */}
            {filteredUsers.length > 0 && (
                <div className="border-t border-border bg-background p-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Toplam {filteredUsers.length} kullanıcı
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                            Sayfa {currentPage} / {totalPages || 1}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage >= totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Kullanıcıyı Sil</DialogTitle>
                        <DialogDescription>
                            {userToDelete?.nick} kullanıcısını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="rounded-md">
                            İptal
                        </Button>
                        <Button
                            onClick={handleDeleteConfirm}
                            className="bg-destructive hover:bg-destructive/90 text-white rounded-md"
                        >
                            Sil
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
