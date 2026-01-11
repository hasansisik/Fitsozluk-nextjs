"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { resetPassword } from "@/redux/actions/userActions"

export function ResetPasswordForm() {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { loading } = useAppSelector((state) => state.user)

    const [email, setEmail] = useState("")
    const [verificationCode, setVerificationCode] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; verificationCode?: string }>({})


    useEffect(() => {
        // Get email from localStorage (set in forgot password page)
        const storedEmail = localStorage.getItem('resetPasswordEmail')
        if (storedEmail) {
            setEmail(storedEmail)
        }
    }, [])

    const validatePassword = (pwd: string) => {
        if (pwd.length < 8) {
            return "Şifre en az 8 karakter olmalıdır"
        }
        if (!/[A-Z]/.test(pwd)) {
            return "Şifre en az bir büyük harf içermelidir"
        }
        if (!/[a-z]/.test(pwd)) {
            return "Şifre en az bir küçük harf içermelidir"
        }
        if (!/[0-9]/.test(pwd)) {
            return "Şifre en az bir rakam içermelidir"
        }
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const newErrors: { password?: string; confirmPassword?: string; verificationCode?: string } = {}

        // Verification code validation
        if (!verificationCode) {
            newErrors.verificationCode = "Doğrulama kodu gereklidir"
        } else if (!/^\d{4}$/.test(verificationCode)) {
            newErrors.verificationCode = "Doğrulama kodu 4 haneli olmalıdır"
        }

        // Password validation
        const passwordError = validatePassword(password)
        if (passwordError) {
            newErrors.password = passwordError
        }

        // Confirm password validation
        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Şifreler eşleşmiyor"
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        if (!email) {
            setErrors({ verificationCode: "E-posta adresi bulunamadı. Lütfen şifremi unuttum sayfasından başlayın." })
            return
        }

        const result = await dispatch(resetPassword({
            email,
            passwordToken: parseInt(verificationCode),
            newPassword: password
        }))

        if (resetPassword.fulfilled.match(result)) {
            // Clear stored email
            localStorage.removeItem('resetPasswordEmail')
            setIsSubmitted(true)
        } else {
            setErrors({ verificationCode: result.payload as string || "Şifre sıfırlama başarısız" })
        }
    }

    if (isSubmitted) {
        return (
            <div className="w-full text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                    Şifre Başarıyla Değiştirildi
                </h1>
                <p className="text-sm text-muted-foreground mb-8">
                    Yeni şifreniz ile giriş yapabilirsiniz.
                </p>
                <Link
                    href="/giris"
                    className="inline-block px-6 py-2 bg-[#ff6600] text-white font-medium rounded-md hover:bg-[#e65c00] transition-colors"
                >
                    Giriş Yap
                </Link>
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                    Yeni Şifre Oluştur
                </h1>
                <p className="text-sm text-muted-foreground">
                    Hesabınız için güçlü bir şifre belirleyin.
                </p>
            </div>

            {/* Email notification banner */}
            {email && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                        Şifre sıfırlama kodu <strong>{email}</strong> adresine gönderildi.
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                        E-postanızı kontrol edin ve 4 haneli kodu aşağıya girin.
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Verification Code Field */}
                <div>
                    <label htmlFor="verificationCode" className="block text-sm font-medium text-foreground mb-2">
                        Doğrulama Kodu
                    </label>
                    <input
                        id="verificationCode"
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        value={verificationCode}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '') // Only digits
                            setVerificationCode(value)
                            setErrors({ ...errors, verificationCode: undefined })
                        }}
                        placeholder="E-postanıza gönderilen 4 haneli kod"
                        className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent"
                    />
                    {errors.verificationCode && (
                        <p className="mt-2 text-sm text-red-600">{errors.verificationCode}</p>
                    )}
                </div>

                {/* New Password Field */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                        Yeni Şifre
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value)
                                setErrors({ ...errors, password: undefined })
                            }}
                            placeholder="En az 8 karakter"
                            className="w-full px-4 py-2 pr-10 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                    )}
                </div>

                {/* Confirm Password Field */}
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                        Şifre Tekrar
                    </label>
                    <div className="relative">
                        <input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value)
                                setErrors({ ...errors, confirmPassword: undefined })
                            }}
                            placeholder="Şifrenizi tekrar girin"
                            className="w-full px-4 py-2 pr-10 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-[#ff6600] text-white font-medium rounded-md hover:bg-[#e65c00] transition-colors disabled:opacity-50"
                >
                    {loading ? "Şifre değiştiriliyor..." : "Şifreyi Değiştir"}
                </button>
            </form>
        </div>
    )
}
