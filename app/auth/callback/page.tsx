'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader } from 'lucide-react';
import { useAppDispatch } from '@/redux/hook';
import { exchangeOAuthCode } from '@/redux/actions/userActions';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                console.log('[Callback] Starting callback handler...');
                const code = searchParams.get('code');
                const state = searchParams.get('state');
                const error = searchParams.get('error');

                console.log('[Callback] URL params:', {
                    hasCode: !!code,
                    hasState: !!state,
                    hasError: !!error,
                    code: code?.substring(0, 10) + '...',
                    state
                });

                // Check for OAuth errors
                if (error) {
                    console.error('[Callback] OAuth error:', error);
                    const isIframe = typeof window !== 'undefined' && window.self !== window.top;

                    if (isIframe) {
                        // Just stop here if in iframe
                        return;
                    }

                    setStatus('error');
                    setTimeout(() => router.push('/'), 500);
                    return;
                }

                // Validate state (CSRF protection)
                const savedState = localStorage.getItem('oauth_state');
                console.log('[Callback] State validation:', {
                    receivedState: state,
                    savedState,
                    matches: state === savedState
                });

                if (!code || !state || state !== savedState) {
                    console.error('[Callback] Validation failed!');
                    setStatus('error');
                    setTimeout(() => router.push('/'), 500);
                    return;
                }

                // Clear state
                localStorage.removeItem('oauth_state');

                // Reconstruct the redirect_uri that was used during authorization
                // This MUST match exactly what was sent to /oauth/authorize
                const displayParam = searchParams.get('display');
                const baseUrl = `${window.location.origin}${window.location.pathname}`;
                const redirectUri = displayParam ? `${baseUrl}?display=${displayParam}` : baseUrl;
                console.log('[Callback] Reconstructed redirect_uri:', redirectUri);

                // Exchange code for token using Redux action
                console.log('[Callback] Calling exchangeOAuthCode...');
                const result = await dispatch(exchangeOAuthCode({ code, redirectUri })).unwrap();
                console.log('[Callback] exchangeOAuthCode completed:', {
                    hasToken: !!result.token,
                    hasUser: !!result.user
                });

                setStatus('success');

                // Check if we're in a popup or iframe
                // Use display=popup parameter as primary indicator since window.opener
                // may be lost during cross-origin navigation to Fitmail
                // displayParam already defined above when reconstructing redirectUri
                const isPopup = displayParam === 'popup' || window.opener || window.name === 'FitmailAuth';
                const isIframe = typeof window !== 'undefined' && window.self !== window.top;

                console.log('[Callback] Debug info:', {
                    displayParam,
                    hasOpener: !!window.opener,
                    windowName: window.name,
                    isPopup,
                    isIframe,
                    origin: window.location.origin
                });

                // Send success message via BroadcastChannel
                const authChannel = new BroadcastChannel("fitmail_auth_channel");
                authChannel.postMessage({
                    type: "FITMAIL_AUTH_SUCCESS",
                    user: {
                        ...result.user,
                        token: result.token // Include the access token
                    }
                });

                // If in a popup, notify the opener and close immediately
                if (isPopup) {
                    console.log('[Callback] Detected popup, sending message and closing...');

                    if (window.opener && !window.opener.closed) {
                        window.opener.postMessage(
                            {
                                type: "FITMAIL_AUTH_SUCCESS",
                                user: {
                                    ...result.user,
                                    token: result.token // Include the access token
                                }
                            },
                            window.location.origin
                        );
                        console.log('[Callback] Message sent to opener');
                    }

                    // Close popup after sending message
                    console.log('[Callback] Attempting to close window...');
                    console.log('[Callback] Waiting 500ms to ensure message delivery...');
                    setTimeout(() => {
                        authChannel.close();
                        window.close();
                        console.log('[Callback] window.close() called');

                        // If still open after 500ms, show success message
                        setTimeout(() => {
                            if (!window.closed) {
                                console.log('[Callback] Window still open, showing success message...');
                                document.body.innerHTML = `
                                    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; background: #f5f5f5;">
                                        <div style="text-align: center;">
                                            <div style="font-size: 48px; margin-bottom: 20px;">✓</div>
                                            <div style="font-size: 18px; color: #16a34a; font-weight: 500;">Giriş başarılı!</div>
                                            <div style="font-size: 14px; color: #666; margin-top: 10px;">Bu pencereyi kapatabilirsiniz.</div>
                                        </div>
                                    </div>
                                `;
                            }
                        }, 500);
                    }, 500); // Increased from 100ms to 500ms to ensure message delivery
                    return;
                }

                // If in iframe, just notify and stop
                if (isIframe) {
                    window.parent.postMessage({
                        type: "FITMAIL_AUTH_SUCCESS",
                        user: {
                            ...result.user,
                            token: result.token
                        }
                    }, window.location.origin);

                    return;
                }

                // Only redirect if NOT in popup or iframe (same-window auth)
                const returnUrl = localStorage.getItem('oauth_return_url') || '/';
                localStorage.removeItem('oauth_return_url');
                setTimeout(() => router.push(returnUrl), 0);

            } catch (error: any) {
                console.error('Callback error:', error);

                const authChannel = new BroadcastChannel("fitmail_auth_channel");
                authChannel.postMessage({
                    type: "FITMAIL_AUTH_ERROR",
                    error: error.message || "Giriş başarısız"
                });

                if (window.opener) {
                    setTimeout(() => {
                        authChannel.close();
                        window.close();
                    }, 1000);
                    return;
                }

                if (typeof window !== 'undefined' && window.self !== window.top) {
                    return;
                }

                setStatus('error');
                setTimeout(() => router.push('/'), 500);
            }
        };

        handleCallback();
    }, [searchParams, router, dispatch]);

    return (
        <div className="flex justify-center items-start pt-20 min-h-[50vh]">
            {status === 'processing' && (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Oturum açılıyor...</span>
                </div>
            )}
        </div>
    );
}

export default function CallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                <Loader className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        }>
            <CallbackContent />
        </Suspense>
    );
}
