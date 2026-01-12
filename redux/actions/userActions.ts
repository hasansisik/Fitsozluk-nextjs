import axios, { AxiosError, AxiosResponse } from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { server } from "@/config";

// Add axios interceptor to suppress 404 errors in console
axios.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Suppress 404 errors from /auth/me endpoint in console
    if (error.response?.status === 404 && error.config?.url?.includes('/auth/me')) {
      // Don't log 404 errors for /auth/me endpoint
      return Promise.reject(error);
    }
    // Log other errors normally
    return Promise.reject(error);
  }
);

export interface RegisterPayload {
  nick: string;
  email: string;
  password: string;
  gender?: string;
  birthDate?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface GoogleLoginPayload {
  email: string;
  nick: string;
  googleId: string;
  birthDate?: string;
}

export interface VerifyEmailPayload {
  email: string;
  verificationCode: number;
}

export interface ResetPasswordPayload {
  email: string;
  passwordToken: number;
  newPassword: string;
}

export interface EditProfilePayload {
  nick: string;
  email: string;
  password?: string;
  gender?: string;
  birthDate?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  phoneNumber?: string;
  picture?: string;
  bio?: string;
  skills?: string[];
}

export interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
  page?: string;
  limit?: string;
  [key: string]: string | undefined;
}

