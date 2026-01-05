export default function KullanimKosullariPage() {
    return (
        <div className="w-full bg-white">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl font-bold text-foreground mb-6">kullanım koşulları</h1>

                    <div className="space-y-6 text-sm text-foreground">
                        <section>
                            <p className="mb-4 text-muted-foreground">
                                Son güncelleme: 17 Aralık 2025
                            </p>
                            <p className="text-muted-foreground">
                                ekşi sözlük'ü kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mb-3">1. hizmet tanımı</h2>
                            <p className="text-muted-foreground">
                                ekşi sözlük, kullanıcıların çeşitli konularda entry yazabildiği, bilgi ve
                                deneyim paylaşabildiği bir platformdur.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mb-3">2. kullanıcı sorumlulukları</h2>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>• Hesap bilgilerinizin güvenliğinden siz sorumlusunuz</li>
                                <li>• Paylaştığınız içeriklerden siz sorumlusunuz</li>
                                <li>• Platform kurallarına uymakla yükümlüsünüz</li>
                                <li>• 18 yaşından büyük olmalısınız</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mb-3">3. içerik hakları</h2>
                            <p className="text-muted-foreground">
                                Yazdığınız entry'lerin telif hakları size aittir. Ancak platformda yayınlayarak
                                ekşi sözlük'e bu içerikleri kullanma hakkı vermiş olursunuz.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mb-3">4. hizmet değişiklikleri</h2>
                            <p className="text-muted-foreground">
                                ekşi sözlük, hizmeti dilediği zaman değiştirme, askıya alma veya sonlandırma
                                hakkını saklı tutar.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mb-3">5. sorumluluk reddi</h2>
                            <p className="text-muted-foreground">
                                Platform "olduğu gibi" sunulmaktadır. Kullanıcı içeriklerinden ekşi sözlük
                                sorumlu değildir.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
