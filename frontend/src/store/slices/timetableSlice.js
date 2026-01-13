import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

const initialState = {
  currentTimetable: null,
  status: "idle",
  error: null,
};

export const fetchTimetable = createAsyncThunk(
  "timetable/fetchTimetable",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/timetable/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch timetable"
      );
    }
  }
);

export const fetchMyTimetable = createAsyncThunk(
  "timetable/fetchMyTimetable",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/timetable/my/view");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch your schedule"
      );
    }
  }
);

export const findTimetable = createAsyncThunk(
  "timetable/findTimetable",
  async (params, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/timetable/find?${queryString}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to find timetable"
      );
    }
  }
);

export const createTimetable = createAsyncThunk(
  "timetable/createTimetable",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/timetable/init", data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create timetable"
      );
    }
  }
);

export const addSlot = createAsyncThunk(
  "timetable/addSlot",
  async (slotData, { rejectWithValue }) => {
    try {
      const response = await api.post("/timetable/slots", slotData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to add slot"
      );
    }
  }
);

export const timetableSlice = createSlice({
  name: "timetable",
  initialState,
  reducers: {
    clearTimetableError: (state) => {
      state.error = null;
    },
    clearCurrentTimetable: (state) => {
      state.currentTimetable = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimetable.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTimetable.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentTimetable = action.payload;
      })
      .addCase(fetchTimetable.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchMyTimetable.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMyTimetable.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentTimetable = action.payload;
      })
      .addCase(fetchMyTimetable.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(findTimetable.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(findTimetable.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentTimetable = action.payload;
      })
      .addCase(findTimetable.rejected, (state, action) => {
        state.status = "failed";
        state.currentTimetable = null;
        state.error = action.payload;
      })
      .addCase(createTimetable.fulfilled, (state, action) => {
        state.currentTimetable = action.payload;
      })
      .addCase(addSlot.fulfilled, (state, action) => {
        if (state.currentTimetable) {
          if (!state.currentTimetable.slots) state.currentTimetable.slots = [];
          state.currentTimetable.slots.push(action.payload);
        }
      });
  },
});

export const { clearTimetableError, clearCurrentTimetable } =
  timetableSlice.actions;

export default timetableSlice.reducer;
