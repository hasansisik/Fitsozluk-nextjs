'use client';

import { useEffect } from 'react';

export default function GirisPage() {
  useEffect(() => {
    // Redirect to Fitmail OAuth
    const initiateOAuth = async () => {
      const { endpoints, oauthConfig } = await import('@/config');

      const state = Math.random().toString(36).substring(7);
      localStorage.setItem('oauth_state', state);
      localStorage.setItem('oauth_return_url', '/');

      const params = new URLSearchParams({
        client_id: oauthConfig.clientId,
        redirect_uri: oauthConfig.redirectUri,
        response_type: 'code',
        scope: oauthConfig.scope,
        state: state
      });

      window.location.href = `${endpoints.oauth.authorize}?${params}`;
    };

    initiateOAuth();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Fitmail'e yönlendiriliyorsunuz...</p>
      </div>
    </div>
  );
}
