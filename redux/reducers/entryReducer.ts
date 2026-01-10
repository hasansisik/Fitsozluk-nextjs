import { createReducer } from "@reduxjs/toolkit";
import {
    getAllEntries,
    getEntriesByTopic,
    getEntry,
    createEntry,
    updateEntry,
    deleteEntry,
    likeEntry,
    dislikeEntry,
    toggleFavorite,
    getEntriesFeed,
    Entry
} from "../actions/entryActions";

interface EntryState {
    entries: Entry[];
    currentEntry: Entry | null;
    loading: boolean;
    error: string | null;
    message: string | null;
}

const initialState: EntryState = {
    entries: [],
    currentEntry: null,
    loading: false,
    error: null,
    message: null,
};

export const entryReducer = createReducer(initialState, (builder) => {
    builder
        // Get all entries
        .addCase(getAllEntries.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getAllEntries.fulfilled, (state, action) => {
            state.loading = false;
            state.entries = action.payload;
            state.error = null;
        })
        .addCase(getAllEntries.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Get entries by topic
        .addCase(getEntriesByTopic.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.entries = []; // Clear old entries immediately
        })
        .addCase(getEntriesByTopic.fulfilled, (state, action) => {
            state.loading = false;
            state.entries = action.payload;
            state.error = null;
        })
        .addCase(getEntriesByTopic.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Get single entry
        .addCase(getEntry.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getEntry.fulfilled, (state, action) => {
            state.loading = false;
            state.currentEntry = action.payload;
            state.error = null;
        })
        .addCase(getEntry.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Create entry
        .addCase(createEntry.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(createEntry.fulfilled, (state, action) => {
            state.loading = false;
            state.entries.unshift(action.payload);
            state.message = "Entry başarıyla oluşturuldu";
            state.error = null;
        })
        .addCase(createEntry.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Update entry
        .addCase(updateEntry.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateEntry.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.entries.findIndex(e => e._id === action.payload._id);
            if (index !== -1) {
                state.entries[index] = action.payload;
            }
            state.message = "Entry başarıyla güncellendi";
            state.error = null;
        })
        .addCase(updateEntry.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Delete entry
        .addCase(deleteEntry.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(deleteEntry.fulfilled, (state, action) => {
            state.loading = false;
            state.entries = state.entries.filter(e => e._id !== action.payload);
            state.message = "Entry başarıyla silindi";
            state.error = null;
        })
        .addCase(deleteEntry.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Like entry
        .addCase(likeEntry.fulfilled, (state, action) => {
            const index = state.entries.findIndex(e => e._id === action.payload.id);
            if (index !== -1) {
                state.entries[index].likeCount = action.payload.likeCount;
                state.entries[index].dislikeCount = action.payload.dislikeCount;
                state.entries[index].likes = action.payload.likes;
                state.entries[index].dislikes = action.payload.dislikes;
            }
        })

        // Dislike entry
        .addCase(dislikeEntry.fulfilled, (state, action) => {
            const index = state.entries.findIndex(e => e._id === action.payload.id);
            if (index !== -1) {
                state.entries[index].likeCount = action.payload.likeCount;
                state.entries[index].dislikeCount = action.payload.dislikeCount;
                state.entries[index].likes = action.payload.likes;
                state.entries[index].dislikes = action.payload.dislikes;
            }
        })

        // Toggle favorite
        .addCase(toggleFavorite.pending, (state) => {
            state.error = null;
        })
        .addCase(toggleFavorite.fulfilled, (state, action) => {
            const index = state.entries.findIndex(e => e._id === action.payload.id);
            if (index !== -1) {
                state.entries[index].favoriteCount = action.payload.favoriteCount;
                state.entries[index].favorites = action.payload.favorites;
            }
            state.message = action.payload.message;
            state.error = null;
        })
        .addCase(toggleFavorite.rejected, (state, action) => {
            state.error = action.payload as string;
        })

        // Get entries feed
        .addCase(getEntriesFeed.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getEntriesFeed.fulfilled, (state, action) => {
            state.loading = false;
            state.entries = action.payload;
            state.error = null;
        })
        .addCase(getEntriesFeed.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
});

export default entryReducer;
