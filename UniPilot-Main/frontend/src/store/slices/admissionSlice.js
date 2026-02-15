import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Fetch admission analytics
export const fetchAdmissionAnalytics = createAsyncThunk(
  "admission/fetchAnalytics",
  async (batch = "all", { rejectWithValue }) => {
    try {
      const response = await api.get(`/admission/analytics?batch=${batch}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch admission analytics",
      );
    }
  },
);

const admissionSlice = createSlice({
  name: "admission",
  initialState: {
    analytics: {
      kpis: {
        totalAdmissions: 0,
        activeBatch: "",
        departments: 0,
        international: 0,
        internationalPercentage: "0.0",
      },
      batchGrowth: [],
      departments: [],
      gender: [],
      caste: [],
      religion: [],
      country: [],
      admissionType: [],
      states: [],
      batches: [],
    },
    status: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {
    clearAdmissionData: (state) => {
      state.analytics = {
        kpis: {
          totalAdmissions: 0,
          activeBatch: "",
          departments: 0,
          international: 0,
          internationalPercentage: "0.0",
        },
        batchGrowth: [],
        departments: [],
        gender: [],
        caste: [],
        religion: [],
        country: [],
        admissionType: [],
        states: [],
        batches: [],
      };
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdmissionAnalytics.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAdmissionAnalytics.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.analytics = action.payload;
      })
      .addCase(fetchAdmissionAnalytics.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearAdmissionData } = admissionSlice.actions;

export default admissionSlice.reducer;
