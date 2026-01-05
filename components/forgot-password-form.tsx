"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, ArrowLeft } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { forgotPassword } from "@/redux/actions/userActions"

export function ForgotPasswordForm() {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { loading } = useAppSelector((state) => state.user)

    const [email, setEmail] = useState("")
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        // Email validation
        if (!email) {
            setError("E-posta adresi gereklidir")
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setError("Geçerli bir e-posta adresi giriniz")
            return
        }

        const result = await dispatch(forgotPassword(email))

        if (forgotPassword.fulfilled.match(result)) {
            // Store email for reset password page
            localStorage.setItem('resetPasswordEmail', email)
            setIsSubmitted(true)
        } else {
            setError(result.payload as string || "Bir hata oluştu")
        }
    }

    if (isSubmitted) {
        return (
            <div className="w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                        <Mail className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                        E-posta Gönderildi
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Şifre sıfırlama kodu <strong>{email}</strong> adresine gönderildi.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                        E-postanızı kontrol edin ve kodu kullanarak şifrenizi sıfırlayın.
                    </p>
                </div>

                <div className="space-y-4">
                    <Link
                        href="/sifresifirlama"
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-[#4729ff] text-white font-medium rounded-md hover:bg-[#3618ee] transition-colors"
                    >
                        Şifre Sıfırlama Sayfasına Git
                    </Link>
                    <Link
                        href="/giris"
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-[#4729ff] hover:text-[#3618ee] transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Giriş sayfasına dön
                    </Link>

                    <button
                        onClick={() => {
                            setIsSubmitted(false)
                            setEmail("")
                        }}
                        className="w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Farklı e-posta ile dene
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                    Şifremi Unuttum
                </h1>
                <p className="text-sm text-muted-foreground">
                    Hesabınıza kayıtlı e-posta adresini girin, size şifre sıfırlama bağlantısı gönderelim.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                        E-posta
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ornek@email.com"
                        className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4729ff] focus:border-transparent"
                    />
                    {error && (
                        <p className="mt-2 text-sm text-red-600">{error}</p>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-[#4729ff] text-white font-medium rounded-md hover:bg-[#3618ee] transition-colors disabled:opacity-50"
                >
                    {loading ? "Gönderiliyor..." : "Şifre Sıfırlama Kodu Gönder"}
                </button>

                {/* Back to Login */}
                <div className="text-center">
                    <Link
                        href="/giris"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#4729ff] transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Giriş sayfasına dön
                    </Link>
                </div>
            </form>
        </div>
    )
}
