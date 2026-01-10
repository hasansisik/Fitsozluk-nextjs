import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { server } from "@/config";

export interface CreateReportPayload {
    reportedUserId?: string;
    reportedEntryId?: string;
    reportType?: 'user' | 'entry';
    reason: string;
    description: string;
}

export interface UpdateReportStatusPayload {
    id: string;
    status: string;
    adminNotes?: string;
}

// Create report
export const createReport = createAsyncThunk(
    "report/createReport",
    async (payload: CreateReportPayload, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            };
            const response = await axios.post(`${server}/reports`, payload, config);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
            );
        }
    }
);

// Get all reports (Admin only)
export const getAllReports = createAsyncThunk(
    "report/getAllReports",
    async (params: Record<string, string> = {}, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const queryString = new URLSearchParams(params).toString();
            const url = `${server}/reports${queryString ? `?${queryString}` : ''}`;
            const response = await axios.get(url, config);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
            );
        }
    }
);

// Update report status (Admin only)
export const updateReportStatus = createAsyncThunk(
    "report/updateReportStatus",
    async (payload: UpdateReportStatusPayload, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            };
            const { id, ...data } = payload;
            const response = await axios.patch(
                `${server}/reports/${id}/status`,
                data,
                config
            );
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
            );
        }
    }
);

// Delete report (Admin only)
export const deleteReport = createAsyncThunk(
    "report/deleteReport",
    async (id: string, thunkAPI) => {
        try {
            const token = localStorage.getItem("accessToken");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const response = await axios.delete(`${server}/reports/${id}`, config);
            return { id, message: response.data.message };
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
            );
        }
    }
);
