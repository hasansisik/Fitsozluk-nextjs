"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getAllReports, updateReportStatus, deleteReport } from "@/redux/actions/reportActions"
import { Search, Trash2, Eye, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export default function SikayetlerPage() {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const { user, isAuthenticated } = useAppSelector((state) => state.user)
    const { reports, reportStats, loading } = useAppSelector((state) => state.report)

    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [reasonFilter, setReasonFilter] = useState<string>("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedReport, setSelectedReport] = useState<any>(null)
    const [showDetailDialog, setShowDetailDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [reportToDelete, setReportToDelete] = useState<any>(null)
    const [adminNotes, setAdminNotes] = useState("")

    const itemsPerPage = 20

    useEffect(() => {
        // Check if user is admin
        if (isAuthenticated && user?.role !== 'admin') {
            router.push('/dashboard')
            return
        }

        const params: Record<string, string> = {
            page: currentPage.toString(),
            limit: itemsPerPage.toString(),
        }

        if (statusFilter !== "all") params.status = statusFilter
        if (reasonFilter !== "all") params.reason = reasonFilter

        dispatch(getAllReports(params))
    }, [dispatch, currentPage, statusFilter, reasonFilter, isAuthenticated, user, router])

    const handleStatusChange = async (reportId: string, newStatus: string) => {
        try {
            await dispatch(updateReportStatus({
                id: reportId,
                status: newStatus,
                adminNotes: adminNotes || undefined
            })).unwrap()

            // Refresh reports
            dispatch(getAllReports({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
                ...(statusFilter !== "all" && { status: statusFilter }),
                ...(reasonFilter !== "all" && { reason: reasonFilter }),
            }))
        } catch (error) {
            console.error("Status update error:", error)
        }
    }

    const handleDelete = async () => {
        if (!reportToDelete) return

        try {
            await dispatch(deleteReport(reportToDelete._id)).unwrap()
            setShowDeleteDialog(false)
            setReportToDelete(null)
        } catch (error) {
            console.error("Delete error:", error)
        }
    }

    const getReasonLabel = (reason: string) => {
        const labels: Record<string, string> = {
            spam: "Spam",
            harassment: "Hakaret/Nefret",
            inappropriate: "Uygunsuz İçerik",
            copyright: "Telif Hakkı",
            other: "Diğer"
        }
        return labels[reason] || reason
    }

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { label: string; className: string }> = {
            pending: { label: "Beklemede", className: "bg-yellow-100 text-yellow-800" },
            reviewed: { label: "İncelendi", className: "bg-blue-100 text-blue-800" },
            resolved: { label: "Çözüldü", className: "bg-green-100 text-green-800" },
            dismissed: { label: "Reddedildi", className: "bg-gray-100 text-gray-800" }
        }
        const badge = badges[status] || { label: status, className: "bg-gray-100 text-gray-800" }
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                {badge.label}
            </span>
        )
    }

    if (loading && !reports.length) {
        return (
            <div className="flex flex-col min-h-screen w-full bg-background">
                <div className="flex items-center justify-center flex-1">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4729ff] mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Yükleniyor...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen w-full bg-background overflow-hidden">
            {/* Header */}
            <div className="border-b border-border bg-background p-6">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold tracking-tight text-foreground">Şikayet Yönetimi</h1>
                            <p className="text-xs text-muted-foreground">
                                Kullanıcı şikayetlerini görüntüleyin ve yönetin.
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    {reportStats && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <div className="p-3 border border-border rounded-md">
                                <p className="text-xs text-muted-foreground">Toplam</p>
                                <p className="text-lg font-bold">{reportStats.total || 0}</p>
                            </div>
                            <div className="p-3 border border-border rounded-md">
                                <p className="text-xs text-muted-foreground">Beklemede</p>
                                <p className="text-lg font-bold text-yellow-600">{reportStats.pending || 0}</p>
                            </div>
                            <div className="p-3 border border-border rounded-md">
                                <p className="text-xs text-muted-foreground">İncelendi</p>
                                <p className="text-lg font-bold text-blue-600">{reportStats.reviewed || 0}</p>
                            </div>
                            <div className="p-3 border border-border rounded-md">
                                <p className="text-xs text-muted-foreground">Çözüldü</p>
                                <p className="text-lg font-bold text-green-600">{reportStats.resolved || 0}</p>
                            </div>
                            <div className="p-3 border border-border rounded-md">
                                <p className="text-xs text-muted-foreground">Reddedildi</p>
                                <p className="text-lg font-bold text-gray-600">{reportStats.dismissed || 0}</p>
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-3">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Durum Filtrele" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tüm Durumlar</SelectItem>
                                <SelectItem value="pending">Beklemede</SelectItem>
                                <SelectItem value="reviewed">İncelendi</SelectItem>
                                <SelectItem value="resolved">Çözüldü</SelectItem>
                                <SelectItem value="dismissed">Reddedildi</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={reasonFilter} onValueChange={setReasonFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Neden Filtrele" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tüm Nedenler</SelectItem>
                                <SelectItem value="spam">Spam</SelectItem>
                                <SelectItem value="harassment">Hakaret/Nefret</SelectItem>
                                <SelectItem value="inappropriate">Uygunsuz İçerik</SelectItem>
                                <SelectItem value="copyright">Telif Hakkı</SelectItem>
                                <SelectItem value="other">Diğer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                <div className="w-full p-6">
                    {reports.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Şikayet bulunamadı</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reports.map((report: any) => (
                                <div key={report._id} className="border border-border rounded-lg p-4 hover:bg-secondary/30 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                {getStatusBadge(report.status)}
                                                <span className="text-xs px-2 py-1 bg-secondary rounded-full">
                                                    {getReasonLabel(report.reason)}
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${report.reportType === 'entry' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {report.reportType === 'entry' ? 'Entry' : 'Kullanıcı'}
                                                </span>
                                            </div>
                                            <div className="space-y-1 mb-3">
                                                {report.reportType === 'user' ? (
                                                    <p className="text-sm">
                                                        <span className="font-medium">Şikayet Edilen:</span>{" "}
                                                        <span className="text-[#4729ff]">{report.reportedUser?.nick || 'Bilinmiyor'}</span>
                                                    </p>
                                                ) : (
                                                    <p className="text-sm">
                                                        <span className="font-medium">Şikayet Edilen Entry:</span>{" "}
                                                        <span className="text-muted-foreground line-clamp-1">{report.reportedEntry?.content?.substring(0, 50) || 'Entry bulunamadı'}...</span>
                                                    </p>
                                                )}
                                                <p className="text-sm">
                                                    <span className="font-medium">Şikayet Eden:</span>{" "}
                                                    {report.reportedBy?.nick}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(report.createdAt).toLocaleDateString('tr-TR', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            <p className="text-sm text-foreground line-clamp-2">{report.description}</p>
                                        </div>

                                        <div className="flex flex-col gap-2 md:w-48">
                                            <Select
                                                value={report.status}
                                                onValueChange={(value) => handleStatusChange(report._id, value)}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Beklemede</SelectItem>
                                                    <SelectItem value="reviewed">İncelendi</SelectItem>
                                                    <SelectItem value="resolved">Çözüldü</SelectItem>
                                                    <SelectItem value="dismissed">Reddedildi</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => {
                                                        setSelectedReport(report)
                                                        setShowDetailDialog(true)
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 text-red-600 hover:text-red-700"
                                                    onClick={() => {
                                                        setReportToDelete(report)
                                                        setShowDeleteDialog(true)
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Dialog */}
            <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Şikayet Detayları</DialogTitle>
                    </DialogHeader>
                    {selectedReport && (
                        <div className="space-y-4">
                            {/* Report Type */}
                            <div>
                                <p className="text-sm font-medium mb-1">Şikayet Tipi</p>
                                <span className={`text-xs px-2 py-1 rounded-full ${selectedReport.reportType === 'entry' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {selectedReport.reportType === 'entry' ? 'Entry' : 'Kullanıcı'}
                                </span>
                            </div>

                            {/* Reported Content */}
                            {selectedReport.reportType === 'user' ? (
                                <div>
                                    <p className="text-sm font-medium mb-1">Şikayet Edilen Kullanıcı</p>
                                    <p className="text-sm text-[#4729ff]">{selectedReport.reportedUser?.nick || 'Bilinmiyor'}</p>
                                    <p className="text-xs text-muted-foreground">{selectedReport.reportedUser?.email}</p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-sm font-medium mb-1">Şikayet Edilen Entry</p>
                                    <div className="p-3 bg-muted rounded-md">
                                        <p className="text-sm whitespace-pre-wrap">
                                            {selectedReport.reportedEntry?.content || 'Entry içeriği bulunamadı'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Reporter */}
                            <div>
                                <p className="text-sm font-medium mb-1">Şikayet Eden Kullanıcı</p>
                                <p className="text-sm">{selectedReport.reportedBy?.nick}</p>
                                <p className="text-xs text-muted-foreground">{selectedReport.reportedBy?.email}</p>
                            </div>

                            {/* Reason */}
                            <div>
                                <p className="text-sm font-medium mb-1">Neden</p>
                                <p className="text-sm">{getReasonLabel(selectedReport.reason)}</p>
                            </div>

                            {/* Description */}
                            <div>
                                <p className="text-sm font-medium mb-1">Açıklama</p>
                                <p className="text-sm">{selectedReport.description}</p>
                            </div>

                            {/* Status */}
                            <div>
                                <p className="text-sm font-medium mb-1">Durum</p>
                                {getStatusBadge(selectedReport.status)}
                            </div>

                            {/* Reviewed By */}
                            {selectedReport.reviewedBy && (
                                <div>
                                    <p className="text-sm font-medium mb-1">İnceleyen</p>
                                    <p className="text-sm">{selectedReport.reviewedBy?.nick}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(selectedReport.reviewedAt).toLocaleDateString('tr-TR')}
                                    </p>
                                </div>
                            )}

                            {/* Admin Notes */}
                            {selectedReport.adminNotes && (
                                <div>
                                    <p className="text-sm font-medium mb-1">Admin Notları</p>
                                    <p className="text-sm">{selectedReport.adminNotes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Şikayeti Sil</DialogTitle>
                        <DialogDescription>
                            Bu şikayeti silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            İptal
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Sil
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
