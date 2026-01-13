import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

const initialState = {
  cycles: [],
  schedules: [],
  myResults: [],
  gpa: {
    currentSemester: "0.00",
    overall: "0.00",
  },
  status: "idle",
  error: null,
};

export const fetchExamCycles = createAsyncThunk(
  "exam/fetchCycles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/exam/cycles");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch cycles"
      );
    }
  }
);

export const createExamCycle = createAsyncThunk(
  "exam/createCycle",
  async (cycleData, { rejectWithValue }) => {
    try {
      const response = await api.post("/exam/cycles", cycleData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create exam cycle"
      );
    }
  }
);

export const updateExamCycle = createAsyncThunk(
  "exam/updateCycle",
  async ({ id, cycleData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/exam/cycles/${id}`, cycleData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update exam cycle"
      );
    }
  }
);

export const deleteExamCycle = createAsyncThunk(
  "exam/deleteCycle",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/exam/cycles/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete exam cycle"
      );
    }
  }
);

export const enterBulkMarks = createAsyncThunk(
  "exam/enterMarks",
  async (marksData, { rejectWithValue }) => {
    try {
      const response = await api.post("/exam/marks/bulk", marksData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to enter marks"
      );
    }
  }
);

export const fetchExamSchedules = createAsyncThunk(
  "exam/fetchSchedules",
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get("/exam/schedules", { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch schedules"
      );
    }
  }
);

export const addExamSchedule = createAsyncThunk(
  "exam/addSchedule",
  async (scheduleData, { rejectWithValue }) => {
    try {
      const response = await api.post("/exam/schedules", scheduleData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to add schedule"
      );
    }
  }
);

export const updateExamSchedule = createAsyncThunk(
  "exam/updateSchedule",
  async ({ id, scheduleData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/exam/schedules/${id}`, scheduleData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update schedule"
      );
    }
  }
);

export const deleteExamSchedule = createAsyncThunk(
  "exam/deleteSchedule",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/exam/schedules/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete schedule"
      );
    }
  }
);

export const autoGenerateTimetable = createAsyncThunk(
  "exam/autoGenerate",
  async (config, { rejectWithValue }) => {
    try {
      const response = await api.post("/exam/schedules/auto-generate", config);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to auto-generate timetable"
      );
    }
  }
);

export const fetchMyResults = createAsyncThunk(
  "exam/fetchMyResults",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/exam/my-results", { params });
      return response.data; // Return full response including gpa
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch results"
      );
    }
  }
);

export const examSlice = createSlice({
  name: "exam",
  initialState,
  reducers: {
    clearExamError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExamCycles.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchExamCycles.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cycles = action.payload;
      })
      .addCase(createExamCycle.fulfilled, (state, action) => {
        state.cycles.push(action.payload);
      })
      .addCase(updateExamCycle.fulfilled, (state, action) => {
        const index = state.cycles.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.cycles[index] = action.payload;
        }
      })
      .addCase(deleteExamCycle.fulfilled, (state, action) => {
        state.cycles = state.cycles.filter((c) => c.id !== action.payload);
      })
      .addCase(fetchMyResults.fulfilled, (state, action) => {
        state.myResults = action.payload.data || action.payload;
        state.gpa = action.payload.gpa || {
          currentSemester: "0.00",
          overall: "0.00",
        };
      })
      .addCase(fetchExamSchedules.fulfilled, (state, action) => {
        state.schedules = action.payload;
      })
      .addCase(addExamSchedule.fulfilled, (state, action) => {
        state.schedules.push(action.payload);
      })
      .addCase(updateExamSchedule.fulfilled, (state, action) => {
        const index = state.schedules.findIndex(
          (s) => s.id === action.payload.id
        );
        if (index !== -1) {
          // Merge with existing to keep course details
          state.schedules[index] = {
            ...state.schedules[index],
            ...action.payload,
          };
        }
      })
      .addCase(deleteExamSchedule.fulfilled, (state, action) => {
        state.schedules = state.schedules.filter(
          (s) => s.id !== action.payload
        );
      })
      .addCase(autoGenerateTimetable.fulfilled, (state, action) => {
        // Auto-generation returns an array of new schedules
        state.schedules = [...state.schedules, ...action.payload];
      });
  },
});

export const { clearExamError } = examSlice.actions;

export default examSlice.reducer;
