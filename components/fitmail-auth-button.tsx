"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { fitmailApiUrl } from "@/config";
import { useRouter } from "next/navigation";

interface FitmailAuthButtonProps {
    mode?: "login" | "register";
    className?: string;
}

export function FitmailAuthButton({ mode = "login", className }: FitmailAuthButtonProps) {
    const router = useRouter();

    useEffect(() => {
        // Initialize BroadcastChannel to listen for auth success from popup
        const authChannel = new BroadcastChannel("fitmail_auth_channel");

        const handleAuthMessage = (event: MessageEvent) => {
            if (event.data.type === "FITMAIL_AUTH_SUCCESS") {
                // Store token in main window's localStorage with correct key
                if (event.data.user && event.data.user.token) {
                    const token = event.data.user.token;
                    localStorage.setItem("accessToken", token);
                    // Set cookie for middleware with max-age
                    document.cookie = `token=${token}; path=/; max-age=${365 * 24 * 60 * 60}`;
                }

                authChannel.close();
                // Force a hard redirect to ensure state is refreshed
                window.location.href = "/";
            }
        };

        authChannel.onmessage = handleAuthMessage;

        // Also keep postMessage as fallback
        const handlePostMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            if (event.data.type === "FITMAIL_AUTH_SUCCESS") {
                if (event.data.user && event.data.user.token) {
                    const token = event.data.user.token;
                    localStorage.setItem("accessToken", token);
                    document.cookie = `token=${token}; path=/; max-age=${365 * 24 * 60 * 60}`;
                }
                window.location.href = "/";
            }
        };

        window.addEventListener("message", handlePostMessage);

        return () => {
            authChannel.close();
            window.removeEventListener("message", handlePostMessage);
        };
    }, []);

    const handleFitmailAuth = () => {
        const callbackUrl = encodeURIComponent(
            window.location.origin + `/auth/fitmail-callback`
        );
        const authUrl = `${fitmailApiUrl}?returnUrl=${callbackUrl}&source=fitsozluk`;

        // Calculate popup position (centered relative to current window)
        const width = 500;
        const height = 650;

        // Fix for dual-screen monitors
        const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
        const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

        const windowWidth = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        const windowHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

        const left = ((windowWidth / 2) - (width / 2)) + dualScreenLeft;
        const top = ((windowHeight / 2) - (height / 2)) + dualScreenTop;

        // Open window first
        const popup = window.open(
            "about:blank",
            "FitmailAuth",
            `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
        );

        if (popup) {
            // Inject a loading UI immediately to avoid any 404 flash
            popup.document.write(`
                <html>
                    <head>
                        <title>Yönlendiriliyorsunuz...</title>
                        <style>
                            body { 
                                margin: 0; 
                                display: flex; 
                                flex-direction: column; 
                                align-items: center; 
                                justify-content: center; 
                                min-h: 100vh; 
                                height: 100vh;
                                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                                background: white;
                            }
                            .loader {
                                border: 3px solid #f3f3f3;
                                border-top: 3px solid #ff6600;
                                border-radius: 50%;
                                width: 40px;
                                height: 40px;
                                animation: spin 1s linear infinite;
                                margin-bottom: 20px;
                            }
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                            .text {
                                color: #ff6600;
                                font-weight: 500;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="loader"></div>
                        <div class="text">Fitmail'e yönlendiriliyorsunuz...</div>
                    </body>
                </html>
            `);

            // Redirect after a tiny delay
            setTimeout(() => {
                popup.location.href = authUrl;
                popup.focus();
            }, 100);
        }
    };

    return (
        <Button
            type="button"
            className={className || "w-full py-5 text-white border-none hover:opacity-90 transition-opacity flex items-center justify-center gap-3"}
            style={{ backgroundColor: "#4a0e70" }}
            onClick={handleFitmailAuth}
        >
            <img
                src="/fitmaillogo.png"
                alt="Fitmail Logo"
                style={{ width: "24px", height: "24px", objectFit: "contain", filter: "brightness(0) invert(1)" }}
            />
            <span className="font-semibold ">Fitmail ile Devam Et</span>
        </Button>
    );
}
