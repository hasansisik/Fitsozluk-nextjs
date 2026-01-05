export default function GizlilikPolitikasiPage() {
    return (
        <div className="w-full bg-white">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl font-bold text-foreground mb-6">gizlilik politikamız</h1>

                    <div className="space-y-6 text-sm text-foreground">
                        <section>
                            <p className="mb-4 text-muted-foreground">
                                Son güncelleme: 17 Aralık 2025
                            </p>
                            <p className="text-muted-foreground">
                                ekşi sözlük olarak gizliliğinize önem veriyoruz. Bu politika, kişisel
                                verilerinizi nasıl topladığımızı ve kullandığımızı açıklar.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mb-3">1. toplanan bilgiler</h2>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>• Hesap bilgileri (kullanıcı adı, e-posta, şifre)</li>
                                <li>• Profil bilgileri (biyografi, doğum tarihi)</li>
                                <li>• Yazdığınız entry'ler ve yorumlar</li>
                                <li>• IP adresi ve tarayıcı bilgileri</li>
                                <li>• Çerezler (cookies)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mb-3">2. bilgilerin kullanımı</h2>
                            <p className="text-muted-foreground mb-2">
                                Topladığımız bilgileri şu amaçlarla kullanırız:
                            </p>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>• Hizmet sunmak ve geliştirmek</li>
                                <li>• Kullanıcı deneyimini iyileştirmek</li>
                                <li>• Güvenlik sağlamak</li>
                                <li>• İstatistik ve analiz yapmak</li>
                                <li>• Yasal yükümlülükleri yerine getirmek</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mb-3">3. bilgi paylaşımı</h2>
                            <p className="text-muted-foreground">
                                Kişisel bilgilerinizi üçüncü taraflarla paylaşmayız. Ancak yasal zorunluluklar
                                veya güvenlik nedenleriyle paylaşım gerekebilir.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mb-3">4. çerezler</h2>
                            <p className="text-muted-foreground">
                                Sitemizde çerezler kullanılmaktadır. Çerezleri tarayıcı ayarlarınızdan
                                yönetebilirsiniz.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mb-3">5. haklarınız</h2>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>• Verilerinize erişim hakkı</li>
                                <li>• Verilerin düzeltilmesini isteme hakkı</li>
                                <li>• Verilerin silinmesini isteme hakkı</li>
                                <li>• Veri işlemeye itiraz etme hakkı</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mb-3">6. iletişim</h2>
                            <p className="text-muted-foreground">
                                Gizlilik politikamız hakkında sorularınız için: gizlilik@eksisozluk.com
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
