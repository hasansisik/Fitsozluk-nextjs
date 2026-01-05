"use client"

import { useState } from "react"
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
import { forgotPassword } from "@/redux/actions/userActions"

export function SifremiUnuttumForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const dispatch = useAppDispatch()
  const { loading, error, message } = useAppSelector((state) => state.user)
  
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await dispatch(forgotPassword(email))
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Şifremi Unuttum</h1>
          <p className="text-muted-foreground text-sm text-balance">
            E-posta adresinize şifre sıfırlama bağlantısı göndereceğiz
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
          <FieldDescription>
            Kayıtlı e-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
          </FieldDescription>
        </Field>
        <Field>
          <Button type="submit" disabled={loading}>
            {loading ? "Gönderiliyor..." : "Şifre Sıfırlama Bağlantısı Gönder"}
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

