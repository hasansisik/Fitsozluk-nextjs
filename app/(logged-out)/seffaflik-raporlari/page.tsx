export default function SeffaflikRaporlariPage() {
    return (
        <div className="w-full bg-white">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl font-bold text-foreground mb-6">şeffaflık raporları</h1>

                    <div className="space-y-6 text-sm text-foreground">
                        <section>
                            <p className="mb-4 text-muted-foreground">
                                ekşi sözlük olarak şeffaflık ilkesine bağlıyız. Bu sayfada platform üzerindeki
                                moderasyon faaliyetleri ve istatistikler hakkında bilgi bulabilirsiniz.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mb-3">2025 yılı raporları</h2>
                            <div className="space-y-3">
                                <div className="border border-border rounded-md p-4">
                                    <h3 className="font-medium mb-2">Aralık 2025</h3>
                                    <ul className="text-muted-foreground space-y-1 text-xs">
                                        <li>• Toplam silinen entry: 1,234</li>
                                        <li>• Kullanıcı şikayetleri: 567</li>
                                        <li>• Askıya alınan hesap: 89</li>
                                    </ul>
                                </div>

                                <div className="border border-border rounded-md p-4">
                                    <h3 className="font-medium mb-2">Kasım 2025</h3>
                                    <ul className="text-muted-foreground space-y-1 text-xs">
                                        <li>• Toplam silinen entry: 1,156</li>
                                        <li>• Kullanıcı şikayetleri: 523</li>
                                        <li>• Askıya alınan hesap: 76</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mb-3">moderasyon kriterleri</h2>
                            <p className="text-muted-foreground">
                                Tüm moderasyon işlemleri sözlük kurallarına uygun olarak gerçekleştirilmektedir.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
