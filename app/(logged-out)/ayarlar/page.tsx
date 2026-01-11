"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TopicsSidebar } from "@/components/topics-sidebar"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { editProfile, logout, unblockUser } from "@/redux/actions/userActions"
import { Loader2, UserX } from "lucide-react"
import axios from "axios"
import { server } from "@/config"

export default function SettingsPage() {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { user, loading: userLoading } = useAppSelector((state) => state.user)
    const [activeTab, setActiveTab] = useState("sifre")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Form states
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [newEmail, setNewEmail] = useState("")
    const [newUsername, setNewUsername] = useState("")

    // Dialog states
    const [showUnblockDialog, setShowUnblockDialog] = useState(false)
    const [userToUnblock, setUserToUnblock] = useState<string | null>(null)
    const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false)

    useEffect(() => {
        if (!user || !user._id) {
            const token = localStorage.getItem("accessToken")
            if (!token) {
                router.push("/giris")
            }
        }
    }, [user, router])

    const tabs = [
        { id: "sifre", label: "şifre" },
        { id: "e-mail", label: "e-mail" },
        { id: "kullanici-adi", label: "kullanıcı adı" },
        { id: "engellenenler", label: "engellenenler" }, // Added new tab
        { id: "hesabi-kapat", label: "hesabı kapat" }
    ]

    const verifyCurrentPassword = async () => {
        try {
            const token = localStorage.getItem("accessToken")
            const { data } = await axios.post(`${server}/auth/verify-password`,
                { password: currentPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            return data.isValid
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || "Şifre doğrulama başarısız." })
            return false
        }
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: "Yeni şifreler eşleşmiyor!" })
            return
        }

        setLoading(true)
        const isValid = await verifyCurrentPassword()
        if (isValid) {
            try {
                await dispatch(editProfile({
                    nick: user.nick,
                    email: user.email,
                    password: newPassword
                })).unwrap()
                setMessage({ type: 'success', text: "Şifre başarıyla değiştirildi!" })
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
            } catch (err: any) {
                setMessage({ type: 'error', text: err || "Bir hata oluştu." })
            }
        } else {
            setMessage({ type: 'error', text: "Mevcut şifreniz yanlış!" })
        }
        setLoading(false)
    }

    const handleEmailChange = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)
        setLoading(true)

        const isValid = await verifyCurrentPassword()
        if (isValid) {
            try {
                await dispatch(editProfile({
                    nick: user.nick,
                    email: newEmail,
                    password: currentPassword
                })).unwrap()
                setMessage({ type: 'success', text: "E-mail başarıyla güncellendi. Lütfen yeni adresinizi doğrulayın." })
                setCurrentPassword("")
                setNewEmail("")
            } catch (err: any) {
                setMessage({ type: 'error', text: err || "Bir hata oluştu." })
            }
        } else {
            setMessage({ type: 'error', text: "Mevcut şifreniz yanlış!" })
        }
        setLoading(false)
    }

    const handleUsernameChange = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)
        setLoading(true)

        const isValid = await verifyCurrentPassword()
        if (isValid) {
            try {
                await dispatch(editProfile({
                    nick: newUsername,
                    email: user.email,
                    password: currentPassword
                })).unwrap()
                setMessage({ type: 'success', text: "Kullanıcı adı başarıyla güncellendi!" })
                setCurrentPassword("")
                setNewUsername("")
            } catch (err: any) {
                setMessage({ type: 'error', text: err || "Bir hata oluştu." })
            }
        } else {
            setMessage({ type: 'error', text: "Mevcut şifreniz yanlış!" })
        }
        setLoading(false)
    }

    const handleAccountClosure = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)
        setShowDeleteAccountDialog(true)
    }

    const confirmAccountClosure = async () => {
        setLoading(true)
        const isValid = await verifyCurrentPassword()
        if (isValid) {
            try {
                const token = localStorage.getItem("accessToken")
                await axios.delete(`${server}/auth/delete-account`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                alert("Hesabınız kapatılmıştır.")
                dispatch(logout())
                router.push("/")
            } catch (err: any) {
                setMessage({ type: 'error', text: err.response?.data?.message || "Bir hata oluştu." })
                setShowDeleteAccountDialog(false)
            }
        } else {
            setMessage({ type: 'error', text: "Mevcut şifreniz yanlış!" })
            setShowDeleteAccountDialog(false)
        }
        setLoading(false)
    }

    const handleUnblock = (blockedUserId: string) => {
        setUserToUnblock(blockedUserId)
        setShowUnblockDialog(true)
    }

    const confirmUnblock = async () => {
        if (!userToUnblock) return;

        try {
            await dispatch(unblockUser(userToUnblock)).unwrap()
            // Reload user data to sync blocked users list
            const { loadUser } = await import('@/redux/actions/userActions')
            await dispatch(loadUser())
            setMessage({ type: 'success', text: "Kullanıcının engeli kaldırıldı." })
            setShowUnblockDialog(false)
            setUserToUnblock(null)
        } catch (error: any) {
            setMessage({ type: 'error', text: error || "Engel kaldırma başarısız." })
        }
    }

    return (
        <div className="w-full bg-white">
            <div className="max-w-[1300px] mx-auto px-6 lg:px-8">
                <div className="flex min-h-[calc(100vh-6.5rem)]">
                    {/* Left Sidebar - Topics */}
                    <div className="hidden lg:block">
                        <TopicsSidebar />
                    </div>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0 bg-white py-6 lg:px-8">
                        <div className="max-w-2xl">
                            <h1 className="text-xl font-bold text-[#1a1a1a] mb-6">ayarlar</h1>

                            {/* Alert Message */}
                            {message && (
                                <div className={`mb-6 p-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                                    }`}>
                                    {message.text}
                                </div>
                            )}

                            {/* Tabs */}
                            <div className="border-b border-border/40 mb-8">
                                <div className="flex gap-8 overflow-x-auto no-scrollbar">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => {
                                                setActiveTab(tab.id)
                                                setMessage(null)
                                                setCurrentPassword("")
                                            }}
                                            className={`pb-3 px-1 text-xs uppercase tracking-wider transition-colors relative ${activeTab === tab.id
                                                ? "text-[#ff6600] font-bold"
                                                : "text-muted-foreground hover:text-foreground"
                                                }`}
                                        >
                                            {tab.label}
                                            {activeTab === tab.id && (
                                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff6600]" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="space-y-6">
                                {/* Şifre Tab */}
                                {activeTab === "sifre" && (
                                    <form onSubmit={handlePasswordChange} className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase">Mevcut Şifre</label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full h-10 px-3 text-sm border border-border/60 rounded focus:border-[#ff6600] focus:outline-none transition-colors"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase">Yeni Şifre</label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full h-10 px-3 text-sm border border-border/60 rounded focus:border-[#ff6600] focus:outline-none transition-colors"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase">Yeni Şifre (Tekrar)</label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full h-10 px-3 text-sm border border-border/60 rounded focus:border-[#ff6600] focus:outline-none transition-colors"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="h-10 px-6 bg-[#ff6600] text-white text-sm font-semibold rounded hover:bg-[#e65c00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                            şifreyi değiştir
                                        </button>
                                    </form>
                                )}

                                {/* E-mail Tab */}
                                {activeTab === "e-mail" && (
                                    <form onSubmit={handleEmailChange} className="space-y-5">
                                        <div className="bg-orange-50/50 p-4 rounded border border-orange-100 mb-6 text-sm text-orange-800">
                                            Mevcut e-postanız: <strong>{user?.email}</strong>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase">Mevcut Şifre</label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full h-10 px-3 text-sm border border-border/60 rounded focus:border-[#ff6600] focus:outline-none transition-colors"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase">Yeni E-mail</label>
                                            <input
                                                type="email"
                                                value={newEmail}
                                                onChange={(e) => setNewEmail(e.target.value)}
                                                className="w-full h-10 px-3 text-sm border border-border/60 rounded focus:border-[#ff6600] focus:outline-none transition-colors"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="h-10 px-6 bg-[#ff6600] text-white text-sm font-semibold rounded hover:bg-[#e65c00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                            e-mail'i değiştir
                                        </button>
                                    </form>
                                )}

                                {/* Kullanıcı Adı Tab */}
                                {activeTab === "kullanici-adi" && (
                                    <form onSubmit={handleUsernameChange} className="space-y-5">
                                        <div className="bg-orange-50/50 p-4 rounded border border-orange-100 mb-6 text-sm text-orange-800">
                                            Mevcut kullanıcı adınız: <strong>{user?.nick}</strong>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase">Mevcut Şifre</label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full h-10 px-3 text-sm border border-border/60 rounded focus:border-[#ff6600] focus:outline-none transition-colors"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase">Yeni Kullanıcı Adı</label>
                                            <input
                                                type="text"
                                                value={newUsername}
                                                onChange={(e) => setNewUsername(e.target.value)}
                                                className="w-full h-10 px-3 text-sm border border-border/60 rounded focus:border-[#ff6600] focus:outline-none transition-colors"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="h-10 px-6 bg-[#ff6600] text-white text-sm font-semibold rounded hover:bg-[#e65c00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                            kullanıcı adını değiştir
                                        </button>
                                    </form>
                                )}

                                {/* Engellenenler Tab */}
                                {activeTab === "engellenenler" && (
                                    <div className="space-y-5">
                                        <div className="bg-gray-50/50 p-4 rounded border border-border mb-4 text-sm text-muted-foreground">
                                            Engelediğiniz kullanıcıların açtığı başlıkları ve yazdığı entryleri görmezsiniz.
                                        </div>

                                        {user?.blockedUsers && user.blockedUsers.length > 0 ? (
                                            <div className="space-y-3">
                                                {user.blockedUsers.map((blockedUser: any) => (
                                                    <div key={blockedUser._id} className="flex items-center justify-between p-3 border border-border/60 rounded-lg hover:bg-secondary/20 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                                                <img
                                                                    src={blockedUser.picture || "https://res.cloudinary.com/dxmyphljd/image/upload/v1768134400/favicon_Orange_lkigyi.png"}
                                                                    alt={blockedUser.nick}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-sm">@{blockedUser.nick}</div>
                                                                <div className="text-xs text-muted-foreground">{blockedUser.title || "yazar"}</div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleUnblock(blockedUser._id)}
                                                            className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50 transition-colors font-medium flex items-center gap-1"
                                                        >
                                                            <UserX className="h-3.5 w-3.5" />
                                                            engeli kaldır
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 text-muted-foreground text-sm">
                                                Henüz engellediğiniz bir kullanıcı yok.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Hesabı Kapat Tab */}
                                {activeTab === "hesabi-kapat" && (
                                    <form onSubmit={handleAccountClosure} className="space-y-5">
                                        <div className="p-4 bg-red-50 border border-red-100 rounded text-sm text-red-800">
                                            <strong>Uyarı:</strong> Bu işlem geri alınamaz! Hesabınızı kapattığınızda tüm verileriniz kalıcı olarak silinecektir.
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase">Mevcut Şifre</label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full h-10 px-3 text-sm border border-border/60 rounded focus:border-red-500 focus:outline-none transition-colors"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="h-10 px-6 bg-red-600 text-white text-sm font-semibold rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                            hesabı kalıcı olarak kapat
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </main>

                    {/* Right Sidebar - Empty space for ads */}
                    <div className="hidden xl:block w-80">
                        {/* Empty for now */}
                    </div>
                </div>
            </div>

            {/* Unblock Confirmation Dialog */}
            {showUnblockDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4 shadow-2xl border border-border">
                        <div className="mb-4">
                            <h3 className="text-lg font-medium text-foreground mb-2">Engeli Kaldır</h3>
                            <p className="text-sm text-muted-foreground">Kullanıcının engelini kaldırmak istediğinize emin misiniz?</p>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowUnblockDialog(false)} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-secondary transition-colors">İptal</button>
                            <button onClick={confirmUnblock} className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">Kaldır</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Account Confirmation Dialog */}
            {showDeleteAccountDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4 shadow-2xl border border-border">
                        <div className="mb-4">
                            <h3 className="text-lg font-medium text-foreground mb-2">Hesabı Kapat</h3>
                            <p className="text-sm text-muted-foreground">Hesabınızı kalıcı olarak kapatmak istediğinizden emin misiniz? Bu işlem geri alınamaz!</p>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowDeleteAccountDialog(false)} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-secondary transition-colors">İptal</button>
                            <button onClick={confirmAccountClosure} className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
                                {loading ? "İşleniyor..." : "Hesabı Kapat"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
