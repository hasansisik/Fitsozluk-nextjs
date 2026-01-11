"use client"

import { Heart, Share2, Flag, User, X, Trash2, ThumbsUp, ThumbsDown, Twitter, Facebook, MessageCircle, Send, Copy } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { likeEntry, dislikeEntry, toggleFavorite } from "@/redux/actions/entryActions"
import { createReport } from "@/redux/actions/reportActions"

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
    const [reportReason, setReportReason] = useState("")
    const [reportDescription, setReportDescription] = useState("")
    const [isExpanded, setIsExpanded] = useState(false)
    const [syncedProfilePicture, setSyncedProfilePicture] = useState<string | null>(authorPicture || null)
    const reportDialogRef = useRef<HTMLDivElement>(null)

    // Character limit for truncating long entries
    const CHARACTER_LIMIT = 500
    const shouldTruncate = content.length > CHARACTER_LIMIT

    // Sync profile picture from localStorage
    const syncPhoto = () => {
        const savedPhoto = localStorage.getItem(`profilePhoto_${author}`)
        if (savedPhoto) {
            setSyncedProfilePicture(savedPhoto)
        } else if (authorPicture) {
            setSyncedProfilePicture(authorPicture)
        } else {
            setSyncedProfilePicture(null)
        }
    }

    useEffect(() => {
        syncPhoto()

        window.addEventListener('profilePhotoUpdated', syncPhoto)
        return () => window.removeEventListener('profilePhotoUpdated', syncPhoto)
    }, [author, authorPicture])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            if (!target.closest('.share-menu-container')) {
                setShowShareMenu(false)
            }
            // Close report dialog when clicking outside
            if (reportDialogRef.current && !reportDialogRef.current.contains(event.target as Node)) {
                setShowReportDialog(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

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

    const submitReport = async () => {
        if (!reportReason) {
            alert("Lütfen bir şikayet nedeni seçin")
            return
        }
        if (!reportDescription.trim()) {
            alert("Lütfen şikayet açıklaması girin")
            return
        }

        try {
            await dispatch(createReport({
                reportType: 'entry',
                reportedEntryId: id,
                reason: reportReason,
                description: reportDescription
            })).unwrap()

            alert("Şikayetiniz başarıyla gönderildi")
            setShowReportDialog(false)
            setReportReason("")
            setReportDescription("")
        } catch (error: any) {
            alert(error || "Şikayet gönderilemedi")
        }
    }

    const renderContent = () => {
        const slugify = (text: string) => {
            // Turkish character mapping
            const turkishMap: { [key: string]: string } = {
                'ç': 'c', 'Ç': 'c',
                'ğ': 'g', 'Ğ': 'g',
                'ı': 'i', 'İ': 'i',
                'ö': 'o', 'Ö': 'o',
                'ş': 's', 'Ş': 's',
                'ü': 'u', 'Ü': 'u'
            }

            return text.trim()
                .toLowerCase()
                .split('')
                .map(char => turkishMap[char] || char)
                .join('')
                .replace(/ /g, '-')
                .replace(/[^\w-]+/g, '')
        }

        // Get the content to display (truncated or full)
        const displayContent = shouldTruncate && !isExpanded
            ? content.substring(0, CHARACTER_LIMIT) + '...'
            : content

        // 1. Split into parts by spoiler first (since it has priority/custom UI)
        const spoilerRegex = /--\s*`spoiler`\s*--([\s\S]*?)--\s*`spoiler`\s*--/g
        let parts: any[] = []
        let lastIndex = 0
        let match

        while ((match = spoilerRegex.exec(displayContent)) !== null) {
            if (match.index > lastIndex) {
                parts.push(displayContent.substring(lastIndex, match.index))
            }
            parts.push({ type: 'spoiler', content: match[1].trim() })
            lastIndex = match.index + match[0].length
        }
        if (lastIndex < displayContent.length) {
            parts.push(displayContent.substring(lastIndex))
        }

        // 2. Process each non-spoiler part for bkz and links
        const finalElements: React.ReactNode[] = []
        let spoilerCount = 0

        parts.forEach((part, partIdx) => {
            if (typeof part === 'string') {
                // Combined regex for all patterns:
                // 1. (bkz: text) - normal bkz
                // 2. `text` - hede (bold link)
                // 3. `:text` - asterisk (bold link with *)
                // 4. URLs
                const combinedRegex = /\(bkz:\s*([^\)]+)\)|`([^:`]+)`|`:([^`]+)`|(https?:\/\/[^\s]+)/g
                let subParts: React.ReactNode[] = []
                let subLastIndex = 0
                let subMatch

                while ((subMatch = combinedRegex.exec(part)) !== null) {
                    // Text before the match
                    if (subMatch.index > subLastIndex) {
                        subParts.push(part.substring(subLastIndex, subMatch.index))
                    }

                    if (subMatch[1]) {
                        // (bkz: text) format
                        const bkzText = subMatch[1].trim()
                        const slug = slugify(bkzText)

                        subParts.push(
                            <span key={`bkz-${subMatch.index}`}>
                                (bkz: <Link
                                    href={`/${slug}`}
                                    className="text-[#ff6600] hover:underline"
                                >
                                    {bkzText}
                                </Link>)
                            </span>
                        )
                    } else if (subMatch[2]) {
                        // `text` format (hede - bold link)
                        const hedeText = subMatch[2].trim()
                        const slug = slugify(hedeText)

                        subParts.push(
                            <Link
                                key={`hede-${subMatch.index}`}
                                href={`/${slug}`}
                                className="text-[#ff6600] hover:underline font-bold"
                            >
                                {hedeText}
                            </Link>
                        )
                    } else if (subMatch[3]) {
                        // `:text` format (asterisk - bold link with *)
                        const asteriskText = subMatch[3].trim()
                        const slug = slugify(asteriskText)

                        subParts.push(
                            <Link
                                key={`asterisk-${subMatch.index}`}
                                href={`/${slug}`}
                                className="text-[#ff6600] hover:underline font-bold"
                            >
                                {asteriskText}*
                            </Link>
                        )
                    } else if (subMatch[4]) {
                        // URL match
                        const url = subMatch[4]
                        subParts.push(
                            <a
                                key={`url-${subMatch.index}`}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#ff6600] hover:underline break-all"
                            >
                                {url}
                            </a>
                        )
                    }

                    subLastIndex = subMatch.index + subMatch[0].length
                }

                if (subLastIndex < part.length) {
                    subParts.push(part.substring(subLastIndex))
                }

                finalElements.push(<span key={`part-${partIdx}`}>{subParts}</span>)
            } else {
                // It's a spoiler
                const currentSpoilerIndex = spoilerCount++
                finalElements.push(
                    <span key={`spoiler-${currentSpoilerIndex}`} className="inline-block my-1">
                        {showSpoilers[currentSpoilerIndex] ? (
                            <span className="bg-gray-100 px-2 py-1 rounded">
                                {part.content}
                                <button
                                    onClick={() => setShowSpoilers(prev => ({ ...prev, [currentSpoilerIndex]: false }))}
                                    className="ml-2 text-xs text-[#ff6600] hover:underline"
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
            }
        })

        return finalElements.length > 0 ? finalElements : displayContent
    }

    return (
        <div className="relative">
            <div className="">
                {/* Entry Content */}
                <p className="text-sm leading-normal text-foreground whitespace-pre-wrap">
                    {renderContent()}
                </p>

                {/* Read More / Show Less Button */}
                {shouldTruncate && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-2 text-sm text-[#ff6600] hover:underline font-medium transition-colors"
                    >
                        {isExpanded ? 'daha az göster' : 'devamını oku'}
                    </button>
                )}

                {/* Special Link */}
                {isSpecial && (
                    <a href="#" className="text-xs text-muted-foreground hover:text-[#ff6600] transition-colors">
                        bu başka bir şey mi?
                    </a>
                )}

                {/* Reaction Buttons */}
                <div className="flex items-center justify-between py-3">
                    {/* Left: Reaction Buttons */}
                    <div className="flex items-center gap-3">
                        {/* Thumbs Up */}
                        <button
                            onClick={handleLikeAction}
                            className={`flex items-center gap-1 transition-colors ${isLikedProp ? 'text-[#ff6600]' : 'text-muted-foreground hover:text-[#ff6600]'}`}
                            title="Beğen"
                        >
                            <ThumbsUp
                                className="h-3.5 w-3.5"
                                fill={isLikedProp ? "currentColor" : "none"}
                            />
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
                            <ThumbsDown
                                className="h-3.5 w-3.5"
                                fill={isDislikedProp ? "currentColor" : "none"}
                            />
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
                            <Heart
                                className="h-3.5 w-3.5"
                                fill={isFavoritedProp ? "currentColor" : "none"}
                            />
                            {favoriteCount > 0 && (
                                <span className="text-xs font-medium">{favoriteCount}</span>
                            )}
                        </button>
                    </div>

                    {/* Right: Share and Report */}
                    <div className="flex items-center gap-3">
                        {/* Share Button */}
                        <div className="relative share-menu-container">
                            <button
                                onClick={() => setShowShareMenu(!showShareMenu)}
                                className="text-muted-foreground hover:text-[#ff6600] transition-colors"
                                title="Paylaş"
                            >
                                <Share2 className="h-3.5 w-3.5" />
                            </button>

                            {showShareMenu && (
                                <div className="absolute right-0 top-8 bg-white border border-border rounded-md shadow-lg py-2 min-w-[180px] z-50">
                                    <button onClick={() => handleShare('twitter')} className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2">
                                        <Twitter className="h-4 w-4" />
                                        Twitter'da Paylaş
                                    </button>
                                    <button onClick={() => handleShare('facebook')} className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2">
                                        <Facebook className="h-4 w-4" />
                                        Facebook'ta Paylaş
                                    </button>
                                    <button onClick={() => handleShare('whatsapp')} className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2">
                                        <MessageCircle className="h-4 w-4" />
                                        WhatsApp'ta Paylaş
                                    </button>
                                    <button onClick={() => handleShare('telegram')} className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2">
                                        <Send className="h-4 w-4" />
                                        Telegram'da Paylaş
                                    </button>
                                    <button onClick={() => handleShare('copy')} className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2">
                                        <Copy className="h-4 w-4" />
                                        Linki Kopyala
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

                {/* Entry Footer */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* User Picture */}
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden border border-border">
                            {syncedProfilePicture ? (
                                <Image src={syncedProfilePicture} alt={author} width={40} height={40} className="w-full h-full object-cover" />
                            ) : (
                                <User className="h-5 w-5 text-muted-foreground" />
                            )}
                        </div>

                        {/* Author Info */}
                        <div className="flex flex-col">
                            <Link
                                href={`/yazar/${encodeURIComponent(author)}`}
                                className="text-sm text-muted-foreground hover:text-[#ff6600] transition-colors"
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div ref={reportDialogRef} className="bg-white rounded-lg p-4 max-w-md w-full mx-4 shadow-2xl border border-border">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base font-medium">Şikayet Et</h3>
                            <button onClick={() => setShowReportDialog(false)}><X className="h-4 w-4 text-muted-foreground hover:text-foreground" /></button>
                        </div>
                        <div className="space-y-2 mb-3">
                            {[
                                { value: 'spam', label: 'Spam' },
                                { value: 'harassment', label: 'Hakaret veya Nefret' },
                                { value: 'inappropriate', label: 'Uygunsuz İçerik' },
                                { value: 'copyright', label: 'Telif Hakkı' },
                                { value: 'other', label: 'Diğer' }
                            ].map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setReportReason(type.value)}
                                    className={`w-full text-left px-3 py-2 text-sm border rounded-md transition-colors ${reportReason === type.value ? 'border-[#ff6600] bg-[#ff6600]/5' : 'border-border hover:bg-secondary'
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                        <textarea
                            value={reportDescription}
                            onChange={(e) => setReportDescription(e.target.value)}
                            placeholder="Şikayet açıklaması (zorunlu)"
                            className="w-full h-20 p-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-[#ff6600] outline-none mb-3"
                            maxLength={500}
                        />
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">{reportDescription.length}/500</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowReportDialog(false)}
                                    className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-secondary"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={submitReport}
                                    className="px-3 py-1.5 text-sm bg-[#ff6600] text-white rounded-md hover:bg-[#e65c00]"
                                >
                                    Gönder
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4 shadow-2xl border border-border">
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
