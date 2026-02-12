import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

const initialState = {
  records: [],
  summary: {
    total: 0,
    present: 0,
    percentage: 0,
  },
  courseWise: [],
  leaveRequests: [],
  todayClasses: [],
  stats: {
    total_students: 0,
    at_risk_count: 0,
    students: [],
  },
  status: "idle",
  error: null,
};

export const fetchMyAttendance = createAsyncThunk(
  "attendance/fetchMyAttendance",
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get("/attendance/my-attendance", { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch attendance",
      );
    }
  },
);

export const markAttendance = createAsyncThunk(
  "attendance/mark",
  async (attendanceData, { rejectWithValue }) => {
    try {
      const response = await api.post("/attendance/mark", attendanceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to mark attendance",
      );
    }
  },
);

export const applyForLeave = createAsyncThunk(
  "attendance/applyLeave",
  async (leaveData, { rejectWithValue }) => {
    try {
      const response = await api.post("/attendance/leave/apply", leaveData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Leave application failed",
      );
    }
  },
);

export const fetchLeaveRequests = createAsyncThunk(
  "attendance/fetchLeaveRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/attendance/leave/requests");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch leave requests",
      );
    }
  },
);

export const fetchTodayClasses = createAsyncThunk(
  "attendance/fetchTodayClasses",
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get("/attendance/faculty/today", { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch today's classes",
      );
    }
  },
);

export const fetchAttendanceStats = createAsyncThunk(
  "attendance/fetchStats",
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get("/attendance/stats", { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch attendance stats",
      );
    }
  },
);

export const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    clearAttendanceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyAttendance.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMyAttendance.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.records = action.payload.records;
        state.summary = action.payload.summary;
        state.courseWise = action.payload.courseWise || [];
      })
      .addCase(fetchMyAttendance.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchLeaveRequests.fulfilled, (state, action) => {
        state.leaveRequests = action.payload;
      })
      .addCase(fetchTodayClasses.fulfilled, (state, action) => {
        state.todayClasses = action.payload;
      })
      .addCase(fetchAttendanceStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearAttendanceError } = attendanceSlice.actions;

export default attendanceSlice.reducer;
