export const server = process.env.NEXT_PUBLIC_API_URL || "https://fitsozluk-d52022de8511.herokuapp.com/v1";
export const fitmailApiUrl = process.env.NEXT_PUBLIC_FITMAIL_API_URL || "https://api.fitmail.com";

// OAuth Configuration
export const oauthConfig = {
    clientId: 'fitsozluk_client',
    clientSecret: 'ffec047691e8e61f22f2b46b295ae108549adf59b2160ad908a3fb8c5d809bf5',
    redirectUri: typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : 'https://fitsozluk.vercel.app/auth/callback',
    scope: 'profile email'
};

// API Endpoints
export const endpoints = {
    oauth: {
        authorize: `${fitmailApiUrl}/v1/oauth/authorize`,
        token: `${fitmailApiUrl}/v1/oauth/token`,
        verify: `${fitmailApiUrl}/v1/oauth/verify`,
        userinfo: `${fitmailApiUrl}/v1/oauth/userinfo`,
        sessions: `${fitmailApiUrl}/v1/oauth/sessions`,
        logout: `${fitmailApiUrl}/v1/oauth/logout`,
        logoutAll: `${fitmailApiUrl}/v1/oauth/logout-all`
    }
};
