import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Initial state from localStorage
const user = JSON.parse(localStorage.getItem("user"));
const accessToken = localStorage.getItem("accessToken");

const initialState = {
  user: user ? user : null,
  accessToken: accessToken ? accessToken : null,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Async thunk for login
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", { email, password });

      const { user, accessToken, refreshToken } = response.data.data;

      // Store in localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      return { user, accessToken };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          "Login failed. Please check your credentials."
      );
    }
  }
);

// Async thunk for loading user on app mount (Reload Fix)
export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/me");
      const user = response.data.data;

      // Update localStorage with fresh data
      localStorage.setItem("user", JSON.stringify(user));

      return user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to load user profile"
      );
    }
  }
);

// Async thunk for changing password
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/change-password", {
        oldPassword,
        newPassword,
      });
      return response.data.message;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to change password"
      );
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      // Clear localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      state.user = null;
      state.accessToken = null;
      state.status = "idle";
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload; // Update state with fresh user object
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;
