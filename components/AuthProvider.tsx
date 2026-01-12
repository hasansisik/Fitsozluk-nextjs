'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hook';
import { verifyOAuthToken } from '@/redux/actions/userActions';
import { usePathname, useRouter } from 'next/navigation';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('accessToken');
            const silentSSOChecked = sessionStorage.getItem('silentSSOChecked');

            if (token) {
                // Verify token silently in background
                try {
                    await dispatch(verifyOAuthToken()).unwrap();
                } catch (error) {
                    // Token invalid, try silent SSO
                    if (!silentSSOChecked && !pathname?.includes('/auth/callback')) {
                        await trySilentSSO();
                    }
                }
            } else {
                // No token - try silent SSO
                if (!silentSSOChecked && !pathname?.includes('/auth/callback')) {
                    await trySilentSSO();
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
                localStorage.setItem('oauth_return_url', pathname || '/');

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

                // Silent redirect to Fitmail OAuth
                window.location.href = authUrl;

            } catch (error) {
                console.error('[Silent SSO] Error:', error);
            }
        };

        checkAuth();
    }, [dispatch, pathname, router]);

    // Render children immediately - no loading screen
    // Auth happens silently in background
    return <>{children}</>;
}
