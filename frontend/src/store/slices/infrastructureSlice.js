import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

const initialState = {
  blocks: [],
  currentBlock: null,
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

// Async Thunks

export const fetchBlocks = createAsyncThunk(
  "infrastructure/fetchBlocks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/infrastructure/blocks");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch blocks",
      );
    }
  },
);

export const createBlock = createAsyncThunk(
  "infrastructure/createBlock",
  async (blockData, { rejectWithValue }) => {
    try {
      const response = await api.post("/infrastructure/blocks", blockData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create block",
      );
    }
  },
);

export const fetchBlockDetails = createAsyncThunk(
  "infrastructure/fetchBlockDetails",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/infrastructure/blocks/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch block details",
      );
    }
  },
);

export const addRoom = createAsyncThunk(
  "infrastructure/addRoom",
  async ({ blockId, roomData }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/infrastructure/blocks/${blockId}/rooms`,
        roomData,
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to add room",
      );
    }
  },
);

export const generateRooms = createAsyncThunk(
  "infrastructure/generateRooms",
  async ({ blockId, config }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/infrastructure/blocks/${blockId}/generate`,
        config,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to generate rooms",
      );
    }
  },
);

export const updateBlock = createAsyncThunk(
  "infrastructure/updateBlock",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/infrastructure/blocks/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update block",
      );
    }
  },
);

export const deleteBlock = createAsyncThunk(
  "infrastructure/deleteBlock",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/infrastructure/blocks/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete block",
      );
    }
  },
);

export const updateRoom = createAsyncThunk(
  "infrastructure/updateRoom",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/infrastructure/rooms/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update room",
      );
    }
  },
);

export const deleteRoom = createAsyncThunk(
  "infrastructure/deleteRoom",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/infrastructure/rooms/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete room",
      );
    }
  },
);

const infrastructureSlice = createSlice({
  name: "infrastructure",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetCurrentBlock: (state) => {
      state.currentBlock = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Blocks
      .addCase(fetchBlocks.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBlocks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.blocks = action.payload;
      })
      .addCase(fetchBlocks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Create Block
      .addCase(createBlock.fulfilled, (state, action) => {
        state.blocks.push({ ...action.payload, room_count: 0 });
      })
      // Fetch Details
      .addCase(fetchBlockDetails.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBlockDetails.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentBlock = action.payload;
      })
      .addCase(fetchBlockDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add Room
      .addCase(addRoom.fulfilled, (state, action) => {
        if (
          state.currentBlock &&
          state.currentBlock.id === action.payload.block_id
        ) {
          state.currentBlock.rooms.push(action.payload);
        }
      })
      // Generate Rooms
      .addCase(generateRooms.fulfilled, (state, action) => {
        // Since generating returns a count, we trigger a re-fetch or just let the user refresh
        // Optimally we should just set status to trigger re-fetch in component
      })
      // Update Block
      .addCase(updateBlock.fulfilled, (state, action) => {
        const index = state.blocks.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.blocks[index] = { ...state.blocks[index], ...action.payload };
        }
        if (state.currentBlock?.id === action.payload.id) {
          state.currentBlock = { ...state.currentBlock, ...action.payload };
        }
      })
      // Delete Block
      .addCase(deleteBlock.fulfilled, (state, action) => {
        state.blocks = state.blocks.filter((b) => b.id !== action.payload);
        if (state.currentBlock?.id === action.payload) {
          state.currentBlock = null;
        }
      })
      // Delete Room
      .addCase(deleteRoom.fulfilled, (state, action) => {
        // Optimistic update for Room deletion
        if (state.currentBlock) {
          state.currentBlock.rooms = state.currentBlock.rooms.filter(
            (r) => r.id !== action.payload,
          );
        }
      })
      // Update Room
      .addCase(updateRoom.fulfilled, (state, action) => {
        if (state.currentBlock) {
          const index = state.currentBlock.rooms.findIndex(
            (r) => r.id === action.payload.id,
          );
          if (index !== -1) {
            state.currentBlock.rooms[index] = action.payload;
          }
        }
      });
  },
});

export const { clearError, resetCurrentBlock } = infrastructureSlice.actions;
export default infrastructureSlice.reducer;
