import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

const initialState = {
  users: [],
  userStats: null,
  currentUser: null,
  status: "idle",
  error: null,
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const { role, department_id, search } = filters;
      let url = "/users";
      const params = new URLSearchParams();
      if (role) params.append("role", role);
      if (department_id) params.append("department_id", department_id);
      if (search) params.append("search", search);

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const response = await api.get(url);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch users"
      );
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  "users/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/stats");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch user stats"
      );
    }
  }
);

export const createUser = createAsyncThunk(
  "users/create",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/users", userData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create user"
      );
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/users/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update user"
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete user"
      );
    }
  }
);

export const bulkImportUsers = createAsyncThunk(
  "users/bulkImport",
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post("/users/bulk-import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // Refresh the list after successful import
      dispatch(fetchUsers());
      dispatch(fetchUserStats());
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to import users"
      );
    }
  }
);

export const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.userStats = action.payload;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.unshift(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      });
  },
});

export const { clearUserError, setCurrentUser } = userSlice.actions;

export default userSlice.reducer;
