import axios from "axios";
import { createAsyncThunk, createAction } from "@reduxjs/toolkit";
import { server } from "@/config";
import { Entry } from "./entryActions";

export interface Topic {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    category?: string;
    entryCount: number;
    isActive: boolean;
    createdBy?: {
        _id: string;
        nick: string;
        email: string;
    };
    createdAt?: string;
    updatedAt?: string;
    firstEntry?: Entry;
}

export interface CreateTopicPayload {
    title: string;
    slug: string;
    description?: string;
    firstEntry?: string;
    category?: string;
}

export interface UpdateTopicPayload {
    id: string;
    title?: string;
    slug?: string;
    description?: string;
    category?: string;
    isActive?: boolean;
}

// Get all topics
export const getAllTopics = createAsyncThunk(
    "topic/getAllTopics",
    async (params: { isActive?: boolean; search?: string } = {}, thunkAPI) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
            if (params.search) queryParams.append('search', params.search);

            const token = localStorage.getItem("accessToken");
            const config = token ? {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            } : {};

            const { data } = await axios.get(
                `${server}/topics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
                config
            );
            return data.topics;
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
            const token = localStorage.getItem("accessToken");
            const config = token ? {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            } : {};

            const { data } = await axios.get(`${server}/topics/${id}`, config);
            return data.topic;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Get topic by slug
export const getTopicBySlug = createAsyncThunk(
    "topic/getTopicBySlug",
    async (slug: string, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            const config = token ? {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            } : {};

            const { data } = await axios.get(`${server}/topics/slug/${slug}`, config);
            return data.topic;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Get trending topics
export const getTrendingTopics = createAsyncThunk(
    "topic/getTrendingTopics",
    async (params: { limit?: number; category?: string } | number = 20, thunkAPI) => {
        try {
            const limit = typeof params === 'number' ? params : params.limit || 20;
            const category = typeof params === 'object' ? params.category : undefined;

            let url = `${server}/topics/trending?limit=${limit}`;
            if (category) url += `&category=${category}`;

            const token = localStorage.getItem("accessToken");
            const config = token ? {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            } : {};

            const { data } = await axios.get(url, config);
            return data.topics;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Get topics with first entry
export const getTopicsWithFirstEntry = createAsyncThunk(
    "topic/getTopicsWithFirstEntry",
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

            const { data } = await axios.get(`${server}/topics/with-entries?${queryParams.toString()}`, config);
            return data.topics;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Get debe topics (most liked topics from a specific date)
export const getDebeTopics = createAsyncThunk(
    "topic/getDebeTopics",
    async (params: { limit?: number; date?: string } = {}, thunkAPI) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.limit) queryParams.append('limit', params.limit.toString());
            if (params.date) queryParams.append('date', params.date);

            const token = localStorage.getItem("accessToken");
            const config = token ? {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            } : {};

            const { data } = await axios.get(`${server}/topics/debe/topics?${queryParams.toString()}`, config);
            return data.topics;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Get debe entries (most liked entries from a specific date)
export const getDebeEntries = createAsyncThunk(
    "topic/getDebeEntries",
    async (params: { limit?: number; date?: string } = {}, thunkAPI) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.limit) queryParams.append('limit', params.limit.toString());
            if (params.date) queryParams.append('date', params.date);

            const token = localStorage.getItem("accessToken");
            const config = token ? {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            } : {};

            const { data } = await axios.get(`${server}/topics/debe/entries?${queryParams.toString()}`, config);
            return data.topics;
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
            return data; // Return full data including topic and entry
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

// Follow topic
export const followTopic = createAsyncThunk(
    "topic/followTopic",
    async (topicId: string, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            const { data } = await axios.post(
                `${server}/topics/${topicId}/follow`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return { topicId, followedTopics: data.followedTopics };
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Unfollow topic
export const unfollowTopic = createAsyncThunk(
    "topic/unfollowTopic",
    async (topicId: string, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            const { data } = await axios.delete(
                `${server}/topics/${topicId}/follow`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return { topicId, followedTopics: data.followedTopics };
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Get followed topics
export const getFollowedTopics = createAsyncThunk(
    "topic/getFollowedTopics",
    async (_, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            const { data } = await axios.get(
                `${server}/topics/user/followed`,
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

// Clear current topic (synchronous action for immediate state cleanup)
export const clearCurrentTopic = createAction("topic/clearCurrentTopic");


