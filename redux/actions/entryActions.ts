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
    async (params: { isActive?: boolean; topic?: string; author?: string } = {}, thunkAPI) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
            if (params.topic) queryParams.append('topic', params.topic);
            if (params.author) queryParams.append('author', params.author);

            const { data } = await axios.get(
                `${server}/entries${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
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
    async (topicId: string, thunkAPI) => {
        try {
            const { data } = await axios.get(`${server}/entries/topic/${topicId}`);
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
            const { data } = await axios.get(`${server}/entries/${id}`);
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
