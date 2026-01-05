"use client"

import { Heart, Share2, Flag, User, X, Trash2, ThumbsUp, ThumbsDown } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface EntryCardProps {
    id?: string
    content: string
    author: string
    date: string
    time: string
    isSpecial?: boolean
    onDelete?: (id: string) => void
    topicTitle?: string
    topicSlug?: string
}

export function EntryCard({ id, content, author, date, time, isSpecial, onDelete, topicTitle, topicSlug }: EntryCardProps) {
    const router = useRouter()
    const [showShareMenu, setShowShareMenu] = useState(false)
    const [showReportDialog, setShowReportDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [isLiked, setIsLiked] = useState(false)
    const [thumbsUp, setThumbsUp] = useState(false)
    const [thumbsDown, setThumbsDown] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [currentUser, setCurrentUser] = useState<string | null>(null)
    const [showSpoilers, setShowSpoilers] = useState<{ [key: number]: boolean }>({})

    useEffect(() => {
        // Check if user is logged in
        const mockUser = localStorage.getItem("mockUser")
        setIsLoggedIn(!!mockUser)

        if (mockUser) {
            const user = JSON.parse(mockUser)
            setCurrentUser(user.nick)
        }

        // Check if this entry is liked
        if (id && mockUser) {
            const likedEntries = JSON.parse(localStorage.getItem("likedEntries") || "{}")
            setIsLiked(!!likedEntries[id])
        }

        // Click outside handler to close share menu
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            if (!target.closest('.share-menu-container')) {
                setShowShareMenu(false)
            }
        }

        if (showShareMenu) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [id, showShareMenu])

    const handleLike = () => {
        if (!isLoggedIn) {
            router.push('/giris')
            return
        }

        if (!id) return

        const likedEntries = JSON.parse(localStorage.getItem("likedEntries") || "{}")

        if (isLiked) {
            // Unlike
            delete likedEntries[id]
        } else {
            // Like - store entry data with topic title
            likedEntries[id] = {
                content,
                author,
                date,
                time,
                topicTitle,
                topicSlug,
                likedAt: new Date().toISOString()
            }
        }

        localStorage.setItem("likedEntries", JSON.stringify(likedEntries))
        setIsLiked(!isLiked)
    }

    const handleThumbsUp = () => {
        if (!isLoggedIn) {
            router.push('/giris')
            return
        }
        if (thumbsDown) setThumbsDown(false)
        setThumbsUp(!thumbsUp)
    }

    const handleThumbsDown = () => {
        if (!isLoggedIn) {
            router.push('/giris')
            return
        }
        if (thumbsUp) setThumbsUp(false)
        setThumbsDown(!thumbsDown)
    }

    const handleShare = (platform: string) => {
        const url = window.location.href
        const text = `${content.substring(0, 100)}... - ${author}`

        const shareUrls: Record<string, string> = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
            telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
            copy: url
        }

        if (platform === 'copy') {
            navigator.clipboard.writeText(url)
            alert('Link kopyalandı!')
        } else {
            window.open(shareUrls[platform], '_blank')
        }

        setShowShareMenu(false)
    }

    const handleReport = () => {
        if (!isLoggedIn) {
            router.push('/giris')
            return
        }
        setShowReportDialog(true)
    }

    const submitReport = (reason: string) => {
        // Submit report logic here
        console.log('Report submitted:', reason)
        setShowReportDialog(false)
    }

    const renderContent = () => {
        // Parse content for spoilers
        const spoilerRegex = /--\s*`spoiler`\s*--([\s\S]*?)--\s*`spoiler`\s*--/g
        const parts: React.ReactNode[] = []
        let lastIndex = 0
        let match
        let spoilerIndex = 0

        while ((match = spoilerRegex.exec(content)) !== null) {
            // Add text before spoiler
            if (match.index > lastIndex) {
                parts.push(
                    <span key={`text-${lastIndex}`}>
                        {content.substring(lastIndex, match.index)}
                    </span>
                )
            }

            // Add spoiler content
            const spoilerContent = match[1].trim()
            const currentSpoilerIndex = spoilerIndex
            parts.push(
                <span key={`spoiler-${spoilerIndex}`} className="inline-block my-1">
                    {showSpoilers[currentSpoilerIndex] ? (
                        <span className="bg-gray-100 px-2 py-1 rounded">
                            {spoilerContent}
                            <button
                                onClick={() => setShowSpoilers(prev => ({ ...prev, [currentSpoilerIndex]: false }))}
                                className="ml-2 text-xs text-[#4729ff] hover:underline"
                            >
                                gizle
                            </button>
                        </span>
                    ) : (
                        <button
                            onClick={() => setShowSpoilers(prev => ({ ...prev, [currentSpoilerIndex]: true }))}
                            className="bg-gray-200 px-3 py-1 rounded text-sm text-gray-600 hover:bg-gray-300 transition-colors"
                        >
                            spoiler (göster)
                        </button>
                    )}
                </span>
            )

            lastIndex = match.index + match[0].length
            spoilerIndex++
        }

        // Add remaining text
        if (lastIndex < content.length) {
            parts.push(
                <span key={`text-${lastIndex}`}>
                    {content.substring(lastIndex)}
                </span>
            )
        }

        return parts.length > 0 ? parts : content
    }

    return (
        <div className="bg-white border-b border-border py-4 px-6 relative">
            <div className="space-y-3">
                {/* Entry Content */}
                <p className="text-sm leading-normal text-foreground whitespace-pre-wrap">
                    {renderContent()}
                </p>

                {/* Special Link */}
                {isSpecial && (
                    <a href="#" className="text-xs text-muted-foreground hover:text-[#4729ff] transition-colors">
                        bu başka bir şey mi?
                    </a>
                )}

                {/* Reaction Buttons - Between content and footer */}
                {currentUser !== author && (
                    <div className="flex items-center justify-between py-2">
                        {/* Left: Reaction Buttons */}
                        <div className="flex items-center gap-2">
                            {/* Thumbs Up */}
                            <button
                                onClick={handleThumbsUp}
                                className={`transition-colors ${thumbsUp ? 'text-[#4729ff]' : 'text-muted-foreground hover:text-[#4729ff]'
                                    }`}
                                title="Beğen"
                            >
                                <ThumbsUp className={`h-3.5 w-3.5 ${thumbsUp ? 'fill-current' : ''}`} />
                            </button>

                            {/* Thumbs Down */}
                            <button
                                onClick={handleThumbsDown}
                                className={`transition-colors ${thumbsDown ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
                                    }`}
                                title="Beğenme"
                            >
                                <ThumbsDown className={`h-3.5 w-3.5 ${thumbsDown ? 'fill-current' : ''}`} />
                            </button>

                            {/* Favorites (Heart) */}
                            <button
                                onClick={handleLike}
                                className={`transition-colors ml-1 ${isLiked ? 'text-[#4729ff]' : 'text-muted-foreground hover:text-[#4729ff]'
                                    }`}
                                title="Favorilere ekle"
                            >
                                <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-current' : ''}`} />
                            </button>
                        </div>

                        {/* Right: Share and Report */}
                        <div className="flex items-center gap-2">
                            {/* Share Button */}
                            <div className="relative share-menu-container">
                                <button
                                    onClick={() => setShowShareMenu(!showShareMenu)}
                                    className="text-muted-foreground hover:text-[#4729ff] transition-colors"
                                    title="Paylaş"
                                >
                                    <Share2 className="h-3.5 w-3.5" />
                                </button>

                                {/* Share Menu */}
                                {showShareMenu && (
                                    <div className="absolute right-0 top-8 bg-white border border-border rounded-md shadow-lg py-2 min-w-[180px] z-50">
                                        <button
                                            onClick={() => handleShare('twitter')}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                                        >
                                            <span>𝕏</span> Twitter'da Paylaş
                                        </button>
                                        <button
                                            onClick={() => handleShare('facebook')}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                                        >
                                            <span>f</span> Facebook'ta Paylaş
                                        </button>
                                        <button
                                            onClick={() => handleShare('whatsapp')}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                                        >
                                            <span>📱</span> WhatsApp'ta Paylaş
                                        </button>
                                        <button
                                            onClick={() => handleShare('telegram')}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                                        >
                                            <span>✈️</span> Telegram'da Paylaş
                                        </button>
                                        <button
                                            onClick={() => handleShare('copy')}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                                        >
                                            <span>📋</span> Linki Kopyala
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Report Button */}
                            <button
                                onClick={handleReport}
                                className="text-muted-foreground hover:text-red-500 transition-colors"
                                title="Şikayet et"
                            >
                                <Flag className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Entry Footer */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* User Icon - Larger */}
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-muted-foreground" />
                        </div>

                        {/* Author Info - Stacked */}
                        <div className="flex flex-col">
                            <Link
                                href={`/biri/${encodeURIComponent(author)}`}
                                className="text-sm text-muted-foreground hover:text-[#4729ff] transition-colors"
                            >
                                {author}
                            </Link>
                            <span className="text-[11px] text-muted-foreground">
                                {date} {time}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons - Right Side */}
                    <div className="flex items-center gap-2">

                        {/* Delete Button - Only for own entries */}
                        {currentUser === author && onDelete && id && (
                            <button
                                onClick={() => setShowDeleteDialog(true)}
                                className="text-muted-foreground hover:text-red-500 transition-colors"
                                title="Sil"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Report Dialog */}
            {showReportDialog && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
                    onClick={() => setShowReportDialog(false)}
                >
                    <div
                        className="bg-white rounded-lg p-4 max-w-xs w-full mx-4 shadow-2xl border border-border pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base font-medium">Şikayet Et</h3>
                            <button onClick={() => setShowReportDialog(false)}>
                                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <button
                                onClick={() => submitReport('spam')}
                                className="w-full text-left px-3 py-2 text-sm border border-border rounded-md hover:bg-secondary transition-colors"
                            >
                                Spam veya yanıltıcı
                            </button>
                            <button
                                onClick={() => submitReport('offensive')}
                                className="w-full text-left px-3 py-2 text-sm border border-border rounded-md hover:bg-secondary transition-colors"
                            >
                                Hakaret veya nefret söylemi
                            </button>
                            <button
                                onClick={() => submitReport('inappropriate')}
                                className="w-full text-left px-3 py-2 text-sm border border-border rounded-md hover:bg-secondary transition-colors"
                            >
                                Uygunsuz içerik
                            </button>
                            <button
                                onClick={() => submitReport('copyright')}
                                className="w-full text-left px-3 py-2 text-sm border border-border rounded-md hover:bg-secondary transition-colors"
                            >
                                Telif hakkı ihlali
                            </button>
                            <button
                                onClick={() => submitReport('other')}
                                className="w-full text-left px-3 py-2 text-sm border border-border rounded-md hover:bg-secondary transition-colors"
                            >
                                Diğer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-2xl border border-border pointer-events-auto">
                        <div className="mb-4">
                            <h3 className="text-lg font-medium text-foreground mb-2">Entry'yi Sil</h3>
                            <p className="text-sm text-muted-foreground">
                                Bu entry'yi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                            </p>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteDialog(false)}
                                className="px-4 py-2 text-sm border border-border rounded-md hover:bg-secondary transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={() => {
                                    if (onDelete && id) {
                                        onDelete(id)
                                    }
                                    setShowDeleteDialog(false)
                                }}
                                className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                            >
                                Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
