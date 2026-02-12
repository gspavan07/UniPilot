import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

const initialState = {
  criteria: null,
  evaluationResults: [],
  graduationApp: null,
  status: "idle",
  error: null,
};

export const savePromotionCriteria = createAsyncThunk(
  "promotion/saveCriteria",
  async (criteriaData, { rejectWithValue }) => {
    try {
      const response = await api.post("/promotion/criteria", criteriaData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to save criteria"
      );
    }
  }
);

export const evaluateStudents = createAsyncThunk(
  "promotion/evaluate",
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.post("/promotion/evaluate", params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Evaluation failed"
      );
    }
  }
);

export const processPromotions = createAsyncThunk(
  "promotion/process",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/promotion/process", payload);
      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Promotion failed");
    }
  }
);

export const promotionSlice = createSlice({
  name: "promotion",
  initialState,
  reducers: {
    clearPromotionState: (state) => {
      state.evaluationResults = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(evaluateStudents.pending, (state) => {
        state.status = "loading";
      })
      .addCase(evaluateStudents.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.evaluationResults = action.payload;
      })
      .addCase(evaluateStudents.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(processPromotions.fulfilled, (state) => {
        state.evaluationResults = []; // Clear after success
      });
  },
});

export const { clearPromotionState } = promotionSlice.actions;

export default promotionSlice.reducer;
