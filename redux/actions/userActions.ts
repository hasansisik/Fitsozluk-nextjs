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
  password: string;
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
  theme?: string;
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

export const logout = createAsyncThunk("user/logout", async (_, thunkAPI) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const { data } = await axios.get(`${server}/auth/logout`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userEmail");
        return data.message;
      } catch (apiError: any) {
        // Even if API call fails, clear local storage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userEmail");
        // Return success message to allow logout to proceed
        return "Çıkış yapıldı";
      }
    } else {
      // No token, just clear local storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userEmail");
      return "Çıkış yapıldı";
    }
  } catch (error: any) {
    // Clear local storage even on error
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userEmail");
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Çıkış yapılırken bir hata oluştu");
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

// Update Theme Action - Ultra optimized for instant UI updates
export const updateTheme = createAsyncThunk(
  "user/updateTheme",
  async (theme: string, thunkAPI) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return { theme }; // Return theme even if no token
    }

    // Fire and forget - don't wait for response
    axios.post(
      `${server}/auth/edit-profile`,
      { theme },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: 3000, // 3 second timeout
      }
    ).catch((error: AxiosError) => {
      // Silent fail for theme updates
    });

    // Return immediately
    return { theme };
  }
);

// Clear Error Action
export const clearError = createAsyncThunk(
  "user/clearError",
  async () => {
    return null;
  }
);

