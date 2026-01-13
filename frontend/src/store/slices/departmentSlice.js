import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

const initialState = {
  departments: [],
  currentDepartment: null,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Async thunks
export const fetchDepartments = createAsyncThunk(
  "departments/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/departments");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch departments"
      );
    }
  }
);

export const createDepartment = createAsyncThunk(
  "departments/create",
  async (departmentData, { rejectWithValue }) => {
    try {
      const response = await api.post("/departments", departmentData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create department"
      );
    }
  }
);

export const updateDepartment = createAsyncThunk(
  "departments/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/departments/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update department"
      );
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  "departments/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/departments/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete department"
      );
    }
  }
);

export const departmentSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {
    clearDeptError: (state) => {
      state.error = null;
    },
    setCurrentDepartment: (state, action) => {
      state.currentDepartment = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Departments
      .addCase(fetchDepartments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Create Department
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.departments.push(action.payload);
      })
      // Update Department
      .addCase(updateDepartment.fulfilled, (state, action) => {
        const index = state.departments.findIndex(
          (d) => d.id === action.payload.id
        );
        if (index !== -1) {
          state.departments[index] = action.payload;
        }
      })
      // Delete Department
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.departments = state.departments.filter(
          (d) => d.id !== action.payload
        );
      });
  },
});

export const { clearDeptError, setCurrentDepartment } = departmentSlice.actions;

export default departmentSlice.reducer;
