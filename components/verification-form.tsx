"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Mail } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { verifyEmail, againEmail } from "@/redux/actions/userActions"

export function VerificationForm() {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const searchParams = useSearchParams()
    const { loading, error: reduxError, message } = useAppSelector((state) => state.user)

    const [email, setEmail] = useState("")
    const [code, setCode] = useState(["", "", "", ""])
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState("")
    const [resendMessage, setResendMessage] = useState("")
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
        // Get email from URL parameters or localStorage
        const emailParam = searchParams.get('email')
        const storedEmail = localStorage.getItem('userEmail')
        setEmail(emailParam || storedEmail || "")

        // Focus first input on mount
        inputRefs.current[0]?.focus()
    }, [searchParams])

    const handleChange = (index: number, value: string) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return

        const newCode = [...code]
        newCode[index] = value
        setCode(newCode)
        setError("")

        // Auto-focus next input
        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus()
        }

        // Auto-submit when all fields are filled
        if (newCode.every((digit) => digit !== "") && index === 3) {
            handleSubmit(newCode.join(""))
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle backspace
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData("text").slice(0, 4)

        if (!/^\d+$/.test(pastedData)) return

        const newCode = [...code]
        pastedData.split("").forEach((char, index) => {
            if (index < 4) {
                newCode[index] = char
            }
        })
        setCode(newCode)

        // Focus last filled input or last input
        const lastIndex = Math.min(pastedData.length, 3)
        inputRefs.current[lastIndex]?.focus()

        // Auto-submit if complete
        if (pastedData.length === 4) {
            handleSubmit(pastedData)
        }
    }

    const handleSubmit = async (verificationCode: string) => {
        if (!email) {
            setError("E-posta adresi bulunamadı")
            return
        }

        setError("")
        const result = await dispatch(verifyEmail({
            email,
            verificationCode: parseInt(verificationCode)
        }))

        if (verifyEmail.fulfilled.match(result)) {
            setIsSubmitted(true)
        } else {
            setError(result.payload as string || "Doğrulama başarısız")
            setCode(["", "", "", ""])
            inputRefs.current[0]?.focus()
        }
    }

    const handleResend = async () => {
        if (!email) {
            setError("E-posta adresi bulunamadı")
            return
        }

        setCode(["", "", "", ""])
        setError("")
        setResendMessage("")

        const result = await dispatch(againEmail(email))

        if (againEmail.fulfilled.match(result)) {
            setResendMessage("Yeni doğrulama kodu e-posta adresinize gönderildi!")
        } else {
            setError(result.payload as string || "Kod gönderilemedi")
        }

        inputRefs.current[0]?.focus()
    }

    if (isSubmitted) {
        return (
            <div className="w-full text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                    Hesap Doğrulandı
                </h1>
                <p className="text-sm text-muted-foreground mb-8">
                    E-posta adresiniz başarıyla doğrulandı. Artık giriş yapabilirsiniz.
                </p>
                <Link
                    href="/giris"
                    className="inline-block px-6 py-2 bg-[#4729ff] text-white font-medium rounded-md hover:bg-[#3618ee] transition-colors"
                >
                    Giriş Yap
                </Link>
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
                    <Mail className="h-8 w-8 text-[#4729ff]" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                    E-posta Doğrulama
                </h1>
                <p className="text-sm text-muted-foreground">
                    E-posta adresinize gönderilen 4 haneli doğrulama kodunu girin.
                </p>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                {/* Verification Code Inputs */}
                <div>
                    <div className="flex justify-center gap-2 mb-2">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={index === 0 ? handlePaste : undefined}
                                className="w-10 h-10 text-center text-base font-semibold border-2 border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4729ff] focus:border-transparent"
                            />
                        ))}
                    </div>
                    {error && (
                        <p className="text-center text-sm text-red-600">{error}</p>
                    )}
                </div>

                {/* Resend Code */}
                <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                        Kod gelmedi mi?
                    </p>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={loading}
                        className="text-sm font-medium text-[#4729ff] hover:text-[#3618ee] transition-colors disabled:opacity-50"
                    >
                        {loading ? "Gönderiliyor..." : "Kodu Tekrar Gönder"}
                    </button>
                    {resendMessage && (
                        <p className="mt-2 text-sm text-green-600">{resendMessage}</p>
                    )}
                </div>

                {/* Back to Login */}
                <div className="text-center pt-4 border-t border-border">
                    <Link
                        href="/giris"
                        className="text-sm text-muted-foreground hover:text-[#4729ff] transition-colors"
                    >
                        Giriş sayfasına dön
                    </Link>
                </div>
            </form>
        </div>
    )
}
