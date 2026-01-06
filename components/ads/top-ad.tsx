"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getAdsByLocation, Ad } from "@/redux/actions/adActions"
import { usePathname } from "next/navigation"

export function TopAd() {
    const pathname = usePathname()
    const dispatch = useAppDispatch()
    const { ads, loading } = useAppSelector((state) => state.ad)
    const [currentAd, setCurrentAd] = useState<Ad | null>(null)

    useEffect(() => {
        let location = "entry"
        if (pathname === "/") location = "anasayfa"
        else if (pathname.startsWith("/basliklar")) location = "basliklar"

        // We can fetch specifically for this location
        dispatch(getAdsByLocation(location)).then((result: any) => {
            if (result.payload) {
                const topAds = result.payload.filter((ad: Ad) => ad.type === "top" && ad.isActive)
                if (topAds.length > 0) {
                    // Pick a random ad if multiple exist
                    setCurrentAd(topAds[Math.floor(Math.random() * topAds.length)])
                }
            }
        })
    }, [pathname, dispatch])

    if (!currentAd) {
        return (
            <div className="w-full py-6">
                <div className="w-full h-32 bg-[#f8f9fa] border border-border rounded-sm flex items-center justify-center text-muted-foreground text-sm font-medium">
                    Reklam Alanı
                </div>
            </div>
        )
    }

    return (
        <div className="w-full py-6">
            <a
                href={currentAd.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-32 relative group overflow-hidden border border-border rounded-sm"
            >
                <img
                    src={currentAd.imageUrl}
                    alt="Advertisement"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-1 right-1 bg-black/20 text-white text-[10px] px-1 rounded backdrop-blur-sm">reklam</div>
            </a>
        </div>
    )
}
