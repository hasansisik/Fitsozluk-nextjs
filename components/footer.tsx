import Link from "next/link"

export function Footer() {
    const footerLinks = [
        { href: "/politikalar/iletisim", label: "iletişim" },
        { href: "/politikalar/seffaflik-raporlari", label: "şeffaflık raporları" },
        { href: "/politikalar/sozluk-kurallari", label: "sözlük kuralları" },
        { href: "/politikalar/kullanim-kosullari", label: "kullanım koşulları" },
        { href: "/politikalar/gizlilik-politikasi", label: "gizlilik politikamız" },
    ]

    return (
        <footer className="border-t border-border bg-white">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-4">
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground justify-center">
                    {footerLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="hover:text-[#ff6600] transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    )
}
