import React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// Badge Modal Component with Switch Design
export function BadgeManagementModal({
    open,
    onOpenChange,
    selectedUser,
    badges,
    dispatch,
    assignBadgeToUser,
    removeBadgeFromUser,
    getAllUsers,
    currentPage,
    itemsPerPage
}: any) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Rozet Yönetimi - {selectedUser?.nick}</DialogTitle>
                    <DialogDescription>
                        Kullanıcıya rozet ekleyin veya mevcut rozetleri kaldırın
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {badges.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8 text-sm">
                            Henüz rozet eklenmemiş
                        </p>
                    ) : (
                        badges.map((badge: any) => {
                            const isAssigned = selectedUser?.badges?.some((b: any) => b._id === badge._id)

                            return (
                                <div
                                    key={badge._id}
                                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <img
                                            src={badge.icon}
                                            alt={badge.name}
                                            className="w-10 h-10 rounded-full border-2 border-border object-cover flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{badge.name}</p>
                                            {badge.description && (
                                                <p className="text-xs text-muted-foreground line-clamp-1">
                                                    {badge.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={async () => {
                                            try {
                                                if (isAssigned) {
                                                    await dispatch(removeBadgeFromUser({
                                                        userId: selectedUser._id,
                                                        badgeId: badge._id
                                                    })).unwrap()
                                                } else {
                                                    await dispatch(assignBadgeToUser({
                                                        userId: selectedUser._id,
                                                        badgeId: badge._id
                                                    })).unwrap()
                                                }
                                                dispatch(getAllUsers({ page: currentPage.toString(), limit: itemsPerPage.toString() }))
                                            } catch (error: any) {
                                                alert(error || "İşlem başarısız")
                                            }
                                        }}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:ring-offset-2 flex-shrink-0 ${isAssigned ? "bg-[#ff6600]" : "bg-gray-200"
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAssigned ? "translate-x-6" : "translate-x-1"
                                                }`}
                                        />
                                    </button>
                                </div>
                            )
                        })
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Kapat
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
