import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Async thunks
export const configureReverification = createAsyncThunk(
  "reverification/configure",
  async (configData, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/exam/reverification/configure",
        configData,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const getReverificationRequests = createAsyncThunk(
  "reverification/getRequests",
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.get("/exam/reverification/requests", {
        params: filters,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const reviewReverification = createAsyncThunk(
  "reverification/review",
  async ({ id, reviewData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/exam/reverification/${id}/review`,
        reviewData,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const waiveReverificationFee = createAsyncThunk(
  "reverification/waiveFee",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/exam/reverification/${id}/waive-fee`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const uploadScripts = createAsyncThunk(
  "reverification/uploadScripts",
  async ({ examScheduleId, files }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("exam_schedule_id", examScheduleId);
      files.forEach((file) => {
        formData.append("scripts", file);
      });

      const response = await api.post("/exam/scripts/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const updateScriptVisibility = createAsyncThunk(
  "reverification/updateVisibility",
  async (visibilityData, { rejectWithValue }) => {
    try {
      const response = await api.put(
        "/exam/scripts/visibility",
        visibilityData,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const getUploadedScripts = createAsyncThunk(
  "reverification/getUploadedScripts",
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.get("/exam/scripts/uploaded", {
        params: filters,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const reverificationSlice = createSlice({
  name: "reverification",
  initialState: {
    requests: [],
    scripts: [],
    pagination: null,
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
      // Configure reverification
      .addCase(configureReverification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(configureReverification.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(configureReverification.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to configure reverification";
      })

      // Get requests
      .addCase(getReverificationRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReverificationRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload.requests;
        state.pagination = action.payload.pagination;
      })
      .addCase(getReverificationRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch requests";
      })

      // Review reverification
      .addCase(reviewReverification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reviewReverification.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        // Update the specific request in the list
        const index = state.requests.findIndex(
          (r) => r.id === action.payload.reverification.id,
        );
        if (index !== -1) {
          state.requests[index] = action.payload.reverification;
        }
      })
      .addCase(reviewReverification.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to review reverification";
      })

      // Waive fee
      .addCase(waiveReverificationFee.pending, (state) => {
        state.loading = true;
      })
      .addCase(waiveReverificationFee.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(waiveReverificationFee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to waive fee";
      })

      // Upload scripts
      .addCase(uploadScripts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadScripts.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        state.scripts = [...state.scripts, ...action.payload.uploadedScripts];
      })
      .addCase(uploadScripts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to upload scripts";
      })

      // Update visibility
      .addCase(updateScriptVisibility.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateScriptVisibility.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(updateScriptVisibility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update visibility";
      })

      // Get uploaded scripts
      .addCase(getUploadedScripts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUploadedScripts.fulfilled, (state, action) => {
        state.loading = false;
        state.scripts = action.payload.scripts;
      })
      .addCase(getUploadedScripts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch scripts";
      });
  },
});

export const { clearMessages } = reverificationSlice.actions;
export default reverificationSlice.reducer;
