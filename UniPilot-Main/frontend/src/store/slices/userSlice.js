import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

const initialState = {
  users: [],
  sections: [],
  sectionIncharges: [],
  batchYears: [],
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
      const { role, department_id, search, batch_year, section } = filters;
      let url = "/users";
      const params = new URLSearchParams();
      if (role) params.append("role", role);
      if (department_id) params.append("department_id", department_id);
      if (search) params.append("search", search);
      if (batch_year) params.append("batch_year", batch_year);
      if (section) params.append("section", section);

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const response = await api.get(url);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch users",
      );
    }
  },
);

export const fetchUserStats = createAsyncThunk(
  "users/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/stats");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch user stats",
      );
    }
  },
);

export const getUser = createAsyncThunk(
  "users/getOne",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch user",
      );
    }
  },
);

export const fetchStudentSections = createAsyncThunk(
  "users/fetchSections",
  async ({ department_id, batch_year }, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/sections", {
        params: { department_id, batch_year },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch sections",
      );
    }
  },
);

export const fetchBatchYears = createAsyncThunk(
  "users/fetchBatchYears",
  async ({ department_id } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/batch-years", {
        params: { department_id },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch batch years",
      );
    }
  },
);

export const createUser = createAsyncThunk(
  "users/create",
  async (userData, { rejectWithValue }) => {
    try {
      const config =
        userData instanceof FormData
          ? { headers: { "Content-Type": "multipart/form-data" } }
          : {};
      const response = await api.post("/users", userData, config);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create user",
      );
    }
  },
);

export const updateUser = createAsyncThunk(
  "users/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const config =
        data instanceof FormData
          ? { headers: { "Content-Type": "multipart/form-data" } }
          : {};
      const response = await api.put(`/users/${id}`, data, config);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update user",
      );
    }
  },
);

export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete user",
      );
    }
  },
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
        error.response?.data?.error || "Failed to import users",
      );
    }
  },
);

export const bulkUpdateSections = createAsyncThunk(
  "users/bulkUpdateSections",
  async ({ userIds, section }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post("/users/bulk-update-sections", {
        userIds,
        section,
      });
      // Refresh the list after successful update
      dispatch(fetchUsers({ role: "student" }));
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update sections",
      );
    }
  },
);

export const fetchSectionIncharges = createAsyncThunk(
  "users/fetchSectionIncharges",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/section-incharges", { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch section incharges",
      );
    }
  },
);

export const assignSectionIncharge = createAsyncThunk(
  "users/assignSectionIncharge",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post("/section-incharges", data);
      dispatch(fetchSectionIncharges({ department_id: data.department_id }));
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to assign section incharge",
      );
    }
  },
);

export const removeSectionIncharge = createAsyncThunk(
  "users/removeSectionIncharge",
  async ({ id, department_id }, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/section-incharges/${id}`);
      dispatch(fetchSectionIncharges({ department_id }));
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to remove section incharge",
      );
    }
  },
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
      .addCase(getUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentUser = action.payload;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.unshift(action.payload);
      })
      .addCase(fetchStudentSections.fulfilled, (state, action) => {
        state.sections = action.payload;
      })
      .addCase(fetchBatchYears.fulfilled, (state, action) => {
        state.batchYears = action.payload;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      })
      .addCase(fetchSectionIncharges.fulfilled, (state, action) => {
        state.sectionIncharges = action.payload;
      });
  },
});

export const { clearUserError, setCurrentUser } = userSlice.actions;

export default userSlice.reducer;
