"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { TopicsSidebar } from "@/components/topics-sidebar"

export default function SettingsPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("sifre")
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [newEmail, setNewEmail] = useState("")
    const [newUsername, setNewUsername] = useState("")

    const tabs = [
        { id: "sifre", label: "şifre" },
        { id: "e-mail", label: "e-mail" },
        { id: "kullanici-adi", label: "kullanıcı adı" },
        { id: "hesabi-kapat", label: "hesabı kapat" }
    ]

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentPassword) {
            alert("Mevcut şifrenizi girmelisiniz!")
            return
        }
        if (newPassword !== confirmPassword) {
            alert("Yeni şifreler eşleşmiyor!")
            return
        }
        // TODO: Implement actual password change
        alert("Şifre başarıyla değiştirildi!")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
    }

    const handleEmailChange = (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentPassword) {
            alert("Mevcut şifrenizi girmelisiniz!")
            return
        }
        // TODO: Implement actual email change
        alert("E-mail başarıyla değiştirildi!")
        setCurrentPassword("")
        setNewEmail("")
    }

    const handleUsernameChange = (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentPassword) {
            alert("Mevcut şifrenizi girmelisiniz!")
            return
        }
        // TODO: Implement actual username change
        alert("Kullanıcı adı başarıyla değiştirildi!")
        setCurrentPassword("")
        setNewUsername("")
    }

    const handleAccountClosure = (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentPassword) {
            alert("Mevcut şifrenizi girmelisiniz!")
            return
        }
        const confirm = window.confirm("Hesabınızı kalıcı olarak kapatmak istediğinizden emin misiniz? Bu işlem geri alınamaz!")
        if (confirm) {
            // TODO: Implement actual account closure
            alert("Hesabınız kapatılmıştır.")
            localStorage.removeItem("mockUser")
            router.push("/")
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
                    <main className="flex-1 w-full lg:max-w-4xl mx-auto bg-white py-8 lg:px-8">
                        <h1 className="text-2xl font-bold text-foreground mb-6">ayarlar</h1>

                        {/* Tabs */}
                        <div className="border-b border-border mb-6">
                            <div className="flex gap-6 overflow-x-auto">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-3 px-1 text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
                                            ? "text-foreground border-b-2 border-foreground font-medium"
                                            : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="max-w-2xl">
                            {/* Şifre Tab */}
                            {activeTab === "sifre" && (
                                <div>
                                    <h2 className="text-lg font-medium mb-4">Şifre Değiştir</h2>
                                    <form onSubmit={handlePasswordChange} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Mevcut Şifre
                                            </label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4729ff]"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Yeni Şifre
                                            </label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4729ff]"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Yeni Şifre (Tekrar)
                                            </label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4729ff]"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="bg-[#4729ff] text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-[#3820cc] transition-colors"
                                        >
                                            Şifreyi Değiştir
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* E-mail Tab */}
                            {activeTab === "e-mail" && (
                                <div>
                                    <h2 className="text-lg font-medium mb-4">E-mail Değiştir</h2>
                                    <form onSubmit={handleEmailChange} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Mevcut Şifre
                                            </label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4729ff]"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Yeni E-mail
                                            </label>
                                            <input
                                                type="email"
                                                value={newEmail}
                                                onChange={(e) => setNewEmail(e.target.value)}
                                                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4729ff]"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="bg-[#4729ff] text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-[#3820cc] transition-colors"
                                        >
                                            E-mail'i Değiştir
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Kullanıcı Adı Tab */}
                            {activeTab === "kullanici-adi" && (
                                <div>
                                    <h2 className="text-lg font-medium mb-4">Kullanıcı Adı Değiştir</h2>
                                    <form onSubmit={handleUsernameChange} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Mevcut Şifre
                                            </label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4729ff]"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Yeni Kullanıcı Adı
                                            </label>
                                            <input
                                                type="text"
                                                value={newUsername}
                                                onChange={(e) => setNewUsername(e.target.value)}
                                                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4729ff]"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="bg-[#4729ff] text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-[#3820cc] transition-colors"
                                        >
                                            Kullanıcı Adını Değiştir
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Hesabı Kapat Tab */}
                            {activeTab === "hesabi-kapat" && (
                                <div>
                                    <h2 className="text-lg font-medium mb-4 text-red-600">Hesabı Kapat</h2>
                                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                                        <p className="text-sm text-red-800 mb-2">
                                            <strong>Uyarı:</strong> Bu işlem geri alınamaz!
                                        </p>
                                        <p className="text-sm text-red-700">
                                            Hesabınızı kapattığınızda tüm verileriniz kalıcı olarak silinecektir.
                                        </p>
                                    </div>
                                    <form onSubmit={handleAccountClosure} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Mevcut Şifre
                                            </label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="bg-red-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                                        >
                                            Hesabı Kalıcı Olarak Kapat
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </main>

                    {/* Right Sidebar - Empty space for ads */}
                    <div className="hidden xl:block w-80">
                        {/* Empty for now */}
                    </div>
                </div>
            </div>
        </div>
    )
}
