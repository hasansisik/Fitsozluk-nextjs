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
  updateUserStatus,
  updateUserTitle,
  clearError,
  followUser,
  unfollowUser,
  blockUser,
  unblockUser,
  verifyOAuthToken,
  exchangeOAuthCode,
  logoutAllSessions,
  setAuthLoading
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
  user: null, // Changed from {} to null
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
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload as string;
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
      state.user = action.payload.user;
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
    // Update User Status
    .addCase(updateUserStatus.pending, (state) => {
      state.usersLoading = true;
    })
    .addCase(updateUserStatus.fulfilled, (state, action) => {
      state.usersLoading = false;
      const index = state.allUsers.findIndex(user => user._id === action.payload.id);
      if (index !== -1) {
        state.allUsers[index].status = action.payload.status;
      }
      state.message = action.payload.message;
    })
    .addCase(updateUserStatus.rejected, (state, action) => {
      state.usersLoading = false;
      state.usersError = action.payload as string;
    })
    // Update User Title
    .addCase(updateUserTitle.pending, (state) => {
      state.usersLoading = true;
    })
    .addCase(updateUserTitle.fulfilled, (state, action) => {
      state.usersLoading = false;
      const index = state.allUsers.findIndex(user => user._id === action.payload.id);
      if (index !== -1) {
        state.allUsers[index].title = action.payload.title;
      }
      state.message = action.payload.message;
    })
    .addCase(updateUserTitle.rejected, (state, action) => {
      state.usersLoading = false;
      state.usersError = action.payload as string;
    })
    // Follow User
    .addCase(followUser.fulfilled, (state, action) => {
      if (state.user && state.user.following) {
        state.user.following.push(action.payload.id);
      }
    })
    // Unfollow User
    .addCase(unfollowUser.fulfilled, (state, action) => {
      if (state.user && state.user.following) {
        state.user.following = state.user.following.filter((id: string) => id !== action.payload.id);
      }
    })
    // Block User
    .addCase(blockUser.fulfilled, (state, action) => {
      if (state.user) {
        // Initialize if not exists
        if (!state.user.blockedUsers) state.user.blockedUsers = [];

        // Add to blockedUsers if not already there (though backend handles duplicates, frontend state should too)
        // Check if we have objects or IDs. If objects, we might just push the ID for now or reload.
        // Since we don't have the full user object in payload, just pushing ID might be risky if we expect objects.
        // Safest is to rely on loadUser which we trigger, BUT for immediate feedback:
        // Actually, let's just push the ID. The interface expects objects but `any` allows anything.
        // However, the Settings page will loop over blockedUsers. If some are IDs and some are objects, it breaks.
        // BETTER STRATEGY: Do nothing here, rely on loadUser dispatch from the component, OR
        // push a dummy object?
        // Let's NOT update state here since we don't have the full user object to push to blockedUsers array.
        // But we DO need to remove from following.
        if (state.user.following) {
          state.user.following = state.user.following.filter((id: string) => id !== action.payload.id);
        }
      }
    })
    // Unblock User
    .addCase(unblockUser.fulfilled, (state, action) => {
      if (state.user && state.user.blockedUsers) {
        state.user.blockedUsers = state.user.blockedUsers.filter((u: any) =>
          (typeof u === 'string' ? u : u._id) !== action.payload.id
        );
      }
    })
    // OAuth SSO Actions
    .addCase(verifyOAuthToken.pending, (state) => {
      state.loading = true;
    })
    .addCase(verifyOAuthToken.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.isVerified = true;
      state.user = action.payload;
    })
    .addCase(verifyOAuthToken.rejected, (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
    })
    .addCase(exchangeOAuthCode.pending, (state) => {
      state.loading = true;
    })
    .addCase(exchangeOAuthCode.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.isVerified = true;
      state.user = action.payload.user;
    })
    .addCase(exchangeOAuthCode.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    .addCase(logoutAllSessions.fulfilled, (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.isVerified = false;
      state.user = null;
    })
    // Clear Error
    .addCase(clearError.fulfilled, (state) => {
      state.error = null;
      state.message = null;
      state.usersError = null;
    })
    // Set Auth Loading
    .addCase(setAuthLoading.fulfilled, (state, action) => {
      state.loading = action.payload;
    });
});

export default userReducer;