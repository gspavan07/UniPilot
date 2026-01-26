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
        error.response?.data?.error || "Failed to fetch categories",
      );
    }
  },
);

export const createFeeCategory = createAsyncThunk(
  "fee/createCategory",
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await api.post("/fees/categories", categoryData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create category",
      );
    }
  },
);

export const createFeeStructure = createAsyncThunk(
  "fee/createStructure",
  async (structureData, { rejectWithValue }) => {
    try {
      const response = await api.post("/fees/structures", structureData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create structure",
      );
    }
  },
);

export const updateFeeStructure = createAsyncThunk(
  "fee/updateStructure",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/fees/structures/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update structure",
      );
    }
  },
);

export const deleteFeeStructure = createAsyncThunk(
  "fee/deleteStructure",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/fees/structures/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete structure",
      );
    }
  },
);

export const fetchFeeStructures = createAsyncThunk(
  "fee/fetchStructures",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/fees/structures", { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch structures",
      );
    }
  },
);

export const cloneFeeStructure = createAsyncThunk(
  "fee/cloneStructure",
  async (cloneData, { rejectWithValue }) => {
    try {
      const response = await api.post("/fees/structures/clone", cloneData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to clone structure",
      );
    }
  },
);

export const createFeePayment = createAsyncThunk(
  "fee/createPayment",
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await api.post("/fees/payments", paymentData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to process payment",
      );
    }
  },
);

export const studentPayFees = createAsyncThunk(
  "fee/studentPayFees",
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await api.post("/fees/my-payment", paymentData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to process payment",
      );
    }
  },
);

export const fetchMyFeeStatus = createAsyncThunk(
  "fee/fetchMyStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/fees/my-status");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch fee status",
      );
    }
  },
);

export const fetchSemesterConfigs = createAsyncThunk(
  "fee/fetchSemesterConfigs",
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get("/fees/semester-configs", { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch configs",
      );
    }
  },
);

export const updateSemesterConfig = createAsyncThunk(
  "fee/updateSemesterConfig",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.put("/fees/semester-configs", data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update config",
      );
    }
  },
);

export const fetchCollectionStats = createAsyncThunk(
  "fee/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/fees/stats");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch stats",
      );
    }
  },
);

export const fetchTransactions = createAsyncThunk(
  "fee/fetchTransactions",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/fees/transactions", { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch transactions",
      );
    }
  },
);

export const fetchBatches = createAsyncThunk(
  "fee/fetchBatches",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/fees/batches");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch batches",
      );
    }
  },
);

export const fetchStudentFeeStatus = createAsyncThunk(
  "fee/fetchStudentStatus",
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/fees/summary/${studentId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch student fee status",
      );
    }
  },
);

export const fetchWaivers = createAsyncThunk(
  "fee/fetchWaivers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/fees/waivers", { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch waivers",
      );
    }
  },
);

export const applyWaiver = createAsyncThunk(
  "fee/applyWaiver",
  async (waiverData, { rejectWithValue }) => {
    try {
      const response = await api.post("/fees/waivers", waiverData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to apply waiver",
      );
    }
  },
);

export const approveWaiver = createAsyncThunk(
  "fee/approveWaiver",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`/fees/waivers/${id}/approve`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to approve waiver",
      );
    }
  },
);

export const updateWaiver = createAsyncThunk(
  "fee/updateWaiver",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/fees/waivers/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update scholarship",
      );
    }
  },
);

export const deleteWaiver = createAsyncThunk(
  "fee/deleteWaiver",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/fees/waivers/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete scholarship",
      );
    }
  },
);

export const validateScholarshipImport = createAsyncThunk(
  "fee/validateScholarshipImport",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post("/fees/validate-scholarships", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to validate file",
      );
    }
  },
);

export const finalizeScholarshipImport = createAsyncThunk(
  "fee/finalizeScholarshipImport",
  async (records, { rejectWithValue }) => {
    try {
      const response = await api.post("/fees/finalize-scholarships", {
        records,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to finalize import",
      );
    }
  },
);

export const fetchDailyCollection = createAsyncThunk(
  "fee/fetchDailyCollection",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/fees/reports/daily", {
        params,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch report",
      );
    }
  },
);