export const register = createAsyncThunk(
  "user/register",
  async (payload: RegisterPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/register`, payload);
      localStorage.setItem("accessToken", data.user.token);
      // Set cookie for middleware
      document.cookie = `token=${data.user.token}; path=/; max-age=${365 * 24 * 60 * 60}`;
      return data.user;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const googleRegister = createAsyncThunk(
  "user/googleRegister",
  async (payload: GoogleLoginPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/google-register`, payload);
      localStorage.setItem("accessToken", data.user.token);
      // Set cookie for middleware
      document.cookie = `token=${data.user.token}; path=/; max-age=${365 * 24 * 60 * 60}`;
      return data.user;
    } catch (error: any) {
      // Handle inactive user case
      if (error.response?.status === 401 && error.response?.data?.message?.includes('pasif durumda')) {
        return thunkAPI.rejectWithValue({
          message: error.response.data.message,
          requiresLogout: true
        });
      }
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const login = createAsyncThunk(
  "user/login",
  async (payload: LoginPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/login`, payload);
      localStorage.setItem("accessToken", data.user.token);
      localStorage.setItem("userEmail", data.user.email);
      // Set cookie for middleware
      document.cookie = `token=${data.user.token}; path=/; max-age=${365 * 24 * 60 * 60}`;
      return data.user;
    } catch (error: any) {
      // Handle email verification required case
      if (error.response?.status === 403 && error.response?.data?.requiresVerification) {
        // Don't set this as an error, it's handled by redirect
        return thunkAPI.rejectWithValue({
          message: error.response.data.message,
          requiresVerification: true,
          email: error.response.data.email
        });
      }
      // Handle inactive user case
      if (error.response?.status === 401 && error.response?.data?.message?.includes('pasif durumda')) {
        return thunkAPI.rejectWithValue({
          message: error.response.data.message,
          requiresLogout: true
        });
      }
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const googleAuth = createAsyncThunk(
  "user/googleAuth",
  async (payload: GoogleLoginPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/google-auth`, payload);
      localStorage.setItem("accessToken", data.user.token);
      localStorage.setItem("userEmail", data.user.email);
      // Set cookie for middleware
      document.cookie = `token=${data.user.token}; path=/; max-age=${365 * 24 * 60 * 60}`;
      return data.user;
    } catch (error: any) {
      // Handle inactive user case
      if (error.response?.status === 401 && error.response?.data?.message?.includes('pasif durumda')) {
        return thunkAPI.rejectWithValue({
          message: error.response.data.message,
          requiresLogout: true
        });
      }
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const googleLogin = createAsyncThunk(
  "user/googleLogin",
  async (payload: GoogleLoginPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/google-login`, payload);
      localStorage.setItem("accessToken", data.user.token);
      localStorage.setItem("userEmail", data.user.email);
      // Set cookie for middleware
      document.cookie = `token=${data.user.token}; path=/; max-age=${365 * 24 * 60 * 60}`;
      return data.user;
    } catch (error: any) {
      // Handle inactive user case
      if (error.response?.status === 401 && error.response?.data?.message?.includes('pasif durumda')) {
        return thunkAPI.rejectWithValue({
          message: error.response.data.message,
          requiresLogout: true
        });
      }
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const loadUser = createAsyncThunk(
  "user/loadUser",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("No token found");
      }

      const { data } = await axios.get(`${server}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('loadUser - Full response:', data);
      console.log('loadUser - User object:', data.user);

      // Store user email for potential verification redirects
      if (data.user && data.user.email) {
        localStorage.setItem("userEmail", data.user.email);
      }
      // Set cookie for middleware if token exists
      if (token) {
        document.cookie = `token=${token}; path=/; max-age=${365 * 24 * 60 * 60}`;
      }
      return data.user;
    } catch (error: any) {
      // Handle 404 errors silently (user not found or invalid token)
      if (error.response?.status === 404) {
        // Clear invalid token and return silent error
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userEmail");
        return thunkAPI.rejectWithValue("User not found");
      }

      // Handle inactive user case - user gets kicked out
      if (error.response?.status === 401 && error.response?.data?.requiresLogout) {
        // Clear local storage and return special error
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userEmail");
        return thunkAPI.rejectWithValue({
          message: error.response.data.message,
          requiresLogout: true
        });
      }
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// OAuth SSO Actions
export const exchangeOAuthCode = createAsyncThunk(
  "user/exchangeOAuthCode",
  async (payload: { code: string }, thunkAPI) => {
    try {
      const { endpoints, oauthConfig } = await import('@/config');

      const { data } = await axios.post(endpoints.oauth.token, {
        grant_type: 'authorization_code',
        code: payload.code,
        redirect_uri: oauthConfig.redirectUri,
        client_id: oauthConfig.clientId,
        client_secret: oauthConfig.clientSecret
      });

      localStorage.setItem("accessToken", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      document.cookie = `token=${data.access_token}; path=/; max-age=${365 * 24 * 60 * 60}`;

      return { token: data.access_token, user: data.user };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const verifyOAuthToken = createAsyncThunk(
  "user/verifyOAuthToken",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No token found");
      }

      // Instead of just verifying with Fitmail, we call Fitsözlük's /auth/me
      // The Fitsözlük backend will verify the Fitmail token and return the Fitsözlük user object
      const { data } = await axios.get(`${server}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!data.user) {
        throw new Error("User not found in Fitsözlük");
      }

      const user = data.user;

      localStorage.setItem("user", JSON.stringify(user));
      document.cookie = `token=${token}; path=/; max-age=${365 * 24 * 60 * 60}`;

      return user;
    } catch (error: any) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Kimlik doğrulaması başarısız');
    }
  }
);

export const logout = createAsyncThunk("user/logout", async (_, thunkAPI) => {
  try {
    const token = localStorage.getItem("accessToken");
    const userStr = localStorage.getItem("user");
    const currentUser = userStr ? JSON.parse(userStr) : {};
    const { endpoints } = await import('@/config');

    // 1. Try to find another active session to switch to
    let nextSessionToken = null;
    try {
      if (token) {
        const { data } = await axios.get(endpoints.oauth.sessions, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (data && data.sessions && Array.isArray(data.sessions)) {
          const otherSessions = data.sessions.filter((s: any) =>
            s.email !== currentUser.email && s.email !== currentUser.userEmail
            && (!currentUser._id || s.userId !== currentUser._id)
          );

          if (otherSessions.length > 0) {
            nextSessionToken = otherSessions[0].accessToken;
          }
        }
      }
    } catch (e) {
      // Ignore session fetch errors
    }

    // 2. Call Fitmail logout endpoint to invalidate CURRENT token
    try {
      if (token && endpoints.oauth.logout) {
        await axios.post(endpoints.oauth.logout, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (e) {
      // Ignore network errors
    }

    // 3. Clear current session data
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    document.cookie = 'token=; Max-Age=0; path=/;';

    // 4. Switch to next session if available
    if (nextSessionToken) {
      localStorage.setItem("accessToken", nextSessionToken);
      window.location.reload();
      return "Switched account";
    }

    return "Logged out";
  } catch (error: any) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const logoutAllSessions = createAsyncThunk("user/logoutAll", async (_, thunkAPI) => {
  try {
    const token = localStorage.getItem("accessToken");
    const { endpoints } = await import('@/config');

    await axios.post(endpoints.oauth.logoutAll, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    document.cookie = 'token=; Max-Age=0; path=/;';

    return "All sessions logged out";
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const verifyEmail = createAsyncThunk(
  "user/verifyEmail",
  async (payload: VerifyEmailPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/verify-email`, payload);

      return {
        message: data.message
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const againEmail = createAsyncThunk(
  "user/againEmail",
  async (email: string, thunkAPI) => {
    try {
      await axios.post(`${server}/auth/again-email`, { email });
      return;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "user/forgotPassword",
  async (email: string, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/forgot-password`, { email });
      return data.message;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  "user/resetPassword",
  async (payload: ResetPasswordPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/reset-password`, payload);
      return data.message;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const editProfile = createAsyncThunk(
  "user/editProfile",
  async (formData: EditProfilePayload, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(
        `${server}/auth/edit-profile`,
        formData,
        config
      );
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// User Management Actions (Admin only)
export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (params: Record<string, string> = {}, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const queryString = new URLSearchParams(params).toString();
      const url = `${server}/auth/users${queryString ? `?${queryString}` : ''}`;
      const response = await axios.get(url, config);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (id: string, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.delete(
        `${server}/auth/users/${id}`,
        config
      );
      return { id, message: response.data.message };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const updateUserRole = createAsyncThunk(
  "user/updateUserRole",
  async ({ id, role }: { id: string; role: string }, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.patch(
        `${server}/auth/users/${id}/role`,
        { role },
        config
      );
      return { id, role, message: response.data.message };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  "user/updateUserStatus",
  async ({ id, status }: { id: string; status: string }, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.patch(
        `${server}/auth/users/${id}/status`,
        { status },
        config
      );
      return { id, status, message: response.data.message };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const updateUserTitle = createAsyncThunk(
  "user/updateUserTitle",
  async ({ id, title }: { id: string; title: string }, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.patch(
        `${server}/auth/users/${id}/title`,
        { title },
        config
      );
      return { id, title, message: response.data.message };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const followUser = createAsyncThunk(
  "user/followUser",
  async (id: string, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(`${server}/auth/users/${id}/follow`, {}, config);
      return { id, message: response.data.message };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const unfollowUser = createAsyncThunk(
  "user/unfollowUser",
  async (id: string, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(`${server}/auth/users/${id}/unfollow`, {}, config);
      return { id, message: response.data.message };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getFollowers = createAsyncThunk(
  "user/getFollowers",
  async (id: string, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = token ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      } : {};
      const { data } = await axios.get(`${server}/auth/users/${id}/followers`, config);
      return data.followers;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getFollowing = createAsyncThunk(
  "user/getFollowing",
  async (id: string, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = token ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      } : {};
      const { data } = await axios.get(`${server}/auth/users/${id}/following`, config);
      return data.following;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get User By Nick (Public)
export const getUserByNick = createAsyncThunk(
  "user/getUserByNick",
  async (nick: string, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = token ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      } : {};
      const { data } = await axios.get(`${server}/auth/users/${nick}`, config);
      return data.user;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Search Users (Public)
export const searchUsers = createAsyncThunk(
  "user/searchUsers",
  async (params: { search: string; limit?: number }, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = token ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      } : {};

      const { data } = await axios.get(
        `${server}/auth/search-users?search=${params.search}&limit=${params.limit || 5}`,
        config
      );
      return data.users;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Clear Error Action
export const clearError = createAsyncThunk(
  "user/clearError",
  async () => {
    return null;
  }
);


export const blockUser = createAsyncThunk(
  "user/blockUser",
  async (id: string, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(`${server}/auth/users/${id}/block`, {}, config);
      return { id, message: response.data.message };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const unblockUser = createAsyncThunk(
  "user/unblockUser",
  async (id: string, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(`${server}/auth/users/${id}/unblock`, {}, config);
      return { id, message: response.data.message };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getBlockedUsers = createAsyncThunk(
  "user/getBlockedUsers",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get(`${server}/auth/blocked-users`, config);
      return data.blockedUsers;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
