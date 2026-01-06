"use client"

export function UserInfoSidebar() {
    return (
        <aside className="w-80 bg-white h-[calc(100vh-6.5rem)] overflow-y-auto sticky top-[6.5rem]">
            <div className="p-4 pl-0">
                {/* Single Large Advertisement Area */}
                <div
                    className="w-full aspect-[4/5] bg-[#fdf2f2] border-0 rounded-sm flex flex-col items-center justify-center p-6 relative overflow-hidden"
                >
                    <div className="absolute top-2 right-2 flex gap-1 items-center">
                        <div className="w-3 h-3 border border-muted-foreground/30 rounded-full flex items-center justify-center text-[8px] text-muted-foreground/50">i</div>
                        <div className="w-3 h-3 border border-muted-foreground/30 rounded-full flex items-center justify-center text-[8px] text-muted-foreground/50">⋮</div>
                    </div>

                    <div className="text-xs text-[#a1a1a1] mb-2 uppercase tracking-wider font-semibold">birikimokullari.com</div>
                    <div className="text-2xl font-bold text-[#1a1a1a] text-center mb-6 leading-tight">9 Ocak'a Kadar Başvur</div>

                    <div className="text-sm text-center text-[#4a4a4a] mb-8">
                        4-11. sınıflar için dev fırsat! %100 burs kazan, teknoloji hediyeleri kap. Son gün 9 Ocak
                    </div>
                </div>
            </div>
        </aside>
    )
}
