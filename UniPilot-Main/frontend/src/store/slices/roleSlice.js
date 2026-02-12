import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

const initialState = {
  roles: [],
  status: "idle",
  error: null,
};

export const fetchRoles = createAsyncThunk(
  "roles/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/roles");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch roles"
      );
    }
  }
);

export const createRole = createAsyncThunk(
  "roles/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/roles", data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create role"
      );
    }
  }
);

export const updateRole = createAsyncThunk(
  "roles/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/roles/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update role"
      );
    }
  }
);

export const fetchPermissions = createAsyncThunk(
  "roles/fetchPermissions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/roles/permissions");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch permissions"
      );
    }
  }
);

export const roleSlice = createSlice({
  name: "roles",
  initialState: {
    ...initialState,
    permissions: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.permissions = action.payload;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        const index = state.roles.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.roles.push(action.payload);
      });
  },
});

export default roleSlice.reducer;
