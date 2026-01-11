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
                    // Also set cookie if needed (Fitsozluk might use cookies too)
                    document.cookie = `token=${token}; path=/`;
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
                    document.cookie = `token=${token}; path=/`;
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

        // Calculate popup position (centered)
        const width = 500;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        // Open popup window
        window.open(
            authUrl,
            "FitmailAuth",
            `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
        );
    };

    return (
        <Button
            type="button"
            className={className || "w-full py-5 text-white border-none hover:opacity-90 transition-opacity flex items-center justify-center gap-3"}
            style={{ backgroundColor: "#ff6600" }}
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
