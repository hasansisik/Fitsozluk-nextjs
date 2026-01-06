import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { server } from "@/config";

export interface Ad {
    _id: string;
    location: 'anasayfa' | 'basliklar' | 'entry';
    type: 'top' | 'sidebar';
    imageUrl: string;
    linkUrl: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateAdPayload {
    location: string;
    type: string;
    imageUrl: string;
    linkUrl?: string;
    isActive?: boolean;
}

// Get all ads
export const getAllAds = createAsyncThunk(
    "ad/getAllAds",
    async (_, thunkAPI) => {
        try {
            const { data } = await axios.get(`${server}/ads`);
            return data.ads;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Get ads by location
export const getAdsByLocation = createAsyncThunk(
    "ad/getAdsByLocation",
    async (location: string, thunkAPI) => {
        try {
            const { data } = await axios.get(`${server}/ads/location/${location}`);
            return data.ads;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Create ad
export const createAd = createAsyncThunk(
    "ad/createAd",
    async (payload: CreateAdPayload, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            const { data } = await axios.post(
                `${server}/ads`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return data.ad;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Update ad
export const updateAd = createAsyncThunk(
    "ad/updateAd",
    async ({ id, ...payload }: any, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            const { data } = await axios.patch(
                `${server}/ads/${id}`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return data.ad;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Delete ad
export const deleteAd = createAsyncThunk(
    "ad/deleteAd",
    async (id: string, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            await axios.delete(`${server}/ads/${id}`, {
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
