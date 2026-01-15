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
                    dispatch(setAuthLoading(false));
                }
            } else {
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
