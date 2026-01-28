import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

const initialState = {
  stats: null,
  status: "idle",
  error: null,
};

// Async thunk to fetch super admin dashboard statistics
export const fetchSuperAdminStats = createAsyncThunk(
  "dashboard/fetchSuperAdminStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/dashboard/super-admin");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard statistics",
      );
    }
  },
);

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardStats: (state) => {
      state.stats = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuperAdminStats.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSuperAdminStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.stats = action.payload;
      })
      .addCase(fetchSuperAdminStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearDashboardStats } = dashboardSlice.actions;

export default dashboardSlice.reducer;
