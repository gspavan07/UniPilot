import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Async thunks
export const fetchExamConfig = createAsyncThunk(
  "examConfig/fetchExamConfig",
  async (regulationId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/exam-config/${regulationId}`);
      return response.data.exam_configuration;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch exam configuration",
      );
    }
  },
);

export const updateExamConfig = createAsyncThunk(
  "examConfig/updateExamConfig",
  async ({ regulationId, exam_configuration }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/exam-config/${regulationId}`, {
        exam_configuration,
      });
      return response.data.exam_configuration;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update exam configuration",
      );
    }
  },
);

export const addCourseType = createAsyncThunk(
  "examConfig/addCourseType",
  async ({ regulationId, courseType }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/exam-config/${regulationId}/course-types`,
        { courseType },
      );
      return response.data.exam_configuration;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add course type",
      );
    }
  },
);

export const updateCourseType = createAsyncThunk(
  "examConfig/updateCourseType",
  async ({ regulationId, courseTypeId, courseType }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/exam-config/${regulationId}/course-types/${courseTypeId}`,
        { courseType },
      );
      return response.data.exam_configuration;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update course type",
      );
    }
  },
);

export const deleteCourseType = createAsyncThunk(
  "examConfig/deleteCourseType",
  async ({ regulationId, courseTypeId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/exam-config/${regulationId}/course-types/${courseTypeId}`,
      );
      return response.data.exam_configuration;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete course type",
      );
    }
  },
);

const examConfigSlice = createSlice({
  name: "examConfig",
  initialState: {
    currentConfig: { course_types: [] },
    status: "idle",
    error: null,
  },
  reducers: {
    resetExamConfig: (state) => {
      state.currentConfig = { course_types: [] };
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch exam config
      .addCase(fetchExamConfig.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchExamConfig.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentConfig = action.payload;
      })
      .addCase(fetchExamConfig.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update exam config
      .addCase(updateExamConfig.fulfilled, (state, action) => {
        state.currentConfig = action.payload;
      })
      // Add course type
      .addCase(addCourseType.fulfilled, (state, action) => {
        state.currentConfig = action.payload;
      })
      // Update course type
      .addCase(updateCourseType.fulfilled, (state, action) => {
        state.currentConfig = action.payload;
      })
      // Delete course type
      .addCase(deleteCourseType.fulfilled, (state, action) => {
        state.currentConfig = action.payload;
      });
  },
});

export const { resetExamConfig } = examConfigSlice.actions;
export default examConfigSlice.reducer;
