"use client"

import { Heart, Share2, Flag, User, X, Trash2, ThumbsUp, ThumbsDown } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { likeEntry, dislikeEntry, toggleFavorite } from "@/redux/actions/entryActions"

interface EntryCardProps {
    id: string
    content: string
    author: string
    authorPicture?: string
    date: string
    time: string
    isSpecial?: boolean
    onDelete?: (id: string) => void
    topicTitle?: string
    topicSlug?: string
    favoriteCount?: number
    likeCount?: number
    dislikeCount?: number
    isLiked?: boolean
    isDisliked?: boolean
    isFavorited?: boolean
}

export function EntryCard({
    id,
    content,
    author,
    authorPicture,
    date,
    time,
    isSpecial,
    onDelete,
    topicTitle,
    topicSlug,
    favoriteCount = 0,
    likeCount = 0,
    dislikeCount = 0,
    isLiked: isLikedProp,
    isDisliked: isDislikedProp,
    isFavorited: isFavoritedProp
}: EntryCardProps) {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { user: authUser } = useAppSelector((state) => state.user)

    // Check if the current user has reacted to this entry
    // If props are passed (from backend), we use them. Otherwise we check Redux state arrays if available.
    // In our backend, we have likes/dislikes/favorites arrays.

    const [showShareMenu, setShowShareMenu] = useState(false)
    const [showReportDialog, setShowReportDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showSpoilers, setShowSpoilers] = useState<{ [key: number]: boolean }>({})

    useEffect(() => {
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
    }, [showShareMenu])

    const handleLikeAction = async () => {
        if (!authUser) {
            router.push('/giris')
            return
        }
        await dispatch(likeEntry(id))
    }

    const handleDislikeAction = async () => {
        if (!authUser) {
            router.push('/giris')
            return
        }
        await dispatch(dislikeEntry(id))
    }

    const handleFavoriteAction = async () => {
        if (!authUser) {
            router.push('/giris')
            return
        }
        await dispatch(toggleFavorite(id))
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
        if (!authUser) {
            router.push('/giris')
            return
        }
        setShowReportDialog(true)
    }

    const submitReport = (reason: string) => {
        console.log('Report submitted:', reason)
        setShowReportDialog(false)
    }

    const renderContent = () => {
        const spoilerRegex = /--\s*`spoiler`\s*--([\s\S]*?)--\s*`spoiler`\s*--/g
        const parts: React.ReactNode[] = []
        let lastIndex = 0
        let match
        let spoilerIndex = 0

        while ((match = spoilerRegex.exec(content)) !== null) {
            if (match.index > lastIndex) {
                parts.push(
                    <span key={`text-${lastIndex}`}>
                        {content.substring(lastIndex, match.index)}
                    </span>
                )
            }

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

                {/* Reaction Buttons */}
                <div className="flex items-center justify-between py-2">
                    {/* Left: Reaction Buttons */}
                    <div className="flex items-center gap-3">
                        {/* Thumbs Up */}
                        <button
                            onClick={handleLikeAction}
                            className={`flex items-center gap-1 transition-colors ${isLikedProp ? 'text-[#4729ff]' : 'text-muted-foreground hover:text-[#4729ff]'}`}
                            title="Beğen"
                        >
                            <ThumbsUp className={`h-3.5 w-3.5 ${isLikedProp ? 'fill-current' : ''}`} />
                            {likeCount > 0 && (
                                <span className="text-xs font-medium">{likeCount}</span>
                            )}
                        </button>

                        {/* Thumbs Down */}
                        <button
                            onClick={handleDislikeAction}
                            className={`flex items-center gap-1 transition-colors ${isDislikedProp ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                            title="Beğenme"
                        >
                            <ThumbsDown className={`h-3.5 w-3.5 ${isDislikedProp ? 'fill-current' : ''}`} />
                            {dislikeCount > 0 && (
                                <span className="text-xs font-medium">{dislikeCount}</span>
                            )}
                        </button>

                        {/* Favorites */}
                        <button
                            onClick={handleFavoriteAction}
                            className={`flex items-center gap-1 transition-colors ${isFavoritedProp ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                            title="Favorilere ekle"
                        >
                            <Heart className={`h-3.5 w-3.5 ${isFavoritedProp ? 'fill-current' : ''}`} />
                            {favoriteCount > 0 && (
                                <span className="text-xs font-medium">{favoriteCount}</span>
                            )}
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

                            {showShareMenu && (
                                <div className="absolute right-0 top-8 bg-white border border-border rounded-md shadow-lg py-2 min-w-[180px] z-50">
                                    <button onClick={() => handleShare('twitter')} className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2"><span>𝕏</span> Twitter'da Paylaş</button>
                                    <button onClick={() => handleShare('facebook')} className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2"><span>f</span> Facebook'ta Paylaş</button>
                                    <button onClick={() => handleShare('whatsapp')} className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2"><span>📱</span> WhatsApp'ta Paylaş</button>
                                    <button onClick={() => handleShare('telegram')} className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2"><span>✈️</span> Telegram'da Paylaş</button>
                                    <button onClick={() => handleShare('copy')} className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2"><span>📋</span> Linki Kopyala</button>
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

                {/* Entry Footer */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* User Picture */}
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden border border-border">
                            {authorPicture ? (
                                <Image src={authorPicture} alt={author} width={40} height={40} className="w-full h-full object-cover" />
                            ) : (
                                <User className="h-5 w-5 text-muted-foreground" />
                            )}
                        </div>

                        {/* Author Info */}
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
                        {authUser?.nick === author && onDelete && id && (
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
                <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none" onClick={() => setShowReportDialog(false)}>
                    <div className="bg-white rounded-lg p-4 max-w-xs w-full mx-4 shadow-2xl border border-border pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base font-medium">Şikayet Et</h3>
                            <button onClick={() => setShowReportDialog(false)}><X className="h-4 w-4 text-muted-foreground hover:text-foreground" /></button>
                        </div>
                        <div className="space-y-2">
                            {['spam', 'offensive', 'inappropriate', 'copyright', 'other'].map((type) => (
                                <button key={type} onClick={() => submitReport(type)} className="w-full text-left px-3 py-2 text-sm border border-border rounded-md hover:bg-secondary transition-colors capitalize">
                                    {type === 'offensive' ? 'Hakaret veya Nefret' : type === 'inappropriate' ? 'Uygunsuz İçerik' : type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <div className="bg-white rounded-lg p-6 max-sm w-full mx-4 shadow-2xl border border-border pointer-events-auto">
                        <div className="mb-4">
                            <h3 className="text-lg font-medium text-foreground mb-2">Entry'yi Sil</h3>
                            <p className="text-sm text-muted-foreground">Bu entry'yi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowDeleteDialog(false)} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-secondary transition-colors">İptal</button>
                            <button onClick={() => { if (onDelete && id) onDelete(id); setShowDeleteDialog(false); }} className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">Sil</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
