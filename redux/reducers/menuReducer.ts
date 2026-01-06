import { createReducer } from "@reduxjs/toolkit";
import {
    getAllMenus,
    getFeaturedMenus,
    getMenu,
    createMenu,
    updateMenu,
    deleteMenu,
    reorderMenus,
    Menu
} from "../actions/menuActions";

interface MenuState {
    menus: Menu[];
    featuredMenus: Menu[];
    additionalMenus: Menu[];
    currentMenu: Menu | null;
    loading: boolean;
    error: string | null;
    message: string | null;
}

const initialState: MenuState = {
    menus: [],
    featuredMenus: [],
    additionalMenus: [],
    currentMenu: null,
    loading: false,
    error: null,
    message: null,
};

export const menuReducer = createReducer(initialState, (builder) => {
    builder
        // Get all menus
        .addCase(getAllMenus.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getAllMenus.fulfilled, (state, action) => {
            state.loading = false;
            state.menus = action.payload;
            state.error = null;
        })
        .addCase(getAllMenus.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Get featured menus
        .addCase(getFeaturedMenus.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getFeaturedMenus.fulfilled, (state, action) => {
            state.loading = false;
            state.featuredMenus = action.payload.featuredMenus;
            state.additionalMenus = action.payload.additionalMenus;
            state.error = null;
        })
        .addCase(getFeaturedMenus.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Get single menu
        .addCase(getMenu.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getMenu.fulfilled, (state, action) => {
            state.loading = false;
            state.currentMenu = action.payload;
            state.error = null;
        })
        .addCase(getMenu.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Create menu
        .addCase(createMenu.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(createMenu.fulfilled, (state, action) => {
            state.loading = false;
            state.menus.push(action.payload);
            state.message = "Başlık başarıyla oluşturuldu";
            state.error = null;
        })
        .addCase(createMenu.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Update menu
        .addCase(updateMenu.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateMenu.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.menus.findIndex(t => t._id === action.payload._id);
            if (index !== -1) {
                state.menus[index] = action.payload;
            }
            state.message = "Başlık başarıyla güncellendi";
            state.error = null;
        })
        .addCase(updateMenu.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Delete menu
        .addCase(deleteMenu.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(deleteMenu.fulfilled, (state, action) => {
            state.loading = false;
            state.menus = state.menus.filter(t => t._id !== action.payload);
            state.message = "Başlık başarıyla silindi";
            state.error = null;
        })
        .addCase(deleteMenu.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Reorder menus
        .addCase(reorderMenus.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(reorderMenus.fulfilled, (state, action) => {
            state.loading = false;
            state.menus = action.payload;
            state.message = "Başlıklar başarıyla sıralandı";
            state.error = null;
        })
        .addCase(reorderMenus.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
});

export default menuReducer;
