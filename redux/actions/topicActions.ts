import axios, { AxiosError } from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { server } from "@/config";

export interface Topic {
    _id: string;
    label: string;
    href: string;
    order: number;
    isFeatured: boolean;
    isActive: boolean;
    createdBy?: {
        _id: string;
        nick: string;
        email: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateTopicPayload {
    label: string;
    href: string;
    isFeatured?: boolean;
}

export interface UpdateTopicPayload {
    id: string;
    label?: string;
    href?: string;
    isFeatured?: boolean;
    isActive?: boolean;
}

export interface ReorderTopicsPayload {
    topics: { id: string; order: number }[];
}

// Get all topics
export const getAllTopics = createAsyncThunk(
    "topic/getAllTopics",
    async (params: { isFeatured?: boolean; isActive?: boolean } = {}, thunkAPI) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.isFeatured !== undefined) queryParams.append('isFeatured', String(params.isFeatured));
            if (params.isActive !== undefined) queryParams.append('isActive', String(params.isActive));

            const { data } = await axios.get(
                `${server}/topics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
            );
            return data.topics;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Get featured topics (for header)
export const getFeaturedTopics = createAsyncThunk(
    "topic/getFeaturedTopics",
    async (_, thunkAPI) => {
        try {
            const { data } = await axios.get(`${server}/topics/featured`);
            return {
                featuredTopics: data.featuredTopics,
                additionalTopics: data.additionalTopics
            };
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Get single topic
export const getTopic = createAsyncThunk(
    "topic/getTopic",
    async (id: string, thunkAPI) => {
        try {
            const { data } = await axios.get(`${server}/topics/${id}`);
            return data.topic;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Create topic
export const createTopic = createAsyncThunk(
    "topic/createTopic",
    async (payload: CreateTopicPayload, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            const { data } = await axios.post(
                `${server}/topics`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return data.topic;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Update topic
export const updateTopic = createAsyncThunk(
    "topic/updateTopic",
    async (payload: UpdateTopicPayload, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            const { id, ...updateData } = payload;
            const { data } = await axios.patch(
                `${server}/topics/${id}`,
                updateData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return data.topic;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Delete topic
export const deleteTopic = createAsyncThunk(
    "topic/deleteTopic",
    async (id: string, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            await axios.delete(`${server}/topics/${id}`, {
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

// Reorder topics
export const reorderTopics = createAsyncThunk(
    "topic/reorderTopics",
    async (payload: ReorderTopicsPayload, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            const { data } = await axios.post(
                `${server}/topics/reorder`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return data.topics;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);
