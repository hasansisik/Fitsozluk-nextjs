"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { login, clearError } from "@/redux/actions/userActions"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((state) => state.user)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Clear any previous errors when component mounts
  useEffect(() => {
    dispatch(clearError())
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await dispatch(login({ email, password }))

    if (login.fulfilled.match(result)) {
      // Login successful, redirect to user's profile page
      const userNick = result.payload?.nick
      if (userNick) {
        router.push(`/biri/${userNick}`)
      } else {
        router.push("/")
      }
    } else if (result.payload && typeof result.payload === 'object' && 'requiresVerification' in result.payload) {
      // User needs to verify email first
      router.push(`/dogrulama?email=${encodeURIComponent(email)}`)
    }
    // Error handling is done through Redux state and displayed in the form
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Giriş Yap</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Hesabınıza giriş yapmak için e-posta ve şifrenizi girin
          </p>
        </div>
        {error && typeof error === 'string' && (
          <FieldError>{error}</FieldError>
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
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Şifre</FieldLabel>
            <Link
              href="/sifremiunuttum"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Şifremi unuttum
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </Field>
        <Field>
          <Button type="submit" disabled={loading}>
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </Button>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            Hesabınız yok mu?{" "}
            <Link href="/kayitol" className="underline underline-offset-4">
              Kayıt ol
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
