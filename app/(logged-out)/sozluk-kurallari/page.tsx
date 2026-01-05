export default function SozlukKurallariPage() {
    return (
        <div className="w-full bg-white">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl font-bold text-foreground mb-6">sözlük kuralları</h1>

                    <div className="space-y-6 text-sm text-foreground">
                        <section>
                            <p className="mb-4 text-muted-foreground">
                                ekşi sözlük'te keyifli ve saygılı bir ortam oluşturmak için aşağıdaki kurallara
                                uymanızı rica ederiz.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mb-3">temel kurallar</h2>
                            <ul className="space-y-3 text-muted-foreground">
                                <li className="flex gap-2">
                                    <span className="text-[#4729ff] font-bold">1.</span>
                                    <span>Saygılı olun. Hakaret, küfür ve kişisel saldırılar yasaktır.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[#4729ff] font-bold">2.</span>
                                    <span>Spam yapmayın. Tekrarlayan veya anlamsız içerik paylaşmayın.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[#4729ff] font-bold">3.</span>
                                    <span>Telif haklarına saygı gösterin. Başkalarının içeriğini izinsiz kullanmayın.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[#4729ff] font-bold">4.</span>
                                    <span>Doğru bilgi paylaşın. Yanlış bilgi yaymaktan kaçının.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[#4729ff] font-bold">5.</span>
                                    <span>Gizliliğe saygı gösterin. Kişisel bilgileri paylaşmayın.</span>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mb-3">entry yazma kuralları</h2>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>• Entry'ler başlıkla ilgili olmalıdır</li>
                                <li>• Türkçe dil kurallarına dikkat edilmelidir</li>
                                <li>• Kaynak gösterilmesi önerilir</li>
                                <li>• Reklam içerikli entry'ler yasaktır</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mb-3">yaptırımlar</h2>
                            <p className="text-muted-foreground">
                                Kurallara uymayan kullanıcılara uyarı, entry silme, geçici veya kalıcı hesap
                                askıya alma gibi yaptırımlar uygulanabilir.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
