import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchFeeCategories = createAsyncThunk(
  "fee/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/fees/categories");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch categories"
      );
    }
  }
);

export const createFeeCategory = createAsyncThunk(
  "fee/createCategory",
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await api.post("/fees/categories", categoryData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create category"
      );
    }
  }
);

export const createFeeStructure = createAsyncThunk(
  "fee/createStructure",
  async (structureData, { rejectWithValue }) => {
    try {
      const response = await api.post("/fees/structures", structureData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create structure"
      );
    }
  }
);

export const updateFeeStructure = createAsyncThunk(
  "fee/updateStructure",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/fees/structures/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update structure"
      );
    }
  }
);

export const deleteFeeStructure = createAsyncThunk(
  "fee/deleteStructure",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/fees/structures/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete structure"
      );
    }
  }
);

export const fetchFeeStructures = createAsyncThunk(
  "fee/fetchStructures",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/fees/structures", { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch structures"
      );
    }
  }
);

export const cloneFeeStructure = createAsyncThunk(
  "fee/cloneStructure",
  async (cloneData, { rejectWithValue }) => {
    try {
      const response = await api.post("/fees/structures/clone", cloneData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to clone structure"
      );
    }
  }
);

export const createFeePayment = createAsyncThunk(
  "fee/createPayment",
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await api.post("/fees/payments", paymentData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to process payment"
      );
    }
  }
);

export const fetchMyFeeStatus = createAsyncThunk(
  "fee/fetchMyStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/fees/my-status");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch fee status"
      );
    }
  }
);

export const fetchSemesterConfigs = createAsyncThunk(
  "fee/fetchSemesterConfigs",
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get("/fees/semester-configs", { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch configs"
      );
    }
  }
);

export const updateSemesterConfig = createAsyncThunk(
  "fee/updateSemesterConfig",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.put("/fees/semester-configs", data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update config"
      );
    }
  }
);

const initialState = {
  categories: [],
  structures: [],
  myStatus: null,
  semesterConfigs: [],
  status: "idle",
  error: null,
};

export const feeSlice = createSlice({
  name: "fee",
  initialState,
  reducers: {
    clearFeeError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeeCategories.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchFeeCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.categories = action.payload;
      })
      .addCase(fetchFeeStructures.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.structures = action.payload;
      })
      .addCase(fetchMyFeeStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.myStatus = action.payload;
      })
      .addCase(createFeeCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(createFeeStructure.fulfilled, (state, action) => {
        state.structures.push(action.payload);
      })
      .addCase(updateFeeStructure.fulfilled, (state, action) => {
        const index = state.structures.findIndex(
          (s) => s.id === action.payload.id
        );
        if (index !== -1) state.structures[index] = action.payload;
      })
      .addCase(deleteFeeStructure.fulfilled, (state, action) => {
        state.structures = state.structures.filter(
          (s) => s.id !== action.payload
        );
      })
      .addCase(fetchSemesterConfigs.fulfilled, (state, action) => {
        state.semesterConfigs = action.payload;
      })
      .addCase(updateSemesterConfig.fulfilled, (state, action) => {
        const index = state.semesterConfigs.findIndex(
          (c) => c.semester === action.payload.semester
        );
        if (index !== -1) {
          state.semesterConfigs[index] = action.payload;
        } else {
          state.semesterConfigs.push(action.payload);
        }
      });
  },
});

export const { clearFeeError } = feeSlice.actions;

export default feeSlice.reducer;
