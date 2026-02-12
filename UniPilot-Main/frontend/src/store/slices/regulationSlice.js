import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

const initialState = {
  regulations: [],
  currentRegulation: null,
  status: "idle",
  error: null,
};

// Async thunks
export const fetchRegulations = createAsyncThunk(
  "regulations/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/regulations");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch regulations",
      );
    }
  },
);

export const getRegulation = createAsyncThunk(
  "regulations/getOne",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/regulations/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch regulation details",
      );
    }
  },
);

export const createRegulation = createAsyncThunk(
  "regulations/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/regulations", data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create regulation",
      );
    }
  },
);

export const updateRegulation = createAsyncThunk(
  "regulations/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/regulations/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update regulation",
      );
    }
  },
);

export const deleteRegulation = createAsyncThunk(
  "regulations/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/regulations/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete regulation",
      );
    }
  },
);

export const regulationSlice = createSlice({
  name: "regulations",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentRegulation: (state, action) => {
      state.currentRegulation = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchRegulations.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRegulations.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.regulations = action.payload;
      })
      .addCase(fetchRegulations.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Get One
      .addCase(getRegulation.fulfilled, (state, action) => {
        state.currentRegulation = action.payload;
      })
      // Create
      .addCase(createRegulation.fulfilled, (state, action) => {
        state.regulations.unshift(action.payload);
      })
      // Update
      .addCase(updateRegulation.fulfilled, (state, action) => {
        const index = state.regulations.findIndex(
          (r) => r.id === action.payload.id,
        );
        if (index !== -1) {
          state.regulations[index] = action.payload;
        }
        if (state.currentRegulation?.id === action.payload.id) {
          state.currentRegulation = action.payload;
        }
      })
      // Delete
      .addCase(deleteRegulation.fulfilled, (state, action) => {
        state.regulations = state.regulations.filter(
          (r) => r.id !== action.payload,
        );
      });
  },
});

export const { clearError, setCurrentRegulation } = regulationSlice.actions;

export default regulationSlice.reducer;
