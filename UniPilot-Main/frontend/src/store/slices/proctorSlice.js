import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

const initialState = {
  myProctees: [], // Renamed from myStudents for clarity in Dashboard selector
  myProctor: null,
  sessions: [],
  feedback: [],
  alerts: [],
  status: "idle",
  error: null,
};

export const fetchMyProctees = createAsyncThunk(
  "proctor/fetchMyProctees",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/proctor/my-students");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch students"
      );
    }
  }
);

export const fetchMyProctor = createAsyncThunk(
  "proctor/fetchMyProctor",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/proctor/my-proctor");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch proctor"
      );
    }
  }
);

export const addProctorFeedback = createAsyncThunk(
  "proctor/addFeedback",
  async (feedbackData, { rejectWithValue }) => {
    try {
      const response = await api.post("/proctor/feedback", feedbackData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to add feedback"
      );
    }
  }
);

export const proctorSlice = createSlice({
  name: "proctor",
  initialState,
  reducers: {
    clearProctorError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyProctees.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMyProctees.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.myProctees = action.payload;
      })
      .addCase(fetchMyProctees.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchMyProctor.fulfilled, (state, action) => {
        state.myProctor = action.payload;
      })
      .addCase(addProctorFeedback.fulfilled, (state, action) => {
        state.feedback.unshift(action.payload);
      });
  },
});

export const { clearProctorError } = proctorSlice.actions;

export default proctorSlice.reducer;
