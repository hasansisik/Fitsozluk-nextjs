"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { resetPassword } from "@/redux/actions/userActions"

export function SifreSifirlamaForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const { loading, error, message } = useAppSelector((state) => state.user)
  
  const [email, setEmail] = useState("")
  const [passwordToken, setPasswordToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    const emailParam = searchParams.get("email")
    const tokenParam = searchParams.get("token")
    if (emailParam) setEmail(emailParam)
    if (tokenParam) setPasswordToken(tokenParam)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      return
    }

    if (!email || !passwordToken) {
      return
    }

    const result = await dispatch(resetPassword({ 
      email, 
      passwordToken: Number(passwordToken), 
      newPassword 
    }))
    
    if (resetPassword.fulfilled.match(result)) {
      setTimeout(() => {
        router.push("/giris")
      }, 2000)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Yeni Şifre Belirle</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Yeni şifrenizi belirleyin
          </p>
        </div>
        {error && typeof error === 'string' && (
          <FieldError>{error}</FieldError>
        )}
        {message && (
          <FieldDescription className="text-green-600 dark:text-green-400">
            {message}
          </FieldDescription>
        )}
        {!email && (
          <Field>
            <FieldLabel htmlFor="email">E-posta</FieldLabel>
            <Input 
              id="email" 
              type="email" 
              placeholder="ornek@email.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </Field>
        )}
        {!passwordToken && (
          <Field>
            <FieldLabel htmlFor="token">Doğrulama Kodu</FieldLabel>
            <Input 
              id="token" 
              type="text" 
              placeholder="Doğrulama kodunuz" 
              required 
              value={passwordToken}
              onChange={(e) => setPasswordToken(e.target.value)}
              disabled={loading}
            />
          </Field>
        )}
        <Field>
          <FieldLabel htmlFor="password">Yeni Şifre</FieldLabel>
          <Input 
            id="password" 
            type="password" 
            placeholder="Yeni şifreniz" 
            required 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="confirmPassword">Yeni Şifre Tekrar</FieldLabel>
          <Input 
            id="confirmPassword" 
            type="password" 
            placeholder="Yeni şifrenizi tekrar girin" 
            required 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <FieldError>Şifreler eşleşmiyor</FieldError>
          )}
          <FieldDescription>
            Şifreniz en az 8 karakter olmalıdır.
          </FieldDescription>
        </Field>
        <Field>
          <Button type="submit" disabled={loading || (newPassword !== confirmPassword && confirmPassword !== "") || !email || !passwordToken}>
            {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
          </Button>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            <Link href="/giris" className="underline underline-offset-4">
              ← Giriş sayfasına dön
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}

