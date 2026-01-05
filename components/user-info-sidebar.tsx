"use client"

export function UserInfoSidebar() {
    return (
        <aside className="w-80 border-l border-border bg-white h-[calc(100vh-6.5rem)] overflow-y-auto">
            <div className="p-4 space-y-4">
                {/* Empty space for ads */}
                <div className="border border-dashed border-border rounded-lg p-8 text-center">
                    <p className="text-sm text-muted-foreground">Reklam Alanı</p>
                </div>

                <div className="border border-dashed border-border rounded-lg p-8 text-center">
                    <p className="text-sm text-muted-foreground">Reklam Alanı</p>
                </div>

                <div className="border border-dashed border-border rounded-lg p-8 text-center">
                    <p className="text-sm text-muted-foreground">Reklam Alanı</p>
                </div>
            </div>
        </aside>
    )
}
