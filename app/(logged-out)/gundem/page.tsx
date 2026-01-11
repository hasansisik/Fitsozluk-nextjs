import { TopicsSidebar } from "@/components/topics-sidebar"
import { Suspense } from "react"

export default function GundemPage() {
    return (
        <div className="w-full min-h-screen bg-white">
            <div className="max-w-[1300px] mx-auto">
                <main className="w-full lg:max-w-4xl lg:mx-auto">
                    {/* Header with Title and Settings Icon already inside TopicsSidebar */}
                    <Suspense fallback={<div className="p-4">Yükleniyor...</div>}>
                        <TopicsSidebar isMobile />
                    </Suspense>
                </main>
            </div>
        </div>
    )
}
