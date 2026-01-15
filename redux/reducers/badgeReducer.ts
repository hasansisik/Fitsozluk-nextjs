import { createReducer } from "@reduxjs/toolkit";
import {
    getAllBadges,
    createBadge,
    updateBadge,
    deleteBadge,
    assignBadgeToUser,
    removeBadgeFromUser,
    Badge
} from "../actions/badgeActions";

interface BadgeState {
    badges: Badge[];
    loading: boolean;
    error: string | null;
    message: string | null;
}

const initialState: BadgeState = {
    badges: [],
    loading: false,
    error: null,
    message: null,
};

export const badgeReducer = createReducer(initialState, (builder) => {
    builder
        // Get all badges
        .addCase(getAllBadges.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getAllBadges.fulfilled, (state, action) => {
            state.loading = false;
            state.badges = action.payload;
            state.error = null;
        })
        .addCase(getAllBadges.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Create badge
        .addCase(createBadge.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(createBadge.fulfilled, (state, action) => {
            state.loading = false;
            state.badges.unshift(action.payload);
            state.message = "Rozet başarıyla oluşturuldu";
            state.error = null;
        })
        .addCase(createBadge.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Update badge
        .addCase(updateBadge.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateBadge.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.badges.findIndex(b => b._id === action.payload._id);
            if (index !== -1) {
                state.badges[index] = action.payload;
            }
            state.message = "Rozet başarıyla güncellendi";
            state.error = null;
        })
        .addCase(updateBadge.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Delete badge
        .addCase(deleteBadge.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(deleteBadge.fulfilled, (state, action) => {
            state.loading = false;
            state.badges = state.badges.filter(b => b._id !== action.payload);
            state.message = "Rozet başarıyla silindi";
            state.error = null;
        })
        .addCase(deleteBadge.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Assign badge to user
        .addCase(assignBadgeToUser.fulfilled, (state, action) => {
            state.message = "Rozet kullanıcıya başarıyla verildi";
        })
        .addCase(assignBadgeToUser.rejected, (state, action) => {
            state.error = action.payload as string;
        })

        // Remove badge from user
        .addCase(removeBadgeFromUser.fulfilled, (state, action) => {
            state.message = "Rozet kullanıcıdan başarıyla kaldırıldı";
        })
        .addCase(removeBadgeFromUser.rejected, (state, action) => {
            state.error = action.payload as string;
        });
});

export default badgeReducer;
