import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/api";

// ============================================
// BUILDINGS
// ============================================
export const fetchBuildings = createAsyncThunk(
  "hostel/fetchBuildings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/hostel/buildings");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const createBuilding = createAsyncThunk(
  "hostel/createBuilding",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/hostel/buildings", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const updateBuilding = createAsyncThunk(
  "hostel/updateBuilding",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/hostel/buildings/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const deleteBuilding = createAsyncThunk(
  "hostel/deleteBuilding",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/hostel/buildings/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

// ============================================
// ROOMS
// ============================================
export const fetchRooms = createAsyncThunk(
  "hostel/fetchRooms",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get("/hostel/rooms", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const fetchAvailableRooms = createAsyncThunk(
  "hostel/fetchAvailableRooms",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get("/hostel/rooms/available", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const createRoom = createAsyncThunk(
  "hostel/createRoom",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/hostel/rooms", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const updateRoom = createAsyncThunk(
  "hostel/updateRoom",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/hostel/rooms/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const updateRoomStatus = createAsyncThunk(
  "hostel/updateRoomStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/hostel/rooms/${id}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const deleteRoom = createAsyncThunk(
  "hostel/deleteRoom",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/hostel/rooms/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

// ============================================
// ALLOCATIONS
// ============================================
export const fetchStayHistory = createAsyncThunk(
  "hostel/fetchStayHistory",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/hostel/allocations/${id}/history`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const fetchAllocations = createAsyncThunk(
  "hostel/fetchAllocations",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get("/hostel/allocations", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const allocateStudent = createAsyncThunk(
  "hostel/allocateStudent",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/hostel/allocations", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const updateAllocation = createAsyncThunk(
  "hostel/updateAllocation",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/hostel/allocations/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const deleteAllocation = createAsyncThunk(
  "hostel/deleteAllocation",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/hostel/allocations/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const checkoutStudent = createAsyncThunk(
  "hostel/checkoutStudent",
  async (payload, { rejectWithValue }) => {
    try {
      const { id, checkout_type } =
        typeof payload === "object"
          ? payload
          : { id: payload, checkout_type: "current" };
      const response = await axios.post(`/hostel/allocations/${id}/checkout`, {
        checkout_type,
      });
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

// ============================================
// FEE STRUCTURES
// ============================================
export const fetchFeeStructures = createAsyncThunk(
  "hostel/fetchFeeStructures",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get("/hostel/fee-structures", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const createFeeStructure = createAsyncThunk(
  "hostel/createFeeStructure",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/hostel/fee-structures", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const updateFeeStructure = createAsyncThunk(
  "hostel/updateFeeStructure",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/hostel/fee-structures/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const deleteFeeStructure = createAsyncThunk(
  "hostel/deleteFeeStructure",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/hostel/fee-structures/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

// Mess Fee Structures
export const fetchMessFeeStructures = createAsyncThunk(
  "hostel/fetchMessFeeStructures",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get("/hostel/mess-fee-structures", {
        params,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const createMessFeeStructure = createAsyncThunk(
  "hostel/createMessFeeStructure",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/hostel/mess-fee-structures", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const updateMessFeeStructure = createAsyncThunk(
  "hostel/updateMessFeeStructure",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `/hostel/mess-fee-structures/${id}`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const deleteMessFeeStructure = createAsyncThunk(
  "hostel/deleteMessFeeStructure",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/hostel/mess-fee-structures/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

// ============================================
// COMPLAINTS
// ============================================
export const fetchComplaints = createAsyncThunk(
  "hostel/fetchComplaints",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get("/hostel/complaints", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const createComplaint = createAsyncThunk(
  "hostel/createComplaint",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/hostel/complaints", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const updateComplaint = createAsyncThunk(
  "hostel/updateComplaint",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/hostel/complaints/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

// ============================================
// ATTENDANCE
// ============================================
export const fetchAttendance = createAsyncThunk(
  "hostel/fetchAttendance",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get("/hostel/attendance", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const markAttendance = createAsyncThunk(
  "hostel/markAttendance",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/hostel/attendance", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

// ============================================
// GATE PASSES
// ============================================
export const fetchGatePasses = createAsyncThunk(
  "hostel/fetchGatePasses",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get("/hostel/gate-passes", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const createGatePass = createAsyncThunk(
  "hostel/createGatePass",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/hostel/gate-passes", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const markGatePassReturn = createAsyncThunk(
  "hostel/markGatePassReturn",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/hostel/gate-passes/${id}/return`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const updateGatePass = createAsyncThunk(
  "hostel/updateGatePass",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/hostel/gate-passes/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const verifyGatePassOtp = createAsyncThunk(
  "hostel/verifyGatePassOtp",
  async ({ id, otp }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/hostel/gate-passes/${id}/verify`, {
        otp,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const rejectGatePass = createAsyncThunk(
  "hostel/rejectGatePass",
  async ({ id, remarks }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/hostel/gate-passes/${id}/reject`, {
        remarks,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

// ============================================
// REPORTS
// ============================================
export const fetchOccupancyReport = createAsyncThunk(
  "hostel/fetchOccupancyReport",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/hostel/reports/occupancy");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const fetchDashboardStats = createAsyncThunk(
  "hostel/fetchDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/hostel/dashboard/stats");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const downloadReport = createAsyncThunk(
  "hostel/downloadReport",
  async ({ type, params }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/hostel/reports/download/${type}`, {
        params,
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${type}_report_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

// ============================================
// FINES
// ============================================
export const issueFine = createAsyncThunk(
  "hostel/issueFine",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/hostel/fines", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const fetchFines = createAsyncThunk(
  "hostel/fetchFines",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get("/hostel/fines", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const fetchStudentFines = createAsyncThunk(
  "hostel/fetchStudentFines",
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/hostel/students/${studentId}/fines`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const updateFine = createAsyncThunk(
  "hostel/updateFine",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/hostel/fines/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const deleteFine = createAsyncThunk(
  "hostel/deleteFine",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/hostel/fines/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

// ============================================
// ROOM BILLS
// ============================================
export const createRoomBill = createAsyncThunk(
  "hostel/createRoomBill",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/hostel/room-bills", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const distributeRoomBill = createAsyncThunk(
  "hostel/distributeRoomBill",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/hostel/room-bills/${id}/distribute`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const fetchRoomBills = createAsyncThunk(
  "hostel/fetchRoomBills",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get("/hostel/room-bills", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const fetchRoomHistory = createAsyncThunk(
  "hostel/fetchRoomHistory",
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/hostel/rooms/${roomId}/bills`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const updateRoomBill = createAsyncThunk(
  "hostel/updateRoomBill",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/hostel/room-bills/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const deleteRoomBill = createAsyncThunk(
  "hostel/deleteRoomBill",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/hostel/room-bills/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

// Bulk billing thunks
export const fetchRoomsForBilling = createAsyncThunk(
  "hostel/fetchRoomsForBilling",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get("/hostel/rooms/billing-view", {
        params,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const bulkCreateBills = createAsyncThunk(
  "hostel/bulkCreateBills",
  async (bills, { rejectWithValue }) => {
    try {
      const response = await axios.post("/hostel/room-bills/bulk-create", {
        bills,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const downloadBillingTemplate = createAsyncThunk(
  "hostel/downloadBillingTemplate",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get("/hostel/rooms/billing-template", {
        params,
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `room_billing_template_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      return { success: true };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

// ============================================
// SLICE
// ============================================
const hostelSlice = createSlice({
  name: "hostel",
  initialState: {
    buildings: [],
    rooms: [],
    roomsForBilling: [],
    availableRooms: [],
    allocations: [],
    feeStructures: [],
    messFeeStructures: [],
    complaints: [],
    attendance: [],
    gatePasses: [],
    stayHistory: [],
    occupancyReport: [],
    dashboardStats: null,
    fines: [],
    roomBills: [],
    status: "idle",
    operationStatus: "idle",
    error: null,
    operationError: null,
  },
  reducers: {
    resetOperationStatus(state) {
      state.operationStatus = "idle";
      state.operationError = null;
    },
  },
  extraReducers: (builder) => {
    // Buildings
    builder.addCase(fetchBuildings.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.buildings = action.payload.data;
    });

    builder
      .addCase(createBuilding.pending, (state) => {
        state.operationStatus = "loading";
      })
      .addCase(createBuilding.fulfilled, (state, action) => {
        state.operationStatus = "succeeded";
        state.buildings.push(action.payload.data);
      })
      .addCase(createBuilding.rejected, (state, action) => {
        state.operationStatus = "failed";
        state.operationError = action.payload;
      });

    builder
      .addCase(updateBuilding.pending, (state) => {
        state.operationStatus = "loading";
      })
      .addCase(updateBuilding.fulfilled, (state, action) => {
        state.operationStatus = "succeeded";
        const index = state.buildings.findIndex(
          (b) => b.id === action.payload.data.id,
        );
        if (index !== -1) {
          state.buildings[index] = action.payload.data;
        }
      })
      .addCase(updateBuilding.rejected, (state, action) => {
        state.operationStatus = "failed";
        state.operationError = action.payload;
      });

    builder
      .addCase(deleteBuilding.pending, (state) => {
        state.operationStatus = "loading";
      })
      .addCase(deleteBuilding.fulfilled, (state, action) => {
        state.operationStatus = "succeeded";
        state.buildings = state.buildings.filter(
          (b) => b.id !== action.payload.id,
        );
      })
      .addCase(deleteBuilding.rejected, (state, action) => {
        state.operationStatus = "failed";
        state.operationError = action.payload;
      });

    // Rooms
    builder.addCase(fetchRooms.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.rooms = action.payload.data;
    });

    builder.addCase(fetchAvailableRooms.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.availableRooms = action.payload.data;
    });

    builder
      .addCase(createRoom.pending, (state) => {
        state.operationStatus = "loading";
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.operationStatus = "succeeded";
        state.rooms.push(action.payload.data);
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.operationStatus = "failed";
        state.operationError = action.payload;
      });

    builder.addCase(updateRoom.fulfilled, (state, action) => {
      const index = state.rooms.findIndex(
        (r) => r.id === action.payload.data.id,
      );
      if (index !== -1) {
        state.rooms[index] = action.payload.data;
      }
    });

    builder.addCase(updateRoomStatus.fulfilled, (state, action) => {
      const index = state.rooms.findIndex(
        (r) => r.id === action.payload.data.id,
      );
      if (index !== -1) {
        state.rooms[index] = action.payload.data;
      }
    });

    builder.addCase(deleteRoom.fulfilled, (state, action) => {
      state.operationStatus = "succeeded";
      state.rooms = state.rooms.filter((r) => r.id !== action.payload.id);
    });

    // Allocations
    builder.addCase(fetchAllocations.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.allocations = action.payload.data;
    });

    builder
      .addCase(allocateStudent.pending, (state) => {
        state.operationStatus = "loading";
      })
      .addCase(allocateStudent.fulfilled, (state, action) => {
        state.operationStatus = "succeeded";
        state.allocations.push(action.payload.data);
      })
      .addCase(allocateStudent.rejected, (state, action) => {
        state.operationStatus = "failed";
        state.operationError = action.payload;
      });

    builder
      .addCase(updateAllocation.pending, (state) => {
        state.operationStatus = "loading";
      })
      .addCase(updateAllocation.fulfilled, (state, action) => {
        state.operationStatus = "succeeded";
        const index = state.allocations.findIndex(
          (a) => a.id === action.payload.data.id,
        );
        if (index !== -1) {
          state.allocations[index] = action.payload.data;
        }
      })
      .addCase(updateAllocation.rejected, (state, action) => {
        state.operationStatus = "failed";
        state.operationError = action.payload;
      });

    builder
      .addCase(deleteAllocation.pending, (state) => {
        state.operationStatus = "loading";
      })
      .addCase(deleteAllocation.fulfilled, (state, action) => {
        state.operationStatus = "succeeded";
        state.allocations = state.allocations.filter(
          (a) => a.id !== action.payload.id,
        );
      })
      .addCase(deleteAllocation.rejected, (state, action) => {
        state.operationStatus = "failed";
        state.operationError = action.payload;
      });

    builder.addCase(checkoutStudent.fulfilled, (state, action) => {
      const index = state.allocations.findIndex(
        (a) => a.id === action.payload.id,
      );
      if (index !== -1 && action.payload.data) {
        state.allocations[index] = action.payload.data;
      }
    });

    // Fee Structures
    builder.addCase(fetchFeeStructures.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.feeStructures = action.payload.data;
    });

    builder
      .addCase(createFeeStructure.pending, (state) => {
        state.operationStatus = "loading";
      })
      .addCase(createFeeStructure.fulfilled, (state, action) => {
        state.operationStatus = "succeeded";
        state.feeStructures.push(action.payload.data);
      })
      .addCase(createFeeStructure.rejected, (state, action) => {
        state.operationStatus = "failed";
        state.operationError = action.payload;
      });

    builder
      .addCase(updateFeeStructure.pending, (state) => {
        state.operationStatus = "loading";
      })
      .addCase(updateFeeStructure.fulfilled, (state, action) => {
        state.operationStatus = "succeeded";
        const index = state.feeStructures.findIndex(
          (f) => f.id === action.payload.data.id,
        );
        if (index !== -1) {
          state.feeStructures[index] = action.payload.data;
        }
      })
      .addCase(updateFeeStructure.rejected, (state, action) => {
        state.operationStatus = "failed";
        state.operationError = action.payload;
      });

    builder
      .addCase(deleteFeeStructure.pending, (state) => {
        state.operationStatus = "loading";
      })
      .addCase(deleteFeeStructure.fulfilled, (state, action) => {
        state.operationStatus = "succeeded";
        state.feeStructures = state.feeStructures.filter(
          (f) => f.id !== action.payload.id,
        );
      })
      .addCase(deleteFeeStructure.rejected, (state, action) => {
        state.operationStatus = "failed";
        state.operationError = action.payload;
      });

    // Mess Fee Structures
    builder.addCase(fetchMessFeeStructures.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.messFeeStructures = action.payload.data;
    });

    builder
      .addCase(createMessFeeStructure.pending, (state) => {
        state.operationStatus = "loading";
      })
      .addCase(createMessFeeStructure.fulfilled, (state, action) => {
        state.operationStatus = "succeeded";
        state.messFeeStructures.push(action.payload.data);
      })
      .addCase(createMessFeeStructure.rejected, (state, action) => {
        state.operationStatus = "failed";
        state.operationError = action.payload;
      });

    builder
      .addCase(updateMessFeeStructure.pending, (state) => {
        state.operationStatus = "loading";
      })
      .addCase(updateMessFeeStructure.fulfilled, (state, action) => {
        state.operationStatus = "succeeded";
        const index = state.messFeeStructures.findIndex(
          (m) => m.id === action.payload.data.id,
        );
        if (index !== -1) {
          state.messFeeStructures[index] = action.payload.data;
        }
      })
      .addCase(updateMessFeeStructure.rejected, (state, action) => {
        state.operationStatus = "failed";
        state.operationError = action.payload;
      });

    builder
      .addCase(deleteMessFeeStructure.pending, (state) => {
        state.operationStatus = "loading";
      })
      .addCase(deleteMessFeeStructure.fulfilled, (state, action) => {
        state.operationStatus = "succeeded";
        state.messFeeStructures = state.messFeeStructures.filter(
          (m) => m.id !== action.payload.id,
        );
      })
      .addCase(deleteMessFeeStructure.rejected, (state, action) => {
        state.operationStatus = "failed";
        state.operationError = action.payload;
      });

    // Complaints
    builder.addCase(fetchComplaints.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.complaints = action.payload.data;
    });

    builder
      .addCase(createComplaint.pending, (state) => {
        state.operationStatus = "loading";
      })
      .addCase(createComplaint.fulfilled, (state, action) => {
        state.operationStatus = "succeeded";
        state.complaints.push(action.payload.data);
      })
      .addCase(createComplaint.rejected, (state, action) => {
        state.operationStatus = "failed";
        state.operationError = action.payload;
      });

    builder
      .addCase(updateComplaint.pending, (state) => {
        state.operationStatus = "loading";
      })
      .addCase(updateComplaint.fulfilled, (state, action) => {
        state.operationStatus = "succeeded";
        const index = state.complaints.findIndex(
          (c) => c.id === action.payload.data.id,
        );
        if (index !== -1) {
          state.complaints[index] = action.payload.data;
        }
      })
      .addCase(updateComplaint.rejected, (state, action) => {
        state.operationStatus = "failed";
        state.operationError = action.payload;
      });

    // Attendance
    builder.addCase(fetchAttendance.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.attendance = action.payload.data;
    });

    builder.addCase(markAttendance.fulfilled, (state, action) => {
      state.attendance = action.payload.data;
      state.operationStatus = "succeeded";
    });

    // Gate Passes
    builder.addCase(fetchGatePasses.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.gatePasses = action.payload.data;
    });

    builder
      .addCase(createGatePass.pending, (state) => {
        state.operationStatus = "loading";
      })
      .addCase(createGatePass.fulfilled, (state, action) => {
        state.operationStatus = "succeeded";
        state.gatePasses.push(action.payload.data);
      })
      .addCase(createGatePass.rejected, (state, action) => {
        state.operationStatus = "failed";
        state.operationError = action.payload;
      });

    builder
      .addCase(markGatePassReturn.pending, (state) => {
        state.operationStatus = "loading";
      })
      .addCase(markGatePassReturn.fulfilled, (state, action) => {
        state.operationStatus = "succeeded";
        const index = state.gatePasses.findIndex(
          (g) => g.id === action.payload.data.id,
        );
        if (index !== -1) {
          state.gatePasses[index] = action.payload.data;
        }
      })
      .addCase(markGatePassReturn.rejected, (state, action) => {
        state.operationStatus = "failed";
        state.operationError = action.payload;
      });

    builder
      .addCase(updateGatePass.pending, (state) => {
        state.operationStatus = "loading";
      })
      .addCase(updateGatePass.fulfilled, (state, action) => {
        state.operationStatus = "succeeded";
        const index = state.gatePasses.findIndex(
          (g) => g.id === action.payload.data.id,
        );
        if (index !== -1) {
          state.gatePasses[index] = action.payload.data;
        }
      })
      .addCase(updateGatePass.rejected, (state, action) => {
        state.operationStatus = "failed";
        state.operationError = action.payload;
      });

    builder
      .addCase(verifyGatePassOtp.pending, (state) => {
        state.operationStatus = "loading";
      })
      .addCase(verifyGatePassOtp.fulfilled, (state, action) => {
        state.operationStatus = "succeeded";
        const index = state.gatePasses.findIndex(
          (g) => g.id === action.payload.data.id,
        );
        if (index !== -1) {
          state.gatePasses[index] = action.payload.data;
        }
      })
      .addCase(verifyGatePassOtp.rejected, (state, action) => {
        state.operationStatus = "failed";
        state.operationError = action.payload;
      });

    builder
      .addCase(rejectGatePass.pending, (state) => {
        state.operationStatus = "loading";
      })
      .addCase(rejectGatePass.fulfilled, (state, action) => {
        state.operationStatus = "succeeded";
        const index = state.gatePasses.findIndex(
          (g) => g.id === action.payload.data.id,
        );
        if (index !== -1) {
          state.gatePasses[index] = action.payload.data;
        }
      })
      .addCase(rejectGatePass.rejected, (state, action) => {
        state.operationStatus = "failed";
        state.operationError = action.payload;
      });

    // Reports
    builder
      .addCase(fetchOccupancyReport.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchOccupancyReport.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.occupancyReport = action.payload.data;
      })
      .addCase(fetchOccupancyReport.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.dashboardStats = action.payload.data;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    // Handle standard rejections for other thunks to ensure state.error is updated
    const commonRejections = [
      fetchBuildings,
      fetchRooms,
      deleteRoom,
      fetchAllocations,
      fetchComplaints,
      fetchFeeStructures,
      fetchMessFeeStructures,
      fetchAttendance,
      fetchGatePasses,
      fetchFines,
      fetchRoomBills,
    ];

    commonRejections.forEach((thunk) => {
      builder.addCase(thunk.pending, (state) => {
        state.status = "loading";
      });
      builder.addCase(thunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
    });

    // Fines reducers
    builder.addCase(fetchFines.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.fines = action.payload.fines || [];
    });

    builder.addCase(issueFine.pending, (state) => {
      state.operationStatus = "loading";
    });
    builder.addCase(issueFine.fulfilled, (state, action) => {
      state.operationStatus = "succeeded";
      state.fines.unshift(action.payload.fine);
    });
    builder.addCase(issueFine.rejected, (state, action) => {
      state.operationStatus = "failed";
      state.operationError = action.payload;
    });

    builder.addCase(updateFine.fulfilled, (state, action) => {
      const index = state.fines.findIndex(
        (f) => f.id === action.payload.fine.id,
      );
      if (index !== -1) {
        state.fines[index] = action.payload.fine;
      }
    });

    builder.addCase(deleteFine.fulfilled, (state, action) => {
      state.fines = state.fines.filter((f) => f.id !== action.payload.id);
    });

    // Room Bills reducers
    builder.addCase(fetchRoomBills.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.roomBills = action.payload.bills || [];
    });

    builder.addCase(createRoomBill.pending, (state) => {
      state.operationStatus = "loading";
    });
    builder.addCase(createRoomBill.fulfilled, (state, action) => {
      state.operationStatus = "succeeded";
      state.roomBills.unshift(action.payload.bill);
    });
    builder.addCase(createRoomBill.rejected, (state, action) => {
      state.operationStatus = "failed";
      state.operationError = action.payload;
    });

    builder.addCase(fetchRoomHistory.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(fetchRoomHistory.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.roomBills = action.payload.bills;
    });
    builder.addCase(fetchRoomHistory.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    });

    builder.addCase(distributeRoomBill.pending, (state) => {
      state.operationStatus = "loading";
    });
    builder.addCase(distributeRoomBill.fulfilled, (state, action) => {
      state.operationStatus = "succeeded";
      const index = state.roomBills.findIndex(
        (b) => b.id === action.payload.bill.id,
      );
      if (index !== -1) {
        state.roomBills[index] = action.payload.bill;
      }
    });
    builder.addCase(distributeRoomBill.rejected, (state, action) => {
      state.operationStatus = "failed";
      state.operationError = action.payload;
    });

    builder.addCase(updateRoomBill.fulfilled, (state, action) => {
      const index = state.roomBills.findIndex(
        (b) => b.id === action.payload.bill.id,
      );
      if (index !== -1) {
        state.roomBills[index] = action.payload.bill;
      }
    });

    builder.addCase(deleteRoomBill.fulfilled, (state, action) => {
      state.roomBills = state.roomBills.filter(
        (b) => b.id !== action.payload.id,
      );
    });

    // Bulk billing reducers
    builder.addCase(fetchRoomsForBilling.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(fetchRoomsForBilling.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.roomsForBilling = action.payload.rooms;
    });
    builder.addCase(fetchRoomsForBilling.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    });

    builder.addCase(bulkCreateBills.pending, (state) => {
      state.operationStatus = "loading";
    });
    builder.addCase(bulkCreateBills.fulfilled, (state, action) => {
      state.operationStatus = "succeeded";
      // Add new bills to roomBills array
      if (action.payload.bills) {
        state.roomBills = [...state.roomBills, ...action.payload.bills];
      }
    });
    builder.addCase(bulkCreateBills.rejected, (state, action) => {
      state.operationStatus = "failed";
      state.operationError = action.payload;
    });

    builder.addCase(downloadBillingTemplate.pending, (state) => {
      state.operationStatus = "loading";
    });
    builder.addCase(downloadBillingTemplate.fulfilled, (state) => {
      state.operationStatus = "succeeded";
    });
    builder.addCase(downloadBillingTemplate.rejected, (state, action) => {
      state.operationStatus = "failed";
      state.operationError = action.payload;
    });

    builder.addCase(fetchStayHistory.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.stayHistory = action.payload.data;
    });
  },
});

export const { resetOperationStatus } = hostelSlice.actions;
export default hostelSlice.reducer;
