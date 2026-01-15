import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { server } from "@/config";

export interface Badge {
    _id: string;
    name: string;
    icon: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Get all badges
export const getAllBadges = createAsyncThunk(
    "badge/getAllBadges",
    async (_, thunkAPI) => {
        try {
            const { data } = await axios.get(`${server}/badges`);
            return data.badges;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Create badge (Admin only)
export const createBadge = createAsyncThunk(
    "badge/createBadge",
    async (payload: { name: string; icon: string; description?: string }, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            const { data } = await axios.post(
                `${server}/badges`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return data.badge;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Update badge (Admin only)
export const updateBadge = createAsyncThunk(
    "badge/updateBadge",
    async (payload: { id: string; name?: string; icon?: string; description?: string; isActive?: boolean }, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            const { id, ...updateData } = payload;
            const { data } = await axios.patch(
                `${server}/badges/${id}`,
                updateData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return data.badge;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Delete badge (Admin only)
export const deleteBadge = createAsyncThunk(
    "badge/deleteBadge",
    async (id: string, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            await axios.delete(`${server}/badges/${id}`, {
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

// Assign badge to user (Admin only)
export const assignBadgeToUser = createAsyncThunk(
    "badge/assignBadgeToUser",
    async (payload: { userId: string; badgeId: string }, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            const { data } = await axios.post(
                `${server}/badges/assign`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Remove badge from user (Admin only)
export const removeBadgeFromUser = createAsyncThunk(
    "badge/removeBadgeFromUser",
    async (payload: { userId: string; badgeId: string }, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            const { data } = await axios.post(
                `${server}/badges/remove`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);
