'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hook';
import { verifyOAuthToken, setAuthLoading } from '@/redux/actions/userActions';
import { usePathname, useRouter } from 'next/navigation';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('accessToken');
            const silentSSOChecked = sessionStorage.getItem('silentSSOChecked');

            // Explicitly set loading state for background check
            dispatch(setAuthLoading(true));

            if (token) {
                // Verify token silently in background
                try {
                    await dispatch(verifyOAuthToken()).unwrap();
                } catch (error) {
                    // Token invalid, try silent SSO
                    if (!silentSSOChecked && !pathname?.includes('/auth/callback')) {
                        await trySilentSSO();
                    } else {
                        dispatch(setAuthLoading(false));
                    }
                }
            } else {
                // No token - try silent SSO
                if (!silentSSOChecked && !pathname?.includes('/auth/callback')) {
                    await trySilentSSO();
                } else {
                    dispatch(setAuthLoading(false));
                }
            }
        };

        const trySilentSSO = async () => {
            try {
                // Mark that we've attempted silent SSO this session
                sessionStorage.setItem('silentSSOChecked', 'true');

                // Generate state for CSRF protection
                const state = Math.random().toString(36).substring(7);
                localStorage.setItem('oauth_state', state);

                // Import config
                const { endpoints, oauthConfig } = await import('@/config');

                // Build OAuth URL with prompt=none for silent authentication
                const params = new URLSearchParams({
                    client_id: oauthConfig.clientId,
                    redirect_uri: oauthConfig.redirectUri,
                    response_type: 'code',
                    scope: oauthConfig.scope,
                    state: state,
                    prompt: 'none' // Silent mode - don't show login UI
                });

                const authUrl = `${endpoints.oauth.authorize}?${params}`;

                // Create hidden iframe for background check
                const iframe = document.createElement('iframe');
                iframe.id = 'silent-sso-iframe';
                iframe.style.display = 'none';
                iframe.src = authUrl;
                document.body.appendChild(iframe);

                // Cleanup iframe and stop loading after some time
                setTimeout(() => {
                    const el = document.getElementById('silent-sso-iframe');
                    if (el) el.remove();
                    dispatch(setAuthLoading(false));
                }, 10000); // 10 seconds timeout for silent SSO check

            } catch (error) {
                console.error('[Silent SSO] Error:', error);
                dispatch(setAuthLoading(false));
            }
        };

        // Listen for successful auth from iframe or popup
        const authChannel = new BroadcastChannel("fitmail_auth_channel");
        authChannel.onmessage = (event) => {
            if (event.data.type === "FITMAIL_AUTH_SUCCESS") {
                // Token is already stored by the callback page
                // We just need to reload the user data
                dispatch(verifyOAuthToken());
            }
        };

        checkAuth();

        return () => {
            authChannel.close();
        };
    }, [dispatch]);

    // Render children immediately - no loading screen
    // Auth happens silently in background
    return <>{children}</>;
}
