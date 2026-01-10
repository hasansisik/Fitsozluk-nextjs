import { createReducer } from "@reduxjs/toolkit";
import {
    createReport,
    getAllReports,
    updateReportStatus,
    deleteReport,
} from "../actions/reportActions";

interface ReportState {
    reports: any[];
    reportStats: any;
    loading: boolean;
    error: string | null;
    message: string | null;
}

const initialState: ReportState = {
    reports: [],
    reportStats: null,
    loading: false,
    error: null,
    message: null,
};

export const reportReducer = createReducer(initialState, (builder) => {
    builder
        // Create Report
        .addCase(createReport.pending, (state) => {
            state.loading = true;
        })
        .addCase(createReport.fulfilled, (state, action) => {
            state.loading = false;
            state.message = action.payload.message;
            state.error = null;
        })
        .addCase(createReport.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
        // Get All Reports
        .addCase(getAllReports.pending, (state) => {
            state.loading = true;
        })
        .addCase(getAllReports.fulfilled, (state, action) => {
            state.loading = false;
            state.reports = action.payload.reports;
            state.reportStats = action.payload.stats;
            state.error = null;
        })
        .addCase(getAllReports.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
        // Update Report Status
        .addCase(updateReportStatus.pending, (state) => {
            state.loading = true;
        })
        .addCase(updateReportStatus.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.reports.findIndex(
                (report) => report._id === action.payload.report._id
            );
            if (index !== -1) {
                state.reports[index] = action.payload.report;
            }
            state.message = action.payload.message;
        })
        .addCase(updateReportStatus.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
        // Delete Report
        .addCase(deleteReport.pending, (state) => {
            state.loading = true;
        })
        .addCase(deleteReport.fulfilled, (state, action) => {
            state.loading = false;
            state.reports = state.reports.filter(
                (report) => report._id !== action.payload.id
            );
            state.message = action.payload.message;
        })
        .addCase(deleteReport.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
});

export default reportReducer;
