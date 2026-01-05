"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/redux/hook"
import { loadUser } from "@/redux/actions/userActions"

export default function DashboardPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.user)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("accessToken")

    if (!token) {
      // No token, redirect to login
      router.push("/giris")
      return
    }

    // Load user if not already loaded or loading
    if (!isAuthenticated && !loading && !user) {
      dispatch(loadUser())
    }
  }, [dispatch, isAuthenticated, loading, router, user])

  // Show loading while checking authentication
  if (loading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4729ff] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Hoş Geldiniz, {user?.name || 'Kullanıcı'}!</h1>

        <div className="grid gap-6">
          {/* Welcome Card */}
          <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
            <p className="text-muted-foreground mb-4">
              Hesabınıza başarıyla giriş yaptınız. Bu sayfadan profilinizi yönetebilir ve içeriklerinizi görebilirsiniz.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-secondary rounded-md">
                <p className="text-sm text-muted-foreground">E-posta</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div className="p-4 bg-secondary rounded-md">
                <p className="text-sm text-muted-foreground">Kullanıcı Adı</p>
                <p className="font-medium">{user?.email?.split('@')[0]}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Hızlı İşlemler</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border border-border rounded-md hover:bg-secondary transition-colors text-left">
                <p className="font-medium mb-1">Profil Ayarları</p>
                <p className="text-sm text-muted-foreground">Profilinizi düzenleyin</p>
              </button>
              <button className="p-4 border border-border rounded-md hover:bg-secondary transition-colors text-left">
                <p className="font-medium mb-1">Hesap Ayarları</p>
                <p className="text-sm text-muted-foreground">Hesap bilgilerinizi yönetin</p>
              </button>
              <button className="p-4 border border-border rounded-md hover:bg-secondary transition-colors text-left">
                <p className="font-medium mb-1">Güvenlik</p>
                <p className="text-sm text-muted-foreground">Şifre ve güvenlik ayarları</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
