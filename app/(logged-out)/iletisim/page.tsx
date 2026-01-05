export default function IletisimPage() {
    return (
        <div className="w-full bg-white">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl font-bold text-foreground mb-6">iletişim</h1>

                    <div className="space-y-6 text-sm text-foreground">
                        <section>
                            <h2 className="text-lg font-semibold mb-3">genel iletişim</h2>
                            <p className="mb-2">
                                ekşi sözlük ile iletişime geçmek için aşağıdaki bilgileri kullanabilirsiniz.
                            </p>
                            <div className="space-y-2 text-muted-foreground">
                                <p><strong>E-posta:</strong> iletisim@eksisozluk.com</p>
                                <p><strong>Adres:</strong> Örnek Mahallesi, Sözlük Sokak No:1, İstanbul</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mb-3">destek</h2>
                            <p className="text-muted-foreground">
                                Teknik sorunlar ve hesap ile ilgili konular için destek ekibimize ulaşabilirsiniz.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mb-3">reklam ve iş birlikleri</h2>
                            <p className="text-muted-foreground">
                                Reklam ve iş birliği teklifleri için: reklam@eksisozluk.com
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
