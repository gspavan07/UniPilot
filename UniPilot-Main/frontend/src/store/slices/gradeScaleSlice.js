import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Fetch grade scale for a regulation
export const fetchGradeScale = createAsyncThunk(
  "gradeScale/fetch",
  async (regulationId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/grade-scale/${regulationId}`);
      return response.data.grade_scale;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch grade scale",
      );
    }
  },
);

// Update entire grade scale
export const updateGradeScale = createAsyncThunk(
  "gradeScale/update",
  async ({ regulationId, grade_scale }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/grade-scale/${regulationId}`, {
        grade_scale,
      });
      return response.data.grade_scale;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update grade scale",
      );
    }
  },
);

// Add a new grade
export const addGrade = createAsyncThunk(
  "gradeScale/addGrade",
  async ({ regulationId, grade }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/grade-scale/${regulationId}/grades`, {
        grade,
      });
      return response.data.grade_scale;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add grade",
      );
    }
  },
);

// Update a specific grade
export const updateGrade = createAsyncThunk(
  "gradeScale/updateGrade",
  async ({ regulationId, gradeId, grade }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/grade-scale/${regulationId}/grades/${gradeId}`,
        { grade },
      );
      return response.data.grade_scale;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update grade",
      );
    }
  },
);

// Delete a grade
export const deleteGrade = createAsyncThunk(
  "gradeScale/deleteGrade",
  async ({ regulationId, gradeId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/grade-scale/${regulationId}/grades/${gradeId}`,
      );
      return response.data.grade_scale;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete grade",
      );
    }
  },
);

const gradeScaleSlice = createSlice({
  name: "gradeScale",
  initialState: {
    grades: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch grade scale
      .addCase(fetchGradeScale.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchGradeScale.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.grades = action.payload;
      })
      .addCase(fetchGradeScale.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update grade scale
      .addCase(updateGradeScale.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateGradeScale.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.grades = action.payload;
      })
      .addCase(updateGradeScale.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add grade
      .addCase(addGrade.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addGrade.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.grades = action.payload;
      })
      .addCase(addGrade.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update grade
      .addCase(updateGrade.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateGrade.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.grades = action.payload;
      })
      .addCase(updateGrade.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete grade
      .addCase(deleteGrade.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteGrade.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.grades = action.payload;
      })
      .addCase(deleteGrade.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearError } = gradeScaleSlice.actions;
export default gradeScaleSlice.reducer;
