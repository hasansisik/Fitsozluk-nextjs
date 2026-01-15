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

            console.log('[AuthProvider] Checking auth...', { hasToken: !!token });

            // Explicitly set loading state for background check
            dispatch(setAuthLoading(true));

            if (token) {
                // Verify token silently in background
                console.log('[AuthProvider] Token found, verifying...');
                try {
                    await dispatch(verifyOAuthToken()).unwrap();
                    console.log('[AuthProvider] Token verified successfully');
                } catch (error) {
                    console.error('[AuthProvider] Token verification failed:', error);
                    dispatch(setAuthLoading(false));
                }
            } else {
                console.log('[AuthProvider] No token found');
                dispatch(setAuthLoading(false));
            }
        };

        // Listen for successful auth from iframe or popup
        const authChannel = new BroadcastChannel("fitmail_auth_channel");
        authChannel.onmessage = (event) => {
            console.log('[AuthProvider] BroadcastChannel message:', event.data);
            if (event.data.type === "FITMAIL_AUTH_SUCCESS") {
                // Token is already stored by the callback page
                // We just need to reload the user data
                console.log('[AuthProvider] Auth success, verifying token...');
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
