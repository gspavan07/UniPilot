import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { setAccessToken, clearAccessToken, getAccessToken } from "../../utils/api";

// Initial state purely in-memory
const initialState = {
  user: null,
  accessToken: null,
  mustChangePassword: false,
  status: "loading", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Async thunk for login
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password, rememberMe }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
        rememberMe,
      });

      const { user, accessToken } = response.data.data;

      setAccessToken(accessToken);

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
      // First attempt to grab the user data assuming a valid token might exist
      const response = await api.get("/auth/me");
      const user = response.data.data;

      return { user, accessToken: getAccessToken() };
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

// Async thunk for forgot password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data.message;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to process request"
      );
    }
  }
);

// Async thunk for reset password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/reset-password", {
        token,
        newPassword,
      });
      return response.data.message;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to reset password"
      );
    }
  }
);

// Async thunk for logout from all other sessions
export const logoutAllSessions = createAsyncThunk(
  "auth/logoutAllSessions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/logout-all");
      return response.data.message;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to logout from all sessions"
      );
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      clearAccessToken();

      state.user = null;
      state.accessToken = null;
      state.mustChangePassword = false;
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
        state.mustChangePassword = !!action.payload.user?.must_change_password;
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
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.mustChangePassword = !!action.payload.user?.must_change_password;
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
        state.mustChangePassword = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Logout All Sessions
      .addCase(logoutAllSessions.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(logoutAllSessions.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(logoutAllSessions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;
