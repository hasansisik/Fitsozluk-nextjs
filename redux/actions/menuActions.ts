import axios, { AxiosError } from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { server } from "@/config";

export interface Menu {
    _id: string;
    label: string;
    href: string;
    order: number;
    isActive: boolean;
    isFeatured: boolean;
    type: "home" | "special" | "channel" | "other";
    createdAt: string;
    updatedAt: string;
}

export interface CreateMenuPayload {
    label: string;
    href: string;
    order?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    type?: "home" | "special" | "channel" | "other";
}

export interface UpdateMenuPayload {
    id: string;
    label?: string;
    href?: string;
    order?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    type?: "home" | "special" | "channel" | "other";
}

export interface ReorderMenusPayload {
    menus: { id: string; order: number }[];
}

// Get All Menus (Public)
export const getAllMenus = createAsyncThunk(
    "menu/getAllMenus",
    async (_, thunkAPI) => {
        try {
            const { data } = await axios.get(`${server}/menus`);
            return data.menus;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Get Featured Menus (Public)
export const getFeaturedMenus = createAsyncThunk(
    "menu/getFeaturedMenus",
    async (_, thunkAPI) => {
        try {
            const { data } = await axios.get(`${server}/menus/featured`);
            return {
                featuredMenus: data.featuredMenus,
                additionalMenus: data.additionalMenus,
            };
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Create Menu (Admin Only)
export const createMenu = createAsyncThunk(
    "menu/createMenu",
    async (payload: CreateMenuPayload, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            const { data } = await axios.post(`${server}/menus`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return data.menu;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Update Menu (Admin Only)
export const updateMenu = createAsyncThunk(
    "menu/updateMenu",
    async (payload: UpdateMenuPayload, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            const { id, ...updateData } = payload;
            const { data } = await axios.put(`${server}/menus/${id}`, updateData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return data.menu;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Delete Menu (Admin Only)
export const deleteMenu = createAsyncThunk(
    "menu/deleteMenu",
    async (id: string, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            await axios.delete(`${server}/menus/${id}`, {
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

// Reorder Menus (Admin Only)
export const reorderMenus = createAsyncThunk(
    "menu/reorderMenus",
    async (payload: ReorderMenusPayload, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            await axios.put(`${server}/menus/reorder`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return payload.menus;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);
