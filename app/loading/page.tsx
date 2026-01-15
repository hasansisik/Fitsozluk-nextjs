"use client"

import { Loader2 } from "lucide-react"

export default function LoadingPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-[#ff6600] animate-spin" />
                <div className="text-[#ff6600] font-medium animate-pulse">yönlendiriliyorsunuz...</div>
            </div>
        </div>
    )
}
