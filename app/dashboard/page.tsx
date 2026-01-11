"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/redux/hook"
import { loadUser } from "@/redux/actions/userActions"
import { User, Mail, Shield, Settings, Calendar } from "lucide-react"
import Link from "next/link"

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6600] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Belirtilmemiş"
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-background overflow-hidden">
      {/* Header Area - Fixed at Top */}
      <div className="border-b border-border bg-background p-6">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Hoş Geldiniz, {user?.nick || 'Kullanıcı'}!
          </h1>
          <p className="text-xs text-muted-foreground">
            Hesabınıza başarıyla giriş yaptınız. Bu sayfadan profilinizi yönetebilir ve içeriklerinizi görebilirsiniz.
          </p>
        </div>
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full p-6">
          {/* User Info Section */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-tight">
              Kullanıcı Bilgileri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="flex items-start gap-3 p-4 border border-border rounded-md bg-background hover:bg-secondary/30 transition-colors">
                <div className="p-2 rounded-md bg-secondary">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-tight mb-1">E-posta</p>
                  <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
                </div>
              </div>

              {/* Username */}
              <div className="flex items-start gap-3 p-4 border border-border rounded-md bg-background hover:bg-secondary/30 transition-colors">
                <div className="p-2 rounded-md bg-secondary">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-tight mb-1">Kullanıcı Adı</p>
                  <p className="text-sm font-medium text-foreground truncate">{user?.nick}</p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-start gap-3 p-4 border border-border rounded-md bg-background hover:bg-secondary/30 transition-colors">
                <div className="p-2 rounded-md bg-secondary">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-tight mb-1">Rol</p>
                  <p className="text-sm font-medium text-foreground">
                    {user?.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-start gap-3 p-4 border border-border rounded-md bg-background hover:bg-secondary/30 transition-colors">
                <div className="p-2 rounded-md bg-secondary">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-tight mb-1">Durum</p>
                  <p className="text-sm font-medium text-foreground">
                    {user?.status === 'active' ? 'Aktif' : 'Pasif'}
                  </p>
                </div>
              </div>

              {/* Title */}
              <div className="flex items-start gap-3 p-4 border border-border rounded-md bg-background hover:bg-secondary/30 transition-colors">
                <div className="p-2 rounded-md bg-secondary">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-tight mb-1">Unvan</p>
                  <p className="text-sm font-medium text-foreground capitalize">{user?.title || 'çaylak'}</p>
                </div>
              </div>

              {/* Created Date */}
              <div className="flex items-start gap-3 p-4 border border-border rounded-md bg-background hover:bg-secondary/30 transition-colors">
                <div className="p-2 rounded-md bg-secondary">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-tight mb-1">Kayıt Tarihi</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(user?.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-tight">
              Hızlı İşlemler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href={`/yazar/${user?.nick}`}
                className="group flex items-start gap-3 p-4 border border-border rounded-md bg-background hover:bg-secondary/30 transition-all duration-200"
              >
                <div className="p-2 rounded-md bg-secondary group-hover:bg-[#ff6600] transition-colors">
                  <User className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-1">Profil Ayarları</p>
                  <p className="text-xs text-muted-foreground">Profilinizi düzenleyin</p>
                </div>
              </Link>

              <Link
                href="/ayarlar"
                className="group flex items-start gap-3 p-4 border border-border rounded-md bg-background hover:bg-secondary/30 transition-all duration-200"
              >
                <div className="p-2 rounded-md bg-secondary group-hover:bg-[#ff6600] transition-colors">
                  <Settings className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-1">Hesap Ayarları</p>
                  <p className="text-xs text-muted-foreground">Hesap bilgilerinizi yönetin</p>
                </div>
              </Link>

              <Link
                href="/ayarlar"
                className="group flex items-start gap-3 p-4 border border-border rounded-md bg-background hover:bg-secondary/30 transition-all duration-200"
              >
                <div className="p-2 rounded-md bg-secondary group-hover:bg-[#ff6600] transition-colors">
                  <Shield className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-1">Güvenlik</p>
                  <p className="text-xs text-muted-foreground">Şifre ve güvenlik ayarları</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
