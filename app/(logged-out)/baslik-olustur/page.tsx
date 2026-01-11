"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { createTopic } from "@/redux/actions/topicActions"
import { getAllMenus, Menu } from "@/redux/actions/menuActions"
import { TopicsSidebar } from "@/components/topics-sidebar"
import { TopAd } from "@/components/ads/top-ad"
import { SidebarAd } from "@/components/ads/sidebar-ad"
import { Loader2 } from "lucide-react"

export default function CreateTopicPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.user)
    const { menus } = useAppSelector((state) => state.menu)

    const suggestedTitle = searchParams.get("title") || ""
    const [title, setTitle] = useState(suggestedTitle)
    const [entryContent, setEntryContent] = useState("")
    const [category, setCategory] = useState("diğer")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")



    useEffect(() => {
        // Check if user is logged in
        if (!user) {
            router.push("/")
            return
        }

        // Check if user is çaylak
        if (user.title === "çaylak") {
            setError("Çaylak kullanıcılar başlık açamaz")
        }

        dispatch(getAllMenus({}))
    }, [user, router, dispatch])

    const insertFormatting = (format: string) => {
        const textarea = document.getElementById("entry-content") as HTMLTextAreaElement
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = entryContent.substring(start, end)
        let newText = ""
        let cursorOffset = 0

        switch (format) {
            case "bkz":
                newText = `(bkz: ${selectedText || "başlık"})`
                cursorOffset = selectedText ? 0 : -1
                break
            case "hede":
                newText = `\`${selectedText || "hede"}\``
                cursorOffset = selectedText ? 0 : -1
                break
            case "*":
                newText = `*${selectedText || "spoiler"}*`
                cursorOffset = selectedText ? 0 : -1
                break
            case "spoiler":
                newText = `--- spoiler ---\n${selectedText || "içerik"}\n--- spoiler ---`
                cursorOffset = selectedText ? 0 : -5
                break
            case "http":
                newText = selectedText || "https://"
                cursorOffset = selectedText ? 0 : 0
                break
            case "görsel":
                newText = selectedText || "https://example.com/image.jpg"
                cursorOffset = selectedText ? 0 : 0
                break
        }

        const before = entryContent.substring(0, start)
        const after = entryContent.substring(end)
        const updated = before + newText + after

        setEntryContent(updated)

        // Set cursor position
        setTimeout(() => {
            const newPosition = start + newText.length + cursorOffset
            textarea.focus()
            textarea.setSelectionRange(newPosition, newPosition)
        }, 0)
    }

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/ğ/g, "g")
            .replace(/ü/g, "u")
            .replace(/ş/g, "s")
            .replace(/ı/g, "i")
            .replace(/ö/g, "o")
            .replace(/ç/g, "c")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user || user.title === "çaylak") {
            setError("Çaylak kullanıcılar başlık açamaz")
            return
        }

        if (!title.trim()) {
            setError("Başlık boş olamaz")
            return
        }

        if (!entryContent.trim()) {
            setError("Entry içeriği boş olamaz")
            return
        }

        setIsSubmitting(true)
        setError("")

        try {
            const slug = generateSlug(title)
            const result = await dispatch(createTopic({
                title: title.trim(),
                slug,
                category,
                firstEntry: entryContent.trim()
            })).unwrap()

            // Redirect to new topic page
            if (result.topic) {
                router.push(`/${result.topic.slug}`)
            }
        } catch (err: any) {
            setError(err || "Başlık oluşturulurken bir hata oluştu")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-[#ff6600]" />
            </div>
        )
    }

    return (
        <div className="w-full bg-white">
            <div className="max-w-[1300px] mx-auto px-6 lg:px-8">
                <div className="flex min-h-[calc(100vh-6.5rem)] gap-8">
                    {/* Left Sidebar */}
                    <div className="hidden lg:block">
                        <TopicsSidebar />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col min-w-0">
                        <TopAd location="baslik-olustur" />

                        <div className="flex gap-8">
                            <main className="flex-1 min-w-0">
                                <div className="mb-6">
                                    <h1 className="text-2xl font-bold text-foreground">
                                        {title || "Başlık"}
                                    </h1>
                                </div>

                                {error && (
                                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Category Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Ana Başlık Seçin <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600] text-sm"
                                            disabled={user.title === "çaylak"}
                                            required
                                        >
                                            {menus.map((menu: Menu) => (
                                                <option key={menu._id} value={menu.label.toLowerCase()}>
                                                    {menu.label}
                                                </option>
                                            ))}
                                            <option value="diğer">diğer</option>
                                        </select>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Bu başlığın hangi kategoriye ait olduğunu seçin
                                        </p>
                                    </div>

                                    {/* Formatting Toolbar */}
                                    <div className="flex gap-2 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={() => insertFormatting("bkz")}
                                            className="px-3 py-1 text-xs border border-border rounded hover:bg-secondary transition-colors"
                                            disabled={user.title === "çaylak"}
                                        >
                                            (bkz:)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => insertFormatting("hede")}
                                            className="px-3 py-1 text-xs border border-border rounded hover:bg-secondary transition-colors"
                                            disabled={user.title === "çaylak"}
                                        >
                                            `hede`
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => insertFormatting("*")}
                                            className="px-3 py-1 text-xs border border-border rounded hover:bg-secondary transition-colors"
                                            disabled={user.title === "çaylak"}
                                        >
                                            *
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => insertFormatting("spoiler")}
                                            className="px-3 py-1 text-xs border border-border rounded hover:bg-secondary transition-colors"
                                            disabled={user.title === "çaylak"}
                                        >
                                            - spoiler -
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => insertFormatting("http")}
                                            className="px-3 py-1 text-xs border border-border rounded hover:bg-secondary transition-colors"
                                            disabled={user.title === "çaylak"}
                                        >
                                            http://
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => insertFormatting("görsel")}
                                            className="px-3 py-1 text-xs border border-border rounded hover:bg-secondary transition-colors"
                                            disabled={user.title === "çaylak"}
                                        >
                                            görsel
                                        </button>
                                    </div>

                                    {/* Entry Content */}
                                    <div>
                                        <textarea
                                            id="entry-content"
                                            value={entryContent}
                                            onChange={(e) => setEntryContent(e.target.value)}
                                            placeholder={`"${title || "bu başlık"}" hakkında bilgi verin`}
                                            className="w-full min-h-[300px] px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600] text-sm resize-y"
                                            disabled={user.title === "çaylak"}
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || user.title === "çaylak"}
                                            className="px-6 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#e65c00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                            {isSubmitting ? "Oluşturuluyor..." : "Başlığı Oluştur"}
                                        </button>
                                    </div>
                                </form>
                            </main>

                            {/* Right Sidebar Ad */}
                            <SidebarAd location="baslik-olustur" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
