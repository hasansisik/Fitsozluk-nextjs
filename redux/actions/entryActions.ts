import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { server } from "@/config";

export interface Entry {
    _id: string;
    content: string;
    topic: {
        _id: string;
        title: string;
        slug: string;
    };
    author: {
        _id: string;
        nick: string;
        email: string;
        picture?: string;
    };
    likes: string[];
    dislikes: string[];
    favorites: string[];
    likeCount: number;
    dislikeCount: number;
    favoriteCount: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateEntryPayload {
    content: string;
    topic: string;
}

export interface UpdateEntryPayload {
    id: string;
    content?: string;
    isActive?: boolean;
}

// Get all entries
export const getAllEntries = createAsyncThunk(
    "entry/getAllEntries",
    async (params: {
        isActive?: boolean;
        topic?: string;
        author?: string;
        likedBy?: string;
        dislikedBy?: string;
        favoritedBy?: string;
        search?: string;
        sort?: string;
        startDate?: string;
        endDate?: string;
    } = {}, thunkAPI) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
            if (params.topic) queryParams.append('topic', params.topic);
            if (params.author) queryParams.append('author', params.author);
            if (params.likedBy) queryParams.append('likedBy', params.likedBy);
            if (params.dislikedBy) queryParams.append('dislikedBy', params.dislikedBy);
            if (params.favoritedBy) queryParams.append('favoritedBy', params.favoritedBy);
            if (params.search) queryParams.append('search', params.search);
            if (params.sort) queryParams.append('sort', params.sort);
            if (params.startDate) queryParams.append('startDate', params.startDate);
            if (params.endDate) queryParams.append('endDate', params.endDate);

            const token = localStorage.getItem("accessToken");
            const config = token ? {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            } : {};

            const { data } = await axios.get(
                `${server}/entries${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
                config
            );
            return data.entries;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Get entries by topic
export const getEntriesByTopic = createAsyncThunk(
    "entry/getEntriesByTopic",
    async (params: {
        topicId: string;
        search?: string;
        timeRange?: string;
        filterType?: string;
        userId?: string;
    }, thunkAPI) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.search) queryParams.append('search', params.search);
            if (params.timeRange) queryParams.append('timeRange', params.timeRange);
            if (params.filterType) queryParams.append('filterType', params.filterType);
            if (params.userId) queryParams.append('userId', params.userId);

            const queryString = queryParams.toString();
            const token = localStorage.getItem("accessToken");
            const config = token ? {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            } : {};

            const { data } = await axios.get(
                `${server}/entries/topic/${params.topicId}${queryString ? `?${queryString}` : ''}`,
                config
            );
            return data.entries;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Get single entry
export const getEntry = createAsyncThunk(
    "entry/getEntry",
    async (id: string, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            const config = token ? {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            } : {};

            const { data } = await axios.get(`${server}/entries/${id}`, config);
            return data.entry;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Create entry
export const createEntry = createAsyncThunk(
    "entry/createEntry",
    async (payload: CreateEntryPayload, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            const { data } = await axios.post(
                `${server}/entries`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return data.entry;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Update entry
export const updateEntry = createAsyncThunk(
    "entry/updateEntry",
    async (payload: UpdateEntryPayload, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            const { id, ...updateData } = payload;
            const { data } = await axios.patch(
                `${server}/entries/${id}`,
                updateData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return data.entry;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Delete entry
export const deleteEntry = createAsyncThunk(
    "entry/deleteEntry",
    async (id: string, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            await axios.delete(`${server}/entries/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return id;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Like entry
export const likeEntry = createAsyncThunk(
    "entry/likeEntry",
    async (id: string, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            const { data } = await axios.post(
                `${server}/entries/${id}/like`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return { id, ...data };
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Dislike entry
export const dislikeEntry = createAsyncThunk(
    "entry/dislikeEntry",
    async (id: string, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            const { data } = await axios.post(
                `${server}/entries/${id}/dislike`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return { id, ...data };
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Toggle favorite
export const toggleFavorite = createAsyncThunk(
    "entry/toggleFavorite",
    async (id: string, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            const { data } = await axios.post(
                `${server}/entries/${id}/favorite`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return { id, ...data };
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);


// Get entries feed by category (for homepage)
export const getEntriesFeed = createAsyncThunk(
    "entry/getEntriesFeed",
    async (params: { limit?: number; category?: string } = {}, thunkAPI) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.limit) queryParams.append('limit', params.limit.toString());
            if (params.category) queryParams.append('category', params.category);

            const token = localStorage.getItem("accessToken");
            const config = token ? {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            } : {};

            const { data } = await axios.get(`${server}/entries/feed?${queryParams.toString()}`, config);
            return data.entries;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);