export const fetchDefaulters = createAsyncThunk(
  "fee/fetchDefaulters",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/fees/defaulters", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch defaulters",
      );
    }
  },
);

export const imposeFine = createAsyncThunk(
  "fee/imposeFine",
  async (fineData, { rejectWithValue }) => {
    try {
      const response = await api.post("/fees/fines", fineData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to impose fine",
      );
    }
  },
);

export const sendReminders = createAsyncThunk(
  "fee/sendReminders",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/fees/reminders/send", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to send reminders",
      );
    }
  },
);

export const fetchSections = createAsyncThunk(
  "fee/fetchSections",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/fees/sections", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch sections",
      );
    }
  },
);

const initialState = {
  categories: [],
  structures: [],
  myStatus: null,
  semesterConfigs: [],
  stats: null,
  transactions: [],
  transactionMeta: {
    total: 0,
    pages: 0,
    currentPage: 1,
  },
  batches: [],
  sections: [],
  studentStatus: null, // For Admin Terminal
  waivers: [],
  importPreview: [],
  defaulters: [],
  defaultersMeta: {
    total: 0,
    page: 1,
    limit: 10,
    total_outstanding: 0,
  },
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
          (s) => s.id === action.payload.id,
        );
        if (index !== -1) state.structures[index] = action.payload;
      })
      .addCase(deleteFeeStructure.fulfilled, (state, action) => {
        state.structures = state.structures.filter(
          (s) => s.id !== action.payload,
        );
      })
      .addCase(fetchSemesterConfigs.fulfilled, (state, action) => {
        state.semesterConfigs = action.payload;
      })
      .addCase(updateSemesterConfig.fulfilled, (state, action) => {
        const index = state.semesterConfigs.findIndex(
          (c) => c.semester === action.payload.semester,
        );
        if (index !== -1) {
          state.semesterConfigs[index] = action.payload;
        } else {
          state.semesterConfigs.push(action.payload);
        }
      })
      .addCase(fetchCollectionStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload.transactions;
        state.transactionMeta = {
          total: action.payload.total,
          pages: action.payload.pages,
          currentPage: action.payload.currentPage,
        };
      })
      .addCase(fetchBatches.fulfilled, (state, action) => {
        state.batches = action.payload;
      })
      .addCase(fetchStudentFeeStatus.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchStudentFeeStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.studentStatus = action.payload;
      })
      .addCase(fetchWaivers.fulfilled, (state, action) => {
        state.waivers = action.payload;
      })
      .addCase(applyWaiver.fulfilled, (state, action) => {
        state.waivers.unshift(action.payload);
      })
      .addCase(approveWaiver.fulfilled, (state, action) => {
        const index = state.waivers.findIndex(
          (w) => w.id === action.payload.id,
        );
        if (index !== -1) state.waivers[index] = action.payload;
      })
      .addCase(updateWaiver.fulfilled, (state, action) => {
        const index = state.waivers.findIndex(
          (w) => w.id === action.payload.id,
        );
        if (index !== -1) state.waivers[index] = action.payload;
      })
      .addCase(deleteWaiver.fulfilled, (state, action) => {
        state.waivers = state.waivers.filter((w) => w.id !== action.payload);
      })
      .addCase(validateScholarshipImport.fulfilled, (state, action) => {
        state.importPreview = action.payload;
        state.status = "succeeded";
      })
      .addCase(finalizeScholarshipImport.fulfilled, (state) => {
        state.importPreview = [];
        state.status = "succeeded";
      })
      .addCase(fetchDefaulters.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDefaulters.fulfilled, (state, action) => {
        state.defaulters = action.payload.data;
        state.defaultersMeta = action.payload.meta;
        state.status = "succeeded";
      })
      .addCase(fetchSections.fulfilled, (state, action) => {
        state.sections = action.payload.data;
      });
  },
});

export const { clearFeeError } = feeSlice.actions;

export default feeSlice.reducer;
