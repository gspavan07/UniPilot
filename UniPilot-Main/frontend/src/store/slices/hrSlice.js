import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/api"; // Axios instance with interceptors

// Thunks using new HR Routes

// --- Attendance ---
export const fetchStaffAttendance = createAsyncThunk(
  "hr/fetchStaffAttendance",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get("/hr/attendance", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.error
          ? error.response.data.error
          : error.message
      );
    }
  }
);

export const markStaffAttendance = createAsyncThunk(
  "hr/markStaffAttendance",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/hr/attendance/mark", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// --- Leaves ---
export const fetchLeaveBalances = createAsyncThunk(
  "hr/fetchLeaveBalances",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get("/hr/leave/balances", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const applyLeave = createAsyncThunk(
  "hr/applyLeave",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/hr/leave/apply", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updateLeaveStatus = createAsyncThunk(
  "hr/updateLeaveStatus",
  async ({ id, status, remarks }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/hr/leave/${id}`, { status, remarks });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// --- Payroll ---
export const fetchSalaryStructure = createAsyncThunk(
  "hr/fetchSalaryStructure",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/hr/payroll/structure/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const upsertSalaryStructure = createAsyncThunk(
  "hr/upsertSalaryStructure",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/hr/payroll/structure", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const generatePayslip = createAsyncThunk(
  "hr/generatePayslip",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/hr/payroll/generate", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const bulkGeneratePayslips = createAsyncThunk(
  "hr/bulkGeneratePayslips",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/hr/payroll/bulk-generate", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchSalaryGrades = createAsyncThunk(
  "hr/fetchSalaryGrades",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/hr/payroll/grades");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const upsertSalaryGrade = createAsyncThunk(
  "hr/upsertSalaryGrade",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/hr/payroll/grades", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchPayrollStats = createAsyncThunk(
  "hr/fetchPayrollStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/hr/payroll/stats");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchBulkPayrollPreview = createAsyncThunk(
  "hr/fetchBulkPayrollPreview",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get("/hr/payroll/preview-bulk", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchPayslips = createAsyncThunk(
  "hr/fetchPayslips",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get("/hr/payroll/payslips", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchActionPayslips = createAsyncThunk(
  "hr/fetchActionPayslips",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get("/hr/payroll/payslips", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Add fetchPublishStats thunk
export const fetchPublishStats = createAsyncThunk(
  "hr/fetchPublishStats",
  async ({ month, year, department_id }, { rejectWithValue }) => {
    try {
      const response = await axios.get("/hr/payroll/publish/stats", {
        params: { month, year, department_id },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const publishPayroll = createAsyncThunk(
  "hr/publishPayroll",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/hr/payroll/publish-payout", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const confirmPayout = createAsyncThunk(
  "hr/confirmPayout",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/hr/payroll/confirm-payout", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchHRDashboardStats = createAsyncThunk(
  "hr/fetchDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/hr/dashboard/stats");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const hrSlice = createSlice({
  name: "hr",
  initialState: {
    attendance: [],
    leaveBalances: [],
    salaryStructure: null,
    salaryGrades: [],
    payslips: [],
    status: "idle",
    error: null,
    operationStatus: "idle", // 'loading' during create/update
    operationError: null,
    payrollStats: {
      totalStaff: 0,
      configuredStaff: 0,
      totalDepartments: 0,
      readinessPercentage: 0,
    },
    dashboardStats: {
      metrics: {
        totalStaff: 0,
        presentToday: 0,
        onLeaveToday: 0,
        payrollTotal: 0,
        payrollConfigured: 0,
        readinessPercentage: 0,
      },
      workforceMix: [],
      attendanceTrend: [],
      pendingLeaves: [],
    },
    payrollPreview: [],
    actionPayslips: [],
  },
  reducers: {
    resetOperationStatus: (state) => {
      state.operationStatus = "idle";
      state.operationError = null;
    },
  },
  extraReducers: (builder) => {
    // Attendance
    builder
      .addCase(fetchStaffAttendance.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchStaffAttendance.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.attendance = action.payload.data;
        state.error = null;
      })
      .addCase(fetchStaffAttendance.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    builder
      .addCase(markStaffAttendance.pending, (state) => {
        state.operationStatus = "loading";
      })
      .addCase(markStaffAttendance.fulfilled, (state) => {
        state.operationStatus = "succeeded";
        state.operationError = null;
      })
      .addCase(markStaffAttendance.rejected, (state, action) => {
        state.operationStatus = "failed";
        state.operationError = action.payload;
      });

    // Leaves
    builder.addCase(fetchLeaveBalances.fulfilled, (state, action) => {
      state.leaveBalances = action.payload.data;
    });

    builder
      .addCase(applyLeave.pending, (state) => {
        state.operationStatus = "loading";
      })
      .addCase(applyLeave.fulfilled, (state) => {
        state.operationStatus = "succeeded";
      })
      .addCase(applyLeave.rejected, (state, action) => {
        state.operationStatus = "failed";
        state.operationError = action.payload;
      });

    // Action Payslips Preview (Read-only - don't trigger success banner)
    builder
      .addCase(fetchActionPayslips.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchActionPayslips.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.actionPayslips = action.payload.data || [];
      })
      .addCase(fetchActionPayslips.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    // Payroll
    builder
      .addCase(fetchSalaryStructure.fulfilled, (state, action) => {
        state.salaryStructure = action.payload.data;
      })
      .addCase(fetchSalaryStructure.rejected, (state) => {
        state.salaryStructure = null; // Reset if not found
      });

    builder.addCase(upsertSalaryStructure.fulfilled, (state, action) => {
      state.salaryStructure = action.payload.data;
      state.operationStatus = "succeeded";
    });

    builder.addCase(fetchPayslips.fulfilled, (state, action) => {
      state.payslips = action.payload.data || [];
    });

    builder
      .addCase(generatePayslip.pending, (state) => {
        state.operationStatus = "loading";
      })
      .addCase(generatePayslip.fulfilled, (state) => {
        state.operationStatus = "succeeded";
      })
      .addCase(generatePayslip.rejected, (state, action) => {
        state.operationStatus = "failed";
        state.operationError = action.payload;
      })
      .addCase(bulkGeneratePayslips.pending, (state) => {
        state.operationStatus = "loading";
      })
      .addCase(bulkGeneratePayslips.fulfilled, (state) => {
        state.operationStatus = "succeeded";
        state.operationError = null;
      })
      .addCase(bulkGeneratePayslips.rejected, (state, action) => {
        state.operationStatus = "failed";
        state.operationError = action.payload;
      });

    // Salary Grades
    builder.addCase(fetchSalaryGrades.fulfilled, (state, action) => {
      state.salaryGrades = action.payload.data || [];
    });

    builder
      .addCase(upsertSalaryGrade.pending, (state) => {
        state.operationStatus = "loading";
      })
      .addCase(upsertSalaryGrade.fulfilled, (state, action) => {
        state.operationStatus = "succeeded";
        // Optionally update the local list
        const index = state.salaryGrades.findIndex(
          (g) => g.id === action.payload.data.id
        );
        if (index !== -1) {
          state.salaryGrades[index] = action.payload.data;
        } else {
          state.salaryGrades.push(action.payload.data);
        }
      })
      .addCase(upsertSalaryGrade.rejected, (state, action) => {
        state.operationStatus = "failed";
        state.operationError = action.payload;
      });

    // Payroll Stats
    builder.addCase(fetchPayrollStats.fulfilled, (state, action) => {
      state.payrollStats = action.payload.data;
    });

    // Payroll Preview (Read-only - don't trigger success banner)
    builder
      .addCase(fetchBulkPayrollPreview.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBulkPayrollPreview.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.payrollPreview = action.payload.data;
      })
      .addCase(fetchBulkPayrollPreview.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    builder
      .addCase(publishPayroll.pending, (state) => {
        state.operationStatus = "loading";
      })
      .addCase(publishPayroll.fulfilled, (state) => {
        state.operationStatus = "succeeded";
        state.operationError = null;
      })
      .addCase(publishPayroll.rejected, (state, action) => {
        state.operationStatus = "failed";
        state.operationError = action.payload;
      })
      // Publish Stats
      .addCase(fetchPublishStats.pending, (state) => {
        state.status = "loading";
        state.publishStats = null;
        state.error = null;
      })
      .addCase(fetchPublishStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.publishStats = action.payload;
        state.error = null;
      })
      .addCase(fetchPublishStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Confirm Payout
      .addCase(confirmPayout.pending, (state) => {
        state.operationStatus = "loading";
      })
      .addCase(confirmPayout.fulfilled, (state) => {
        state.operationStatus = "succeeded";
        state.operationError = null;
      })
      .addCase(confirmPayout.rejected, (state, action) => {
        state.operationStatus = "failed";
        state.operationError = action.payload;
      });

    // HR Dashboard Stats
    builder
      .addCase(fetchHRDashboardStats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchHRDashboardStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.dashboardStats = action.payload.data;
        state.error = null;
      })
      .addCase(fetchHRDashboardStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetOperationStatus } = hrSlice.actions;
export default hrSlice.reducer;
