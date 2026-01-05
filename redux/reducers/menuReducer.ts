import { createReducer } from "@reduxjs/toolkit";
import {
    getAllMenus,
    getFeaturedMenus,
    createMenu,
    updateMenu,
    deleteMenu,
    reorderMenus,
    Menu,
} from "../actions/menuActions";

interface MenuState {
    menus: Menu[];
    featuredMenus: Menu[];
    additionalMenus: Menu[];
    loading: boolean;
    error: string | null;
    message: string | null;
}

const initialState: MenuState = {
    menus: [],
    featuredMenus: [],
    additionalMenus: [],
    loading: false,
    error: null,
    message: null,
};

export const menuReducer = createReducer(initialState, (builder) => {
    builder
        // Get All Menus
        .addCase(getAllMenus.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getAllMenus.fulfilled, (state, action) => {
            state.loading = false;
            state.menus = action.payload;
        })
        .addCase(getAllMenus.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Get Featured Menus
        .addCase(getFeaturedMenus.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getFeaturedMenus.fulfilled, (state, action) => {
            state.loading = false;
            state.featuredMenus = action.payload.featuredMenus;
            state.additionalMenus = action.payload.additionalMenus;
        })
        .addCase(getFeaturedMenus.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Create Menu
        .addCase(createMenu.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(createMenu.fulfilled, (state, action) => {
            state.loading = false;
            state.menus.push(action.payload);
            state.message = "Menü başarıyla oluşturuldu";
        })
        .addCase(createMenu.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Update Menu
        .addCase(updateMenu.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateMenu.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.menus.findIndex((menu) => menu._id === action.payload._id);
            if (index !== -1) {
                state.menus[index] = action.payload;
            }
            state.message = "Menü başarıyla güncellendi";
        })
        .addCase(updateMenu.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Delete Menu
        .addCase(deleteMenu.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(deleteMenu.fulfilled, (state, action) => {
            state.loading = false;
            state.menus = state.menus.filter((menu) => menu._id !== action.payload);
            state.message = "Menü başarıyla silindi";
        })
        .addCase(deleteMenu.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Reorder Menus
        .addCase(reorderMenus.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(reorderMenus.fulfilled, (state, action) => {
            state.loading = false;
            // Update order for each menu
            action.payload.forEach(({ id, order }) => {
                const menu = state.menus.find((m) => m._id === id);
                if (menu) {
                    menu.order = order;
                }
            });
            // Re-sort menus by order
            state.menus.sort((a, b) => a.order - b.order);
            state.message = "Menü sıralaması güncellendi";
        })
        .addCase(reorderMenus.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
});

export default menuReducer;
