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
                const code = searchParams.get('code');
                const state = searchParams.get('state');
                const error = searchParams.get('error');

                // Check for OAuth errors
                if (error) {
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
                if (!code || !state || state !== savedState) {
                    setStatus('error');
                    setTimeout(() => router.push('/'), 500);
                    return;
                }

                // Clear state
                localStorage.removeItem('oauth_state');

                // Exchange code for token using Redux action
                const result = await dispatch(exchangeOAuthCode({ code })).unwrap();

                setStatus('success');

                // If in a popup, notify the opener and close
                const authChannel = new BroadcastChannel("fitmail_auth_channel");
                authChannel.postMessage({
                    type: "FITMAIL_AUTH_SUCCESS",
                    user: {
                        ...result.user,
                        token: result.token // Include the access token
                    }
                });

                if (window.opener) {
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

                    setTimeout(() => {
                        authChannel.close();
                        window.close();
                    }, 500);
                    return;
                }

                // If in iframe, just notify and stop
                if (typeof window !== 'undefined' && window.self !== window.top) {
                    // postMessage to parent
                    window.parent.postMessage({
                        type: "FITMAIL_AUTH_SUCCESS",
                        user: {
                            ...result.user,
                            token: result.token
                        }
                    }, window.location.origin);

                    return;
                }

                // Redirect to saved return URL or home (for same-windowauth)
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
