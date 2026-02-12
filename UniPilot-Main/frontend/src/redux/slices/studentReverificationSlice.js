import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Async thunks
export const getMyReverificationEligibility = createAsyncThunk(
  "studentReverification/getEligibility",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/exam/my-reverification-eligibility");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const applyForReverification = createAsyncThunk(
  "studentReverification/apply",
  async (applicationData, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/exam/reverification/apply",
        applicationData,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const getMyReverificationRequests = createAsyncThunk(
  "studentReverification/getRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/exam/my-reverification-requests");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const getMyScripts = createAsyncThunk(
  "studentReverification/getScripts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/exam/my-scripts");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const payScriptViewAccess = createAsyncThunk(
  "studentReverification/payScriptAccess",
  async (cycleId, { rejectWithValue }) => {
    try {
      const response = await api.post("/exam/scripts/pay-access", {
        exam_cycle_id: cycleId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const studentReverificationSlice = createSlice({
  name: "studentReverification",
  initialState: {
    eligibility: null,
    myRequests: [],
    myScripts: [],
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get eligibility
      .addCase(getMyReverificationEligibility.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyReverificationEligibility.fulfilled, (state, action) => {
        state.loading = false;
        state.eligibility = action.payload;
      })
      .addCase(getMyReverificationEligibility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch eligibility";
      })

      // Apply for reverification
      .addCase(applyForReverification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyForReverification.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(applyForReverification.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to apply for reverification";
      })

      // Get my requests
      .addCase(getMyReverificationRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyReverificationRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.myRequests = action.payload.requests;
      })
      .addCase(getMyReverificationRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch requests";
      })

      // Get my scripts
      .addCase(getMyScripts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyScripts.fulfilled, (state, action) => {
        state.loading = false;
        state.myScripts = action.payload.scripts;
      })
      .addCase(getMyScripts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch scripts";
      })

      // Pay script access
      .addCase(payScriptViewAccess.pending, (state) => {
        state.loading = true;
      })
      .addCase(payScriptViewAccess.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(payScriptViewAccess.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to initiate payment";
      });
  },
});

export const { clearMessages } = studentReverificationSlice.actions;
export default studentReverificationSlice.reducer;
