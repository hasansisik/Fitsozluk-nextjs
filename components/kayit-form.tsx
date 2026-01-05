"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { register } from "@/redux/actions/userActions"

export function KayitForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((state) => state.user)

  const [nick, setNick] = useState("")
  const [email, setEmail] = useState("")
  const [birthDay, setBirthDay] = useState("")
  const [birthMonth, setBirthMonth] = useState("")
  const [birthYear, setBirthYear] = useState("")
  const [gender, setGender] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      return
    }

    // Construct birthDate from day, month, year
    let birthDate: string | undefined
    if (birthDay && birthMonth && birthYear) {
      // Format: YYYY-MM-DD
      birthDate = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`
    }

    const result = await dispatch(register({
      name: nick,
      surname: nick,
      email,
      password,
      birthDate
    }))

    if (register.fulfilled.match(result)) {
      // Registration successful, redirect to verification page
      router.push(`/dogrulama?email=${encodeURIComponent(email)}`)
    }
    // Error handling is done through Redux state and displayed in the form
  }

  // Generate days (1-31)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  // Generate months (1-12)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  // Generate years (current year - 100 to current year - 13)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 88 }, (_, i) => currentYear - 13 - i)

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">yeni kullanıcı kaydı</h1>
        </div>

        {error && typeof error === 'string' && (
          <FieldError>{error}</FieldError>
        )}

        {/* Nick */}
        <Field>
          <FieldLabel htmlFor="nick">nick</FieldLabel>
          <Input
            id="nick"
            type="text"
            required
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            disabled={loading}
          />
        </Field>

        {/* E-mail */}
        <Field>
          <FieldLabel htmlFor="email">e-mail</FieldLabel>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </Field>

        {/* Doğum Tarihi */}
        <Field>
          <FieldLabel>doğum tarihi</FieldLabel>
          <div className="flex gap-2">
            <select
              value={birthDay}
              onChange={(e) => setBirthDay(e.target.value)}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4729ff] focus-visible:ring-offset-0"
              required
              disabled={loading}
            >
              <option value="">Gün</option>
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <select
              value={birthMonth}
              onChange={(e) => setBirthMonth(e.target.value)}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4729ff] focus-visible:ring-offset-0"
              required
              disabled={loading}
            >
              <option value="">Ay</option>
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            <select
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4729ff] focus-visible:ring-offset-0"
              required
              disabled={loading}
            >
              <option value="">Yıl</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </Field>

        {/* Cinsiyet */}
        <Field>
          <FieldLabel>cinsiyet</FieldLabel>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="kadın"
                checked={gender === "kadın"}
                onChange={(e) => setGender(e.target.value)}
                className="w-4 h-4 text-[#4729ff] border-gray-300 focus:ring-[#4729ff]"
                disabled={loading}
              />
              <span className="text-sm">kadın</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="erkek"
                checked={gender === "erkek"}
                onChange={(e) => setGender(e.target.value)}
                className="w-4 h-4 text-[#4729ff] border-gray-300 focus:ring-[#4729ff]"
                disabled={loading}
              />
              <span className="text-sm">erkek</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="başka"
                checked={gender === "başka"}
                onChange={(e) => setGender(e.target.value)}
                className="w-4 h-4 text-[#4729ff] border-gray-300 focus:ring-[#4729ff]"
                disabled={loading}
              />
              <span className="text-sm">başka</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="boşver"
                checked={gender === "boşver"}
                onChange={(e) => setGender(e.target.value)}
                className="w-4 h-4 text-[#4729ff] border-gray-300 focus:ring-[#4729ff]"
                disabled={loading}
              />
              <span className="text-sm bg-[#4729ff] text-white px-2 py-1 rounded">boşver</span>
            </label>
          </div>
        </Field>

        {/* Privacy Notice */}
        <div className="flex gap-2 p-3 bg-muted rounded-md text-sm">
          <span className="text-lg">ⓘ</span>
          <p className="text-muted-foreground">
            hesap güvenliğiniz açısından şifrenizin <strong>diğer sitelerde kullandığınız şifrelerden farklı olmasını</strong> tavsiye ederiz.
          </p>
        </div>

        {/* Şifre */}
        <Field>
          <FieldLabel htmlFor="password">şifre</FieldLabel>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <FieldDescription className="text-xs text-muted-foreground">
            şifre en az 8 karakter
          </FieldDescription>
        </Field>

        {/* Şifre Tekrar */}
        <Field>
          <FieldLabel htmlFor="confirmPassword">şifre (tekrar)</FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
          {password && confirmPassword && password !== confirmPassword && (
            <FieldError>Şifreler eşleşmiyor</FieldError>
          )}
        </Field>

        {/* Submit Button */}
        <Field>
          <Button
            type="submit"
            disabled={loading || (password !== confirmPassword && confirmPassword !== "")}
            className="bg-[#4729ff] hover:bg-[#3820cc] text-white"
          >
            {loading ? "Kayıt yapılıyor..." : "kayıt ol işte böyle"}
          </Button>
        </Field>

        {/* Login Link */}
        <Field>
          <FieldDescription className="text-center">
            Zaten hesabınız var mı?{" "}
            <Link href="/giris" className="underline underline-offset-4 text-[#4729ff] hover:text-[#3820cc]">
              Giriş yap
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
