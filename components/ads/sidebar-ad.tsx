"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getAdsByLocation, Ad } from "@/redux/actions/adActions"
import { usePathname } from "next/navigation"

interface SidebarAdProps {
    location?: string
}

export function SidebarAd({ location: propLocation }: SidebarAdProps = {}) {
    const pathname = usePathname()
    const dispatch = useAppDispatch()
    const [currentAd, setCurrentAd] = useState<Ad | null>(null)

    useEffect(() => {
        let location = propLocation

        if (!location) {
            if (pathname === "/") location = "anasayfa"
            else if (pathname.startsWith("/basliklar")) location = "basliklar"
            else if (pathname.startsWith("/arama")) location = "arama"
            else location = "entry"
        }

        dispatch(getAdsByLocation(location)).then((result: any) => {
            if (result.payload) {
                const sidebarAds = result.payload.filter((ad: Ad) => ad.type === "sidebar" && ad.isActive)
                if (sidebarAds.length > 0) {
                    setCurrentAd(sidebarAds[Math.floor(Math.random() * sidebarAds.length)])
                }
            }
        })
    }, [pathname, dispatch, propLocation])

    return (
        <aside className="hidden xl:block w-64 flex-shrink-0">
            {currentAd ? (
                <a
                    href={currentAd.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full aspect-[4/5] relative group overflow-hidden border border-border rounded-sm sticky top-[8rem]"
                >
                    <img
                        src={currentAd.imageUrl}
                        alt="Advertisement"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-1 right-1 bg-black/20 text-white text-[10px] px-1 rounded backdrop-blur-sm">reklam</div>
                </a>
            ) : (
                <div className="w-full aspect-[4/5] bg-[#f8f9fa] border border-border rounded-sm flex items-center justify-center text-muted-foreground text-sm font-medium sticky top-[8rem]">
                    Reklam Alanı
                </div>
            )}
        </aside>
    )
}
