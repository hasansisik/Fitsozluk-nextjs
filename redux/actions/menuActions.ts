import axios, { AxiosError } from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { server } from "@/config";

export interface Menu {
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

export interface CreateMenuPayload {
    label: string;
    href: string;
    isFeatured?: boolean;
}

export interface UpdateMenuPayload {
    id: string;
    label?: string;
    href?: string;
    isFeatured?: boolean;
    isActive?: boolean;
}

export interface ReorderMenusPayload {
    menus: { id: string; order: number }[];
}

// Get all menus
export const getAllMenus = createAsyncThunk(
    "menu/getAllMenus",
    async (params: { isFeatured?: boolean; isActive?: boolean } = {}, thunkAPI) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.isFeatured !== undefined) queryParams.append('isFeatured', String(params.isFeatured));
            if (params.isActive !== undefined) queryParams.append('isActive', String(params.isActive));

            const { data } = await axios.get(
                `${server}/menus${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
            );
            return data.menus;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Get featured menus (for header)
export const getFeaturedMenus = createAsyncThunk(
    "menu/getFeaturedMenus",
    async (_, thunkAPI) => {
        try {
            const { data } = await axios.get(`${server}/menus/featured`);
            return {
                featuredMenus: data.featuredMenus,
                additionalMenus: data.additionalMenus
            };
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Get single menu
export const getMenu = createAsyncThunk(
    "menu/getMenu",
    async (id: string, thunkAPI) => {
        try {
            const { data } = await axios.get(`${server}/menus/${id}`);
            return data.menu;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Create menu
export const createMenu = createAsyncThunk(
    "menu/createMenu",
    async (payload: CreateMenuPayload, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            const { data } = await axios.post(
                `${server}/menus`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return data.menu;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Update menu
export const updateMenu = createAsyncThunk(
    "menu/updateMenu",
    async (payload: UpdateMenuPayload, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            const { id, ...updateData } = payload;
            const { data } = await axios.patch(
                `${server}/menus/${id}`,
                updateData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return data.menu;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Delete menu
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

// Reorder menus
export const reorderMenus = createAsyncThunk(
    "menu/reorderMenus",
    async (payload: ReorderMenusPayload, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            const { data } = await axios.post(
                `${server}/menus/reorder`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return data.menus;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);
