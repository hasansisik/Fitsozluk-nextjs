"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/redux/hook";
import { useToast } from "@/components/ui/use-toast";
import { Loader } from "lucide-react";
import { Suspense } from "react";
import { server } from "@/config";

function FitmailCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get user data from URL params
                const email = searchParams.get("email");
                const name = searchParams.get("name");
                const token = searchParams.get("token");

                if (!email || !name || !token) {
                    // If in popup, notify parent
                    if (window.opener) {
                        window.opener.postMessage(
                            {
                                type: "FITMAIL_AUTH_ERROR",
                                error: "Geçersiz callback parametreleri"
                            },
                            window.location.origin
                        );
                        window.close();
                        return;
                    }

                    toast({
                        title: "Hata",
                        description: "Geçersiz callback parametreleri",
                        variant: "destructive",
                    });
                    router.push("/auth/login");
                    return;
                }

                // Call Fitnews backend to create/login user
                const response = await fetch(
                    `${server}/auth/fitmail-auth`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ email, name }),
                        credentials: "include",
                    }
                );

                const data = await response.json();

                if (response.ok) {
                    // Store token in localStorage with correct key for this project
                    localStorage.setItem("accessToken", data.user.token);
                    document.cookie = `token=${data.user.token}; path=/`;

                    // Create BroadcastChannel to notify parent
                    const authChannel = new BroadcastChannel("fitmail_auth_channel");
                    authChannel.postMessage({
                        type: "FITMAIL_AUTH_SUCCESS",
                        user: data.user
                    });

                    // Fallback to postMessage
                    if (window.opener) {
                        window.opener.postMessage(
                            {
                                type: "FITMAIL_AUTH_SUCCESS",
                                user: data.user
                            },
                            window.location.origin
                        );
                    }

                    // Forcibly close the popup after a short delay to ensure message delivery
                    setTimeout(() => {
                        authChannel.close();
                        window.close();
                    }, 500);

                    return;
                } else {
                    // Notify error
                    const authChannel = new BroadcastChannel("fitmail_auth_channel");
                    authChannel.postMessage({
                        type: "FITMAIL_AUTH_ERROR",
                        error: data.message || "Giriş başarısız"
                    });

                    if (window.opener) {
                        window.opener.postMessage(
                            {
                                type: "FITMAIL_AUTH_ERROR",
                                error: data.message || "Giriş başarısız"
                            },
                            window.location.origin
                        );
                    }

                    setTimeout(() => {
                        authChannel.close();
                        window.close();
                    }, 500);
                    return;
                }
            } catch (error) {
                console.error("Callback error:", error);

                // If in popup, notify parent
                if (window.opener) {
                    window.opener.postMessage(
                        {
                            type: "FITMAIL_AUTH_ERROR",
                            error: "Bir hata oluştu"
                        },
                        window.location.origin
                    );
                    window.close();
                    return;
                }

                toast({
                    title: "Hata",
                    description: "Bir hata oluştu",
                    variant: "destructive",
                });
                router.push("/auth/login");
            } finally {
                setIsProcessing(false);
            }
        };

        handleCallback();
    }, [searchParams, router, dispatch, toast]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-lg">Fitmail ile giriş yapılıyor...</p>
            </div>
        </div>
    );
}

export default function FitmailCallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                <Loader className="h-8 w-8 animate-spin" />
            </div>
        }>
            <FitmailCallbackContent />
        </Suspense>
    );
}
