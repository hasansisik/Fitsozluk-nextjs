"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { server } from "@/config";

function FitmailCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get user data from URL params
                const email = searchParams.get("email");
                const name = searchParams.get("name");
                const token = searchParams.get("token"); // Fitmail token

                if (!email || !name || !token) {
                    console.error("Geçersiz callback parametreleri");
                    router.push("/giris");
                    return;
                }

                // Call Fitsozluk backend to create/login user
                const response = await fetch(
                    `${server}/auth/fitmail-auth`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ email, name }),
                    }
                );

                const data = await response.json();

                if (response.ok) {
                    // Store token in localStorage with correct key for Fitsozluk
                    localStorage.setItem("accessToken", data.user.token);
                    document.cookie = `token=${data.user.token}; path=/`;

                    // Create BroadcastChannel to notify parent
                    const authChannel = new BroadcastChannel("fitmail_auth_channel");
                    authChannel.postMessage({
                        type: "FITMAIL_AUTH_SUCCESS",
                        user: data.user
                    });

                    // Forcibly close the popup after a short delay
                    setTimeout(() => {
                        authChannel.close();
                        window.close();
                    }, 500);

                    return;
                } else {
                    console.error("Sunucu hatası:", data.message);
                    router.push("/giris");
                }
            } catch (error) {
                console.error("Kimlik doğrulama işlemi başarısız oldu:", error);
                router.push("/giris");
            } finally {
                setIsProcessing(false);
            }
        };

        handleCallback();
    }, [searchParams, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#4a0e70] border-t-transparent rounded-full animate-spin"></div>
                <h1 className="text-xl font-semibold">Giriş Yapılıyor...</h1>
                <p className="text-muted-foreground">Lütfen bekleyin, Fitmail ile kimliğiniz doğrulanıyor.</p>
            </div>
        </div>
    );
}

export default function FitmailCallbackPage() {
    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <FitmailCallbackContent />
        </Suspense>
    );
}
