import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

const initialState = {
  programs: [],
  currentProgram: null,
  status: "idle",
  error: null,
};

// Async thunks
export const fetchPrograms = createAsyncThunk(
  "programs/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/programs");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch programs"
      );
    }
  }
);

export const createProgram = createAsyncThunk(
  "programs/create",
  async (programData, { rejectWithValue }) => {
    try {
      const response = await api.post("/programs", programData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create program"
      );
    }
  }
);

export const updateProgram = createAsyncThunk(
  "programs/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/programs/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update program"
      );
    }
  }
);

export const deleteProgram = createAsyncThunk(
  "programs/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/programs/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete program"
      );
    }
  }
);

export const programSlice = createSlice({
  name: "programs",
  initialState,
  reducers: {
    clearProgError: (state) => {
      state.error = null;
    },
    setCurrentProgram: (state, action) => {
      state.currentProgram = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrograms.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPrograms.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.programs = action.payload;
      })
      .addCase(fetchPrograms.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createProgram.fulfilled, (state, action) => {
        state.programs.push(action.payload);
      })
      .addCase(updateProgram.fulfilled, (state, action) => {
        const index = state.programs.findIndex(
          (p) => p.id === action.payload.id
        );
        if (index !== -1) {
          state.programs[index] = action.payload;
        }
      })
      .addCase(deleteProgram.fulfilled, (state, action) => {
        state.programs = state.programs.filter((p) => p.id !== action.payload);
      });
  },
});

export const { clearProgError, setCurrentProgram } = programSlice.actions;

export default programSlice.reducer;
