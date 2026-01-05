import { createReducer } from "@reduxjs/toolkit";
import {
  register,
  googleRegister,
  googleAuth,
  login,
  googleLogin,
  loadUser,
  logout,
  verifyEmail,
  againEmail,
  forgotPassword,
  resetPassword,
  editProfile,
  getAllUsers,
  deleteUser,
  updateUserRole,
  updateTheme,
  clearError,
} from "../actions/userActions";

interface UserState {
  users: any[];
  user: any;
  loading: boolean;
  error: string | null;
  isAuthenticated?: boolean;
  isVerified?: boolean;
  message?: string | null;
  allUsers: any[];
  userStats: any;
  usersLoading: boolean;
  usersError: string | null;
}

const initialState: UserState = {
  users: [],
  user: {},
  loading: false,
  error: null,
  allUsers: [],
  userStats: null,
  usersLoading: false,
  usersError: null,
};

export const userReducer = createReducer(initialState, (builder) => {
  builder
    // Register
    .addCase(register.pending, (state) => {
      state.loading = true;
    })
    .addCase(register.fulfilled, (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.isVerified = false; // User needs to verify email
      state.message = null;
      state.error = null;
    })
    .addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Google Register
    .addCase(googleRegister.pending, (state) => {
      state.loading = true;
    })
    .addCase(googleRegister.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.message = null;
      state.error = null;
    })
    .addCase(googleRegister.rejected, (state, action) => {
      state.loading = false;
      // Handle inactive user case
      if (action.payload && typeof action.payload === 'object' && 'requiresLogout' in action.payload) {
        state.isAuthenticated = false;
        state.isVerified = false;
        state.user = null;
        state.error = (action.payload as any).message;
      } else {
        state.error = action.payload as string;
      }
    })
    // Google Auth (Unified)
    .addCase(googleAuth.pending, (state) => {
      state.loading = true;
    })
    .addCase(googleAuth.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.message = null;
      state.error = null;
    })
    .addCase(googleAuth.rejected, (state, action) => {
      state.loading = false;
      // Handle inactive user case
      if (action.payload && typeof action.payload === 'object' && 'requiresLogout' in action.payload) {
        state.isAuthenticated = false;
        state.isVerified = false;
        state.user = null;
        state.error = (action.payload as any).message;
      } else {
        state.error = action.payload as string;
      }
    })
    // Login
    .addCase(login.pending, (state) => {
      state.loading = true;
    })
    .addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.isVerified = true; // Login successful means user is verified
      state.user = action.payload;
    })
    .addCase(login.rejected, (state, action) => {
      state.loading = false;
      // Handle inactive user case
      if (action.payload && typeof action.payload === 'object' && 'requiresLogout' in action.payload) {
        state.isAuthenticated = false;
        state.isVerified = false;
        state.user = null;
        state.error = (action.payload as any).message;
      } else {
        state.error = action.payload as string;
      }
    })
    // Google Login
    .addCase(googleLogin.pending, (state) => {
      state.loading = true;
    })
    .addCase(googleLogin.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    })
    .addCase(googleLogin.rejected, (state, action) => {
      state.loading = false;
      // Handle inactive user case
      if (action.payload && typeof action.payload === 'object' && 'requiresLogout' in action.payload) {
        state.isAuthenticated = false;
        state.isVerified = false;
        state.user = null;
        state.error = (action.payload as any).message;
      } else {
        state.error = action.payload as string;
      }
    })
    // Load User
    .addCase(loadUser.pending, (state) => {
      state.loading = true;
    })
    .addCase(loadUser.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.isVerified = action.payload.isVerified; // Use actual verification status from backend
      state.user = action.payload;
    })
    .addCase(loadUser.rejected, (state, action) => {
      state.loading = false;
      // Handle inactive user case - user gets kicked out
      if (action.payload && typeof action.payload === 'object' && 'requiresLogout' in action.payload) {
        state.isAuthenticated = false;
        state.isVerified = false;
        state.user = null;
        state.error = (action.payload as any).message;
      } else {
        state.error = action.payload as string;
      }
    })
    // Logout
    .addCase(logout.pending, (state) => {
      state.loading = true;
    })
    .addCase(logout.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.isVerified = false;
      state.user = null;
      state.message = action.payload;
    })
    .addCase(logout.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Verify Email
    .addCase(verifyEmail.pending, (state) => {
      state.loading = true;
    })
    .addCase(verifyEmail.fulfilled, (state, action) => {
      state.loading = false;
      state.isVerified = true;
      state.isAuthenticated = false; // User still needs to login after verification
      state.message = action.payload.message;
    })
    .addCase(verifyEmail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Again Email
    .addCase(againEmail.pending, (state) => {
      state.loading = true;
    })
    .addCase(againEmail.fulfilled, (state) => {
      state.loading = false;
      state.message = "E-posta başarıyla tekrar gönderildi.";
    })
    .addCase(againEmail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Forgot Password
    .addCase(forgotPassword.pending, (state) => {
      state.loading = true;
    })
    .addCase(forgotPassword.fulfilled, (state) => {
      state.loading = false;
      state.message = "Şifre sıfırlama e-postası gönderildi.";
    })
    .addCase(forgotPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Reset Password
    .addCase(resetPassword.pending, (state) => {
      state.loading = true;
    })
    .addCase(resetPassword.fulfilled, (state) => {
      state.loading = false;
      state.message = "Şifre başarıyla sıfırlandı.";
    })
    .addCase(resetPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Edit Profile
    .addCase(editProfile.pending, (state) => {
      state.loading = true;
    })
    .addCase(editProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    })
    .addCase(editProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Get All Users
    .addCase(getAllUsers.pending, (state) => {
      state.usersLoading = true;
    })
    .addCase(getAllUsers.fulfilled, (state, action) => {
      state.usersLoading = false;
      state.allUsers = action.payload.users;
      state.userStats = action.payload.stats;
      state.message = action.payload.message;
    })
    .addCase(getAllUsers.rejected, (state, action) => {
      state.usersLoading = false;
      state.usersError = action.payload as string;
    })
    // Delete User
    .addCase(deleteUser.pending, (state) => {
      state.usersLoading = true;
    })
    .addCase(deleteUser.fulfilled, (state, action) => {
      state.usersLoading = false;
      state.allUsers = state.allUsers.filter(user => user._id !== action.payload.id);
      state.message = action.payload.message;
    })
    .addCase(deleteUser.rejected, (state, action) => {
      state.usersLoading = false;
      state.usersError = action.payload as string;
    })
    // Update User Role
    .addCase(updateUserRole.pending, (state) => {
      state.usersLoading = true;
    })
    .addCase(updateUserRole.fulfilled, (state, action) => {
      state.usersLoading = false;
      const index = state.allUsers.findIndex(user => user._id === action.payload.id);
      if (index !== -1) {
        state.allUsers[index].role = action.payload.role;
      }
      state.message = action.payload.message;
    })
    .addCase(updateUserRole.rejected, (state, action) => {
      state.usersLoading = false;
      state.usersError = action.payload as string;
    })
    // Update Theme - No loading state for instant UI updates
    .addCase(updateTheme.pending, (state) => {
      // No loading state - theme changes instantly
    })
    .addCase(updateTheme.fulfilled, (state, action) => {
      // Update user theme silently
      if (state.user) {
        state.user.theme = action.payload.theme;
      }
    })
    .addCase(updateTheme.rejected, (state, action) => {
      // Silent fail - don't show error to user
    })
    // Clear Error
    .addCase(clearError.fulfilled, (state) => {
      state.error = null;
      state.message = null;
      state.usersError = null;
    });
});

export default userReducer;