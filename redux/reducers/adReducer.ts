import { createReducer } from "@reduxjs/toolkit";
import {
    getAllAds,
    getAdsByLocation,
    createAd,
    updateAd,
    deleteAd,
    Ad
} from "../actions/adActions";

interface AdState {
    ads: Ad[];
    locationAds: Ad[];
    loading: boolean;
    error: string | null;
    message: string | null;
}

const initialState: AdState = {
    ads: [],
    locationAds: [],
    loading: false,
    error: null,
    message: null,
};

export const adReducer = createReducer(initialState, (builder) => {
    builder
        // Get all ads
        .addCase(getAllAds.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getAllAds.fulfilled, (state, action) => {
            state.loading = false;
            state.ads = action.payload;
            state.error = null;
        })
        .addCase(getAllAds.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Get ads by location
        .addCase(getAdsByLocation.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getAdsByLocation.fulfilled, (state, action) => {
            state.loading = false;
            state.locationAds = action.payload;
            state.error = null;
        })
        .addCase(getAdsByLocation.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Create ad
        .addCase(createAd.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(createAd.fulfilled, (state, action) => {
            state.loading = false;
            state.ads.unshift(action.payload);
            state.message = "Reklam başarıyla oluşturuldu";
            state.error = null;
        })
        .addCase(createAd.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Update ad
        .addCase(updateAd.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateAd.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.ads.findIndex(a => a._id === action.payload._id);
            if (index !== -1) {
                state.ads[index] = action.payload;
            }
            state.message = "Reklam başarıyla güncellendi";
            state.error = null;
        })
        .addCase(updateAd.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Delete ad
        .addCase(deleteAd.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(deleteAd.fulfilled, (state, action) => {
            state.loading = false;
            state.ads = state.ads.filter(a => a._id !== action.payload);
            state.message = "Reklam başarıyla silindi";
            state.error = null;
        })
        .addCase(deleteAd.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
});

export default adReducer;
