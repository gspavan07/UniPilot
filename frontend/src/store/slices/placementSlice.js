import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Async Thunks - Companies
export const fetchCompanies = createAsyncThunk(
  "placement/fetchCompanies",
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.get("/placement/companies", {
        params: filters,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const createCompany = createAsyncThunk(
  "placement/createCompany",
  async (companyData, { rejectWithValue }) => {
    try {
      const response = await api.post("/placement/companies", companyData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const updateCompany = createAsyncThunk(
  "placement/updateCompany",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/placement/companies/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const fetchCompanyById = createAsyncThunk(
  "placement/fetchCompanyById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/placement/companies/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// Async Thunks - Job Postings
export const fetchJobPostings = createAsyncThunk(
  "placement/fetchJobPostings",
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.get("/placement/job-postings", {
        params: filters,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const fetchJobPostingById = createAsyncThunk(
  "placement/fetchJobPostingById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/placement/job-postings/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const deleteJobPosting = createAsyncThunk(
  "placement/deleteJobPosting",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/placement/job-postings/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// Async Thunks - Drives
export const fetchDrives = createAsyncThunk(
  "placement/fetchDrives",
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.get("/placement/drives", { params: filters });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const fetchDriveById = createAsyncThunk(
  "placement/fetchDriveById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/placement/drives/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// Async Thunks - Student Features
export const fetchMyProfile = createAsyncThunk(
  "placement/fetchMyProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/placement/my-profile");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const updateMyProfile = createAsyncThunk(
  "placement/updateMyProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.post("/placement/my-profile", profileData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const fetchEligibleDrives = createAsyncThunk(
  "placement/fetchEligibleDrives",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/placement/eligible-drives");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const applyToDrive = createAsyncThunk(
  "placement/applyToDrive",
  async ({ driveId, registrationFormData }, { rejectWithValue }) => {
    try {
      const response = await api.post("/placement/apply", {
        driveId,
        registrationFormData,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const fetchMyApplications = createAsyncThunk(
  "placement/fetchMyApplications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/placement/my-applications");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

const initialState = {
  companies: [],
  jobPostings: [],
  drives: [],
  eligibleDrives: [],
  myApplications: [],
  myProfile: null,
  currentDrive: null,
  currentCompany: null,
  currentJobPosting: null,
  loading: false,
  error: null,
  success: false,
};

const placementSlice = createSlice({
  name: "placement",
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearCurrentDrive: (state) => {
      state.currentDrive = null;
    },
    clearCurrentCompany: (state) => {
      state.currentCompany = null;
    },
    clearCurrentJobPosting: (state) => {
      state.currentJobPosting = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Companies
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Failed to fetch companies";
      })
      .addCase(fetchCompanyById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCompanyById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCompany = action.payload;
      })
      .addCase(fetchCompanyById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.error || "Failed to fetch company details";
      })
      // Job Postings
      .addCase(fetchJobPostings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobPostings.fulfilled, (state, action) => {
        state.loading = false;
        state.jobPostings = action.payload;
      })
      .addCase(fetchJobPostings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Failed to fetch job postings";
      })
      .addCase(fetchJobPostingById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobPostingById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJobPosting = action.payload;
      })
      .addCase(fetchJobPostingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Failed to fetch job posting";
      })
      .addCase(deleteJobPosting.fulfilled, (state, action) => {
        state.jobPostings = state.jobPostings.filter(
          (p) => p.id !== action.payload,
        );
        state.success = true;
      })
      // Drives
      .addCase(fetchDrives.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDrives.fulfilled, (state, action) => {
        state.loading = false;
        state.drives = action.payload;
      })
      .addCase(fetchDrives.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Failed to fetch drives";
      })
      .addCase(fetchDriveById.fulfilled, (state, action) => {
        state.currentDrive = action.payload;
      })
      // Student Profile
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.myProfile = action.payload;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.myProfile = action.payload;
        state.success = true;
      })
      // Eligible Drives
      .addCase(fetchEligibleDrives.fulfilled, (state, action) => {
        state.eligibleDrives = action.payload;
      })
      // My Applications
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.myApplications = action.payload;
      })
      // Apply
      .addCase(applyToDrive.fulfilled, (state) => {
        state.success = true;
      });
  },
});

export const {
  resetStatus,
  clearCurrentDrive,
  clearCurrentCompany,
  clearCurrentJobPosting,
} = placementSlice.actions;
export default placementSlice.reducer;
